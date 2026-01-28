/**
 * NovelAI v4/v4.5 Prompt Parser
 * Parses complex prompt syntax and converts to API format
 */

/**
 * Parse weight syntax: value::content::
 * Examples: 1.5::rain::, 0.5::coat::, -1::hat::
 */
function parseWeightedTag(tag) {
  const weightMatch = tag.match(/^(-?\d+(?:\.\d+)?)::(.*?)::$/);
  if (weightMatch) {
    const weight = parseFloat(weightMatch[1]);
    const content = weightMatch[2].trim();
    return { content, weight, isWeighted: true };
  }
  return { content: tag.trim(), weight: 1.0, isWeighted: false };
}

/**
 * Parse artist syntax: artist:name or [artist:name]
 */
function parseArtistTag(tag) {
  // artist:ciloranko
  if (tag.startsWith("artist:")) {
    return { type: "artist", name: tag.substring(7).trim() };
  }
  // [artist:name]
  const bracketMatch = tag.match(/^\[artist:(.*?)\]$/);
  if (bracketMatch) {
    return { type: "artist", name: bracketMatch[1].trim() };
  }
  return null;
}

/**
 * Parse position tags: {pos_xx}
 * Supports 5×5 grid (25 positions) as per NovelAI v4 spec
 * Format: {pos_[row][col]} where row=vertical, col=horizontal
 * Row: tt (far-top), t (top), c (center), b (bottom), bb (far-bottom)
 * Col: ll (far-left), l (left), c (center), r (right), rr (far-right)
 */
function parsePositionTag(tag) {
  const posMatch = tag.match(/^\{pos_([a-z]+)\}$/);
  if (posMatch) {
    const posMap = {
      // Row 1: tt (far-top, y=0.1)
      ttll: { x: 0.1, y: 0.1 }, // far-top far-left
      ttl: { x: 0.2, y: 0.1 }, // far-top left
      ttc: { x: 0.5, y: 0.1 }, // far-top center
      ttr: { x: 0.8, y: 0.1 }, // far-top right
      ttrr: { x: 0.9, y: 0.1 }, // far-top far-right

      // Row 2: t (top, y=0.3)
      tll: { x: 0.1, y: 0.3 }, // top far-left
      tl: { x: 0.2, y: 0.3 }, // top-left
      tc: { x: 0.5, y: 0.3 }, // top-center
      tr: { x: 0.8, y: 0.3 }, // top-right
      trr: { x: 0.9, y: 0.3 }, // top far-right

      // Row 3: c (center, y=0.5)
      cll: { x: 0.1, y: 0.5 }, // center far-left
      cl: { x: 0.2, y: 0.5 }, // center-left
      cc: { x: 0.5, y: 0.5 }, // center-center
      cr: { x: 0.8, y: 0.5 }, // center-right
      crr: { x: 0.9, y: 0.5 }, // center far-right

      // Row 4: b (bottom, y=0.7)
      bll: { x: 0.1, y: 0.7 }, // bottom far-left
      bl: { x: 0.2, y: 0.7 }, // bottom-left
      bc: { x: 0.5, y: 0.7 }, // bottom-center
      br: { x: 0.8, y: 0.7 }, // bottom-right
      brr: { x: 0.9, y: 0.7 }, // bottom far-right

      // Row 5: bb (far-bottom, y=0.9)
      bbll: { x: 0.1, y: 0.9 }, // far-bottom far-left
      bbl: { x: 0.2, y: 0.9 }, // far-bottom left
      bbc: { x: 0.5, y: 0.9 }, // far-bottom center
      bbr: { x: 0.8, y: 0.9 }, // far-bottom right
      bbrr: { x: 0.9, y: 0.9 }, // far-bottom far-right

      // Common shortcuts (aliases)
      c: { x: 0.5, y: 0.5 }, // = cc (center)
      t: { x: 0.5, y: 0.3 }, // = tc (top-center)
      b: { x: 0.5, y: 0.7 }, // = bc (bottom-center)
      l: { x: 0.2, y: 0.5 }, // = cl (center-left)
      r: { x: 0.8, y: 0.5 }, // = cr (center-right)
    };
    return posMap[posMatch[1]] || null;
  }
  return null;
}

/**
 * Parse character block: {char [tags] char}
 */
function parseCharacterBlock(text) {
  const charRegex = /\{char\s+([\s\S]*?)\s+char\}/g;
  const characters = [];
  let match;

  while ((match = charRegex.exec(text)) !== null) {
    let charContent = match[1].trim();
    const character = {
      prompt: "",
      uc: "",
      center: { x: 0.5, y: 0.5 },
      enabled: true,
    };

    // Parse ntags (support both bracket and non-bracket syntax)
    // ntags = [content] or ntags = content (can be multi-line)
    const ntagsMatch = charContent.match(
      /ntags\s*=\s*(?:\[([\s\S]*?)\]|([\s\S]*?)(?=char\}|$))/,
    );
    if (ntagsMatch) {
      // Get the content from either bracket or non-bracket capture group
      let ntagsContent = (ntagsMatch[1] || ntagsMatch[2] || "").trim();

      // Clean up the ntags content: remove extra whitespace, normalize commas
      ntagsContent = ntagsContent
        .split(/\s*,\s*/) // Split by comma
        .map((tag) => tag.trim()) // Trim each tag
        .filter((tag) => tag) // Remove empty tags
        .join(", "); // Join with normalized comma-space

      character.uc = ntagsContent;

      // Remove the entire ntags section from charContent
      // Match from 'ntags' to the end of its content (before 'char}' or end)
      charContent = charContent.replace(
        /ntags\s*=\s*[\s\S]*?(?=\{pos_|char\}|$)/g,
        "",
      );
    }

    // Split by lines and commas, then parse
    const lines = charContent
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter((l) => l);
    const promptParts = [];

    for (const line of lines) {
      // Skip empty lines or ntags remnants
      if (!line || line.startsWith("ntags")) continue;

      // Check for position
      const pos = parsePositionTag(line);
      if (pos) {
        character.center = pos;
        continue;
      }

      // Add to prompt
      promptParts.push(line);
    }

    character.prompt = promptParts.join(", ");
    characters.push(character);
  }

  return characters;
}

/**
 * Parse split character syntax: | description
 */
function parseSplitCharacters(text) {
  const lines = text.split("\n");
  const characters = [];
  let charIndex = 0;

  for (const line of lines) {
    if (line.trim().startsWith("|")) {
      const description = line.substring(1).trim();
      characters.push({
        prompt: description,
        uc: "",
        center: {
          x: 0.3 + charIndex * 0.2,
          y: 0.5,
        },
        enabled: true,
      });
      charIndex++;
    }
  }

  return characters;
}

/**
 * Parse text rendering: Text: content
 */
function parseTextTag(text) {
  const textMatch = text.match(/Text:\s*(.+)/);
  if (textMatch) {
    return textMatch[1].trim();
  }
  return null;
}

/**
 * Extract global ntags (outside of character blocks)
 * Supports syntax: {ntags = content}
 * Content can span multiple lines until the closing brace
 */
function extractGlobalNtags(text) {
  if (!text || !text.trim()) return "";

  // Remove all character blocks first to avoid matching ntags inside them
  let textWithoutChars = text.replace(/\{char[\s\S]*?char\}/g, "");

  // Remove incomplete character blocks
  textWithoutChars = textWithoutChars.replace(/\{char[\s\S]*$/g, "");

  // Match {ntags = content} syntax
  // The content can span multiple lines until the closing brace
  const braceMatch = textWithoutChars.match(/\{ntags\s*=\s*([\s\S]*?)\}/);
  if (braceMatch) {
    let ntagsContent = braceMatch[1].trim();

    // Remove any stray braces or brackets
    ntagsContent = ntagsContent.replace(/[{}\[\]]/g, "");

    // Clean up and normalize
    ntagsContent = ntagsContent
      .split(/\s*,\s*/)
      .map((tag) => tag.trim())
      .filter((tag) => tag && tag.length > 0)
      .join(", ");

    return ntagsContent;
  }

  return "";
}

/**
 * Optimize prompt by removing duplicates and capping extreme weights
 */
function optimizePrompt(text) {
  if (!text || !text.trim()) return text;

  // Split by comma
  const tags = text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  // Track seen tags (normalize for comparison)
  const seenTags = new Set();
  const optimizedTags = [];

  for (let tag of tags) {
    // Parse weighted tags
    const weightMatch = tag.match(/^(-?\d+(?:\.\d+)?)::(.*?)::$/);

    if (weightMatch) {
      let weight = parseFloat(weightMatch[1]);
      const content = weightMatch[2].trim();

      // Cap extreme weights (max 3.0, min -2.0)
      if (weight > 3.0) {
        console.warn(
          `[Prompt Optimizer] Capping weight ${weight} to 3.0 for tag: ${content}`,
        );
        weight = 3.0;
      } else if (weight < -2.0) {
        console.warn(
          `[Prompt Optimizer] Capping weight ${weight} to -2.0 for tag: ${content}`,
        );
        weight = -2.0;
      }

      // Normalize for duplicate detection (ignore weight differences)
      const normalizedTag = content.toLowerCase();

      if (!seenTags.has(normalizedTag)) {
        seenTags.add(normalizedTag);
        optimizedTags.push(`${weight}::${content}::`);
      } else {
        console.warn(`[Prompt Optimizer] Removing duplicate tag: ${tag}`);
      }
    } else {
      // Regular tag (no weight)
      const normalizedTag = tag.toLowerCase();

      if (!seenTags.has(normalizedTag)) {
        seenTags.add(normalizedTag);
        optimizedTags.push(tag);
      } else {
        console.warn(`[Prompt Optimizer] Removing duplicate tag: ${tag}`);
      }
    }
  }

  return optimizedTags.join(", ");
}

/**
 * Clean text by removing character blocks and special syntax
 */
function cleanPromptText(text) {
  if (!text || !text.trim()) return "";

  // Remove character blocks (complete blocks only)
  let cleaned = text.replace(/\{char[\s\S]*?char\}/g, "");

  // Remove incomplete character blocks (e.g., trailing {char without closing)
  cleaned = cleaned.replace(/\{char[\s\S]*$/g, "");

  // Remove global ntags with syntax: {ntags = ...}
  cleaned = cleaned.replace(/\{ntags\s*=\s*[\s\S]*?\}/g, "");

  // Remove incomplete ntags blocks
  cleaned = cleaned.replace(/\{ntags[\s\S]*$/g, "");

  // Remove split character lines
  cleaned = cleaned.replace(/^\s*\|.*$/gm, "");

  // Remove text rendering
  cleaned = cleaned.replace(/Text:\s*.+/g, "");

  // Remove any stray braces and brackets
  cleaned = cleaned.replace(/[{}\[\]]/g, "");

  // Clean up multiple commas and whitespace
  cleaned = cleaned.replace(/,\s*,+/g, ",");
  cleaned = cleaned.replace(/,\s*\n\s*,/g, ",");
  cleaned = cleaned.replace(/\n+/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ");

  // Remove leading/trailing commas and whitespace
  cleaned = cleaned.replace(/^[\s,]+|[\s,]+$/g, "");

  // Optimize: remove duplicates and cap extreme weights
  cleaned = optimizePrompt(cleaned);

  return cleaned;
}

/**
 * Main parser function
 * Converts complex prompt to API-compatible format
 */
export function parsePrompt(promptText, negativePrompt = "") {
  const result = {
    // Basic prompt (cleaned)
    prompt: "",
    negative_prompt: negativePrompt,

    // V4 character prompts (for characterPrompts field)
    characterPrompts: null,

    // V4 prompt format (for v4_prompt field)
    v4_prompt: null,

    // V4 negative prompt format (for v4_negative_prompt field)
    v4_negative_prompt: null,

    // Flags
    hasCharacters: false,
    hasWeights: false,
    hasText: false,
    use_coords: false,
  };

  if (!promptText || !promptText.trim()) {
    return result;
  }

  // Check for character blocks
  const characters = parseCharacterBlock(promptText);
  const splitChars = parseSplitCharacters(promptText);

  // Merge character arrays
  const allCharacters = [...characters, ...splitChars];

  if (allCharacters.length > 0) {
    result.hasCharacters = true;
    result.characterPrompts = allCharacters;
    result.use_coords = true;

    // Build v4_prompt format
    // Base caption should only contain global tags (scene, quality, artist, etc.)
    // Character-specific descriptions are in char_captions
    const baseCaption = cleanPromptText(promptText);
    const charCaptions = allCharacters.map((char) => ({
      char_caption: char.prompt,
      centers: [char.center],
    }));

    result.v4_prompt = {
      caption: {
        base_caption: baseCaption,
        char_captions: charCaptions,
      },
      use_coords: true,
      use_order: false,
    };

    // For backward compatibility, also set the prompt field to base caption
    result.prompt = baseCaption;
  } else {
    // No characters, use simple prompt
    result.prompt = cleanPromptText(promptText);
  }

  // Extract global negative tags and merge with provided negative prompt
  const globalNtags = extractGlobalNtags(promptText);

  // Combine global ntags with negative prompt (global ntags come first)
  const negativeParts = [];
  if (globalNtags) {
    negativeParts.push(globalNtags);
  }
  if (negativePrompt && negativePrompt.trim()) {
    negativeParts.push(negativePrompt.trim());
  }

  result.negative_prompt = negativeParts.join(", ");

  // Build v4_negative_prompt if needed
  if (result.hasCharacters) {
    // For v4 negative prompt, we need to include both global ntags and provided negative prompt
    const v4NegativeCaption = result.negative_prompt || "";

    result.v4_negative_prompt = {
      caption: {
        base_caption: v4NegativeCaption,
        char_captions: [],
      },
      legacy_uc: false,
    };
  }

  // Check for weighted tags
  result.hasWeights = /(-?\d+(?:\.\d+)?)::(.*?)::/.test(promptText);

  // Check for text rendering
  const textContent = parseTextTag(promptText);
  if (textContent) {
    result.hasText = true;
    // Add text tags to prompt if not already present
    if (!result.prompt.includes("text")) {
      result.prompt += ", text, english text";
    }
  }

  return result;
}

/**
 * Apply parsed prompt to config
 * Updates the config object with parsed values
 */
export function applyParsedPrompt(config, parsedPrompt) {
  // Set basic prompt
  if (parsedPrompt.prompt) {
    config.prompt = parsedPrompt.prompt;
  }

  // Set negative prompt
  if (parsedPrompt.negative_prompt) {
    config.negative_prompt = parsedPrompt.negative_prompt;
  }

  // Set character prompts for v4/v4.5
  if (parsedPrompt.hasCharacters) {
    config.characterPrompts = parsedPrompt.characterPrompts;
    config.v4_prompt = parsedPrompt.v4_prompt;
    config.v4_negative_prompt = parsedPrompt.v4_negative_prompt;
    config.use_coords = parsedPrompt.use_coords;
  } else {
    // Clear character-related fields if no characters
    config.characterPrompts = undefined;
    config.v4_prompt = undefined;
    config.v4_negative_prompt = undefined;
    config.use_coords = undefined;
  }

  return config;
}

/**
 * Build full prompt from prefix, main, suffix
 */
export function buildFullPrompt(prefix, main, suffix) {
  const parts = [];

  if (prefix && prefix.trim()) {
    parts.push(prefix.trim());
  }

  if (main && main.trim()) {
    parts.push(main.trim());
  }

  if (suffix && suffix.trim()) {
    parts.push(suffix.trim());
  }

  return parts.join(", ");
}

/**
 * Validate if model supports v4 features
 */
export function isV4Model(model) {
  const v4Models = [
    "nai-diffusion-4-full",
    "nai-diffusion-4-full-inpainting",
    "nai-diffusion-4-curated-preview",
    "nai-diffusion-4-curated-inpainting",
    "nai-diffusion-4-5-full",
    "nai-diffusion-4-5-full-inpainting",
    "nai-diffusion-4-5-curated",
    "nai-diffusion-4-5-curated-inpainting",
  ];

  return v4Models.includes(model);
}

/**
 * Validate multi-character request
 * Returns warnings array if issues found
 */
export function validateMultiCharacterRequest(parsed, model) {
  const warnings = [];

  if (!parsed.hasCharacters) {
    return warnings; // No validation needed for single character
  }

  // Check model support
  const supportsV4 = isV4Model(model);
  if (!supportsV4) {
    warnings.push(
      "Model does not support multi-character generation (v4/v4.5 required)",
    );
  }

  // Check character count
  if (parsed.characterPrompts && parsed.characterPrompts.length > 4) {
    warnings.push(
      `Too many characters (${parsed.characterPrompts.length}). NovelAI works best with 2-3 characters. More than 4 may cause timeouts or quality issues.`,
    );
  }

  // Check base prompt length
  if (parsed.prompt && parsed.prompt.length > 500) {
    warnings.push(
      `Base prompt is very long (${parsed.prompt.length} chars). Consider moving character-specific details into {char...char} blocks.`,
    );
  }

  // Check for duplicate quality tags in base prompt
  const qualityTags = [
    "masterpiece",
    "best quality",
    "amazing quality",
    "very aesthetic",
    "absurdres",
  ];
  const basePromptLower = (parsed.prompt || "").toLowerCase();
  const duplicates = qualityTags.filter((tag) => {
    const count = (basePromptLower.match(new RegExp(tag, "g")) || []).length;
    return count > 1;
  });

  if (duplicates.length > 0) {
    warnings.push(
      `Duplicate quality tags detected: ${duplicates.join(", ")}. These have been deduplicated.`,
    );
  }

  // Check for extreme weights
  const extremeWeights = (parsed.prompt || "").match(/(\d+(?:\.\d+)?)::/g);
  if (extremeWeights) {
    const highWeights = extremeWeights.filter((w) => parseFloat(w) > 3.0);
    if (highWeights.length > 0) {
      warnings.push(
        `Extreme weights detected (>${3.0}). These have been capped to 3.0 for stability.`,
      );
    }
  }

  // Check character prompt lengths
  if (parsed.characterPrompts) {
    parsed.characterPrompts.forEach((char, idx) => {
      if (char.prompt && char.prompt.length > 300) {
        warnings.push(
          `Character ${idx + 1} prompt is very long (${char.prompt.length} chars). This may affect generation quality.`,
        );
      }
    });
  }

  return warnings;
}

/**
 * Smart prompt builder
 * Automatically handles prefix/main/suffix and parsing
 */
export function smartBuildPrompt(prefix, main, suffix, negativePrompt, model) {
  // Build full prompt text
  const fullPromptText = buildFullPrompt(prefix, main, suffix);

  // Parse the full prompt
  const parsed = parsePrompt(fullPromptText, negativePrompt);

  // Validate multi-character request
  const warnings = validateMultiCharacterRequest(parsed, model);
  if (warnings.length > 0) {
    console.warn("[Prompt Validation] Issues detected:");
    warnings.forEach((w) => console.warn(`  - ${w}`));
    parsed.warnings = warnings;
  }

  // Check if model supports v4 features
  const supportsV4 = isV4Model(model);

  if (!supportsV4 && parsed.hasCharacters) {
    console.warn(
      "Character syntax detected but model does not support v4 features",
    );
    // Fall back to simple prompt
    return {
      prompt: fullPromptText,
      negative_prompt: negativePrompt,
      warnings: [
        "Model does not support multi-character generation. Falling back to simple prompt.",
      ],
    };
  }

  return parsed;
}
