<script>
import {
  NovelAI,
  parseImage as nekoParse,
  EventType as NekoEventType,
} from "nekoai-js";
import { Action, EventType } from "../libs/state.vue";
import { Vision } from "./vision.js";

async function parseImage(input) {
  return await nekoParse(input);
}

function mapEventType(nekoEventType) {
  if (nekoEventType === NekoEventType.INTERMEDIATE) {
    return EventType.INTERMEDIATE;
  } else if (nekoEventType === NekoEventType.FINAL) {
    return EventType.FINAL;
  }
  return nekoEventType;
}

async function imageToDataURL(nekoImage) {
  if (nekoImage.toDataURL) {
    return nekoImage.toDataURL();
  }
  throw new Error("Unable to convert image to data URL");
}

export function NovelAIUtils() {
  function getClient(config) {
    if (!config.token) {
      throw new Error(
        "NovelAI token is not configured. Please set your token in the settings.",
      );
    }

    // Configure client with timeout and retry settings
    return new NovelAI({
      token: config.token,
      host: config.host,
      timeout: config.timeout || 120000, // 120 seconds default (image generation can take time)
      retry: {
        enabled: true,
        maxRetries: 3,
        baseDelay: 2000, // 2 seconds
        maxDelay: 30000, // 30 seconds
        retryStatusCodes: [429, 500, 502, 503, 504], // Retry on rate limit and server errors
      },
      verbose: true, // Enable verbose logging for debugging
    });
  }

  async function generateImage(params = {}, streaming = false) {
    console.log("[ST Vision] Streaming:", streaming);
    const { currentConfig } = Vision();
    const config = currentConfig.value;
    const client = getClient(config);

    // Determine action - only include for img2img/inpaint, not for regular generation
    const action = params.action || Action.GENERATE;
    const isImg2Img = action === Action.IMG2IMG;
    const isInpaint = action === Action.INPAINT;

    // Build request parameters for nekoai-js
    const requestParams = {
      prompt: params.prompt || config.prompt,
      model: params.model || config.model,
      width: params.width || config.width,
      height: params.height || config.height,
      // Convert scale to number if it's a string
      scale: (() => {
        const scaleValue =
          params.scale !== undefined ? params.scale : config.scale;
        if (typeof scaleValue === "string") {
          const parsed = parseFloat(scaleValue);
          return isNaN(parsed) ? 5.0 : parsed; // Default to 5.0 if parsing fails
        }
        return scaleValue;
      })(),
      sampler: params.sampler || config.sampler,
      steps: params.steps || config.steps,
      n_samples: params.n_samples || config.n_samples,
      negative_prompt: params.negative_prompt || config.negative_prompt,
    };

    // Only include action for img2img/inpaint
    if (isImg2Img || isInpaint) {
      requestParams.action = action;
    }

    // Handle seed
    const seedValue = params.seed !== undefined ? params.seed : config.seed;
    if (seedValue !== undefined && seedValue !== -1) {
      requestParams.seed = seedValue;
    }

    // Additional parameters from config - only include if they have valid values
    // Note: Some parameters might not be supported by nekoai-js, but we'll include them
    // and let the library handle validation
    if (config.sm !== undefined) requestParams.sm = config.sm;
    if (config.sm_dyn !== undefined) requestParams.sm_dyn = config.sm_dyn;
    if (config.dynamic_thresholding !== undefined)
      requestParams.dynamic_thresholding = config.dynamic_thresholding;
    if (config.controlnet_strength !== undefined)
      requestParams.controlnet_strength = config.controlnet_strength;
    if (config.legacy !== undefined) requestParams.legacy = config.legacy;
    if (config.add_original_image !== undefined)
      requestParams.add_original_image = config.add_original_image;
    if (config.noise_schedule)
      requestParams.noise_schedule = config.noise_schedule;

    // Handle img2img specific parameters
    if (isImg2Img) {
      if (params.image) requestParams.image = params.image;
      if (params.strength !== undefined)
        requestParams.strength = params.strength;
      if (params.noise !== undefined) requestParams.noise = params.noise;
    }

    // Handle inpaint specific parameters
    if (isInpaint) {
      if (params.image) requestParams.image = params.image;
      if (params.mask) requestParams.mask = params.mask;
    }

    // Handle V4/V4.5 multi-character features
    if (params.characterPrompts && params.characterPrompts.length > 0) {
      // Clean up characterPrompts - params.characterPrompts should already be cleaned
      requestParams.characterPrompts = params.characterPrompts;
      console.log(
        "[ST Vision] Adding characterPrompts to request:",
        JSON.parse(JSON.stringify(requestParams.characterPrompts)),
      );
    }

    // Handle v4_prompt structure (required for proper multi-character generation)
    if (params.v4_prompt) {
      requestParams.v4_prompt = params.v4_prompt;
      console.log(
        "[ST Vision] Adding v4_prompt to request:",
        JSON.parse(JSON.stringify(requestParams.v4_prompt)),
      );
    }

    // Handle v4_negative_prompt structure
    if (params.v4_negative_prompt) {
      requestParams.v4_negative_prompt = params.v4_negative_prompt;
      console.log(
        "[ST Vision] Adding v4_negative_prompt to request:",
        JSON.parse(JSON.stringify(requestParams.v4_negative_prompt)),
      );
    }

    console.log("[ST Vision] Generating with nekoai-js:", requestParams);

    // Generate image
    const result = await client.generateImage(requestParams, streaming);

    // Handle streaming response
    if (
      streaming &&
      result &&
      typeof result[Symbol.asyncIterator] === "function"
    ) {
      // Return async iterator that maps events
      return (async function* () {
        for await (const event of result) {
          const dataURL = await imageToDataURL(event.image);
          yield {
            event_type: mapEventType(event.event_type),
            step_ix: event.step_ix,
            image: {
              dataURL,
              base64: event.image.base64,
            },
          };
        }
      })();
    }

    // Handle non-streaming response
    if (Array.isArray(result)) {
      const images = await Promise.all(
        result.map(async (img) => {
          const dataURL = await imageToDataURL(img);
          return {
            dataURL,
            filename: img.filename,
          };
        }),
      );
      console.log(images[0]);
      return images;
    }

    throw new Error("Unexpected response format from nekoai-js");
  }

  async function handleGenerate() {
    const { currentConfig } = Vision();
    const config = currentConfig.value;
    const prompt = config.prompt;

    if (!prompt) {
      throw new Error("Please enter a prompt");
    }

    if (!config.token) {
      throw new Error("Please configure your NovelAI token in settings");
    }
    try {
      const params = {
        prompt,
        model: config.model,
        width: config.width,
        height: config.height,
        steps: config.steps,
        scale: config.scale,
        sampler: config.sampler,
        seed: config.seed,
        negative_prompt: config.negative_prompt,
        sm: config.sm,
        sm_dyn: config.sm_dyn,
      };

      // Add V4/V4.5 multi-character features
      if (config.characterPrompts && config.characterPrompts.length > 0) {
        // Include all enabled characters
        const enabledChars = config.characterPrompts
          .filter((char) => char.enabled !== false)
          .map((char) => {
            const charData = {
              prompt: char.prompt,
              uc: char.uc,
            };
            // Only include center if useCustomPosition is true
            // If not included, nekoai-js will add default {x: 0.5, y: 0.5}
            // and set use_coords=false (auto layout)
            if (char.useCustomPosition === true && char.center) {
              charData.center = char.center;
            }
            return charData;
          });

        if (enabledChars.length > 0) {
          params.characterPrompts = enabledChars;
          console.log(
            "[ST Vision] Raw config.characterPrompts:",
            JSON.parse(JSON.stringify(config.characterPrompts)),
          );
          console.log(
            "[ST Vision] Processed characterPrompts for nekoai-js:",
            JSON.parse(JSON.stringify(enabledChars)),
          );
        }
      }

      // Add v4_prompt structure if available
      if (config.v4_prompt) {
        params.v4_prompt = config.v4_prompt;
      }

      // Add v4_negative_prompt structure if available
      if (config.v4_negative_prompt) {
        params.v4_negative_prompt = config.v4_negative_prompt;
      }

      const streaming = config.enableStreaming;

      if (streaming) {
        const response = await generateImage(params, true);

        if (response && typeof response[Symbol.asyncIterator] === "function") {
          let finalImage = null;

          for await (const event of response) {
            if (event.event_type === EventType.INTERMEDIATE) {
              // setCurrentImage(event.image.dataURL, true);
            } else if (event.event_type === EventType.FINAL) {
              finalImage = event.image;
              // setCurrentImage(event.image.dataURL, false);
            }
          }

          if (finalImage) {
            return finalImage;
          }
        }
      } else {
        const result = await generateImage(params, false);

        if (Array.isArray(result) && result.length > 0) {
          const image = result[0];
          return image;
        }
      }
    } finally {
    }
  }

  /**
   * Director Tools
   */
  async function directorTool(tool, image, params = {}) {
    const { currentConfig } = Vision();
    const config = currentConfig.value;
    const client = getClient(config);
    const toolMap = {
      "line-art": "lineArt",
      "bg-removal": "backgroundRemoval",
      emotion: "changeEmotion",
      declutter: "declutter",
      colorize: "colorize",
    };

    const methodName = toolMap[tool];
    if (!methodName || !client[methodName]) {
      throw new Error(`Unknown director tool: ${tool}`);
    }

    let result;
    if (tool === "emotion") {
      result = await client.changeEmotion(
        image,
        params.emotion || "happy",
        params.prompt || "",
        params.defry || 0,
      );
    } else if (tool === "declutter") {
      result = await client.declutter(
        image,
        params.prompt || "",
        params.defry || 0,
      );
    } else if (tool === "colorize") {
      result = await client.colorize(
        image,
        params.prompt || "",
        params.defry || 1,
      );
    } else {
      result = await client[methodName](image);
    }

    const dataURL = await imageToDataURL(result);
    return {
      dataURL,
      base64: result.base64,
    };
  }

  const lineArt = (image) => directorTool("line-art", image);
  const backgroundRemoval = (image) => directorTool("bg-removal", image);
  const changeEmotion = (image, emotion, prompt = "", defry = 0) =>
    directorTool("emotion", image, { emotion, prompt, defry });
  const declutter = (image, prompt = "", defry = 0) =>
    directorTool("declutter", image, { prompt, defry });
  const colorize = (image, prompt = "", defry = 1) =>
    directorTool("colorize", image, { prompt, defry });

  return {
    generateImage,
    handleGenerate,
    lineArt,
    backgroundRemoval,
    changeEmotion,
    declutter,
    colorize,
    parseImage,
  };
}
</script>
