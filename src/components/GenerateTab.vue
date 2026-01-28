<script setup>
import { computed, ref } from "vue";
import { Vision } from "@/libs/vision";
import { NovelAIUtils } from "@/libs/novel_ai_adapter.vue";
import {
  smartBuildPrompt,
  parsePrompt,
  isV4Model,
} from "@/libs/prompt_parser.js";

const { currentConfig, Model, Action, RESOLUTION_DIMENSIONS } = Vision();
const { handleGenerate } = NovelAIUtils();

const prompt = computed({
  get: () => currentConfig.value.prompt,
  set: (v) => (currentConfig.value.prompt = v),
});

const promptPrefix = computed({
  get: () => currentConfig.value.prompt_prefix,
  set: (v) => (currentConfig.value.prompt_prefix = v),
});

const promptSuffix = computed({
  get: () => currentConfig.value.prompt_suffix,
  set: (v) => (currentConfig.value.prompt_suffix = v),
});

const fullPrompt = computed(() => {
  const parts = [];
  if (promptPrefix.value && promptPrefix.value.trim()) {
    parts.push(promptPrefix.value.trim());
  }
  if (prompt.value && prompt.value.trim()) {
    parts.push(prompt.value.trim());
  }
  if (promptSuffix.value && promptSuffix.value.trim()) {
    parts.push(promptSuffix.value.trim());
  }
  return parts.join(", ");
});

const parsedPromptInfo = computed(() => {
  const fullText = fullPrompt.value;
  if (!fullText) return null;
  return parsePrompt(fullText, negativePrompt.value);
});

const supportsV4 = computed(() => {
  return isV4Model(model.value);
});

const negativePrompt = computed({
  get: () => currentConfig.value.negative_prompt,
  set: (v) => (currentConfig.value.negative_prompt = v),
});

const model = computed({
  get: () => currentConfig.value.model,
  set: (v) => (currentConfig.value.model = v),
});

const height = computed({
  get: () => currentConfig.value.height,
  set: (v) => (currentConfig.value.height = v),
});

const width = computed({
  get: () => currentConfig.value.width,
  set: (v) => (currentConfig.value.width = v),
});

const n_steps = computed({
  get: () => currentConfig.value.steps,
  set: (v) => (currentConfig.value.steps = v),
});

const seed = computed({
  get: () => currentConfig.value.seed,
  set: (v) => (currentConfig.value.seed = v),
});

const action = computed({
  get: () => currentConfig.value.action,
  set: (v) => (currentConfig.value.action = v),
});

const enabled_negative_prompt = computed({
  get: () => currentConfig.value.negative_prompt !== undefined,
  set: (enabled) => {
    if (!enabled) {
      currentConfig.value.negative_prompt = undefined;
    } else {
      currentConfig.value.negative_prompt = "";
    }
  },
});

const enabled_width = computed({
  get: () => currentConfig.value.width !== undefined,
  set: (enabled) => {
    if (!enabled) {
      currentConfig.value.width = undefined;
    } else {
      currentConfig.value.width = 832;
    }
  },
});

const enabled_height = computed({
  get: () => currentConfig.value.height !== undefined,
  set: (enabled) => {
    if (!enabled) {
      currentConfig.value.height = undefined;
    } else {
      currentConfig.value.height = 1216;
    }
  },
});

const enabled_steps = computed({
  get: () => currentConfig.value.steps !== undefined,
  set: (enabled) => {
    if (!enabled) {
      currentConfig.value.steps = undefined;
    } else {
      currentConfig.value.steps = 28;
    }
  },
});

const enabled_seed = computed({
  get: () => currentConfig.value.seed !== undefined,
  set: (enabled) => {
    if (!enabled) {
      currentConfig.value.seed = undefined;
    } else {
      currentConfig.value.seed = -1;
    }
  },
});

const isGernerating = ref(false);
const currentImage = ref(null);

const emit = defineEmits(["image-generated"]);

async function handleGeneration() {
  isGernerating.value = true;

  try {
    const parsed = smartBuildPrompt(
      promptPrefix.value,
      prompt.value,
      promptSuffix.value,
      negativePrompt.value,
      model.value,
    );

    console.log("Parsed prompt:", parsed);

    if (parsed.warnings && parsed.warnings.length > 0) {
      console.warn("[ST Vision] Validation warnings:");
      parsed.warnings.forEach((w) => console.warn(`  - ${w}`));
    }

    const tempConfig = JSON.parse(JSON.stringify(currentConfig.value));

    if (parsed.hasCharacters && supportsV4.value) {
      tempConfig.prompt = parsed.prompt || fullPrompt.value;
      tempConfig.negative_prompt = parsed.negative_prompt;
      tempConfig.characterPrompts = parsed.characterPrompts;
      tempConfig.v4_prompt = parsed.v4_prompt;
      tempConfig.v4_negative_prompt = parsed.v4_negative_prompt;
      tempConfig.use_coords = parsed.use_coords;
    } else {
      tempConfig.prompt = fullPrompt.value;
      tempConfig.negative_prompt = negativePrompt.value;
      tempConfig.characterPrompts = undefined;
      tempConfig.v4_prompt = undefined;
      tempConfig.v4_negative_prompt = undefined;
    }

    const originalConfig = JSON.parse(JSON.stringify(currentConfig.value));
    Object.assign(currentConfig.value, tempConfig);

    try {
      const image = await handleGenerate();
      console.log(image);
      currentImage.value = image.dataURL;
      emit("image-generated", image.dataURL);
      console.log("image generated");
    } finally {
      Object.assign(currentConfig.value, originalConfig);
    }
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  } finally {
    isGernerating.value = false;
  }
}

function downloadImage() {
  if (!currentImage.value) {
    return;
  }

  const link = document.createElement("a");
  link.href = currentImage.value;
  link.download = `st-vision-${Date.now()}.png`;
  link.click();
}

async function copyImage() {
  if (!currentImage.value) {
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const response = await fetch(currentImage.value);
      const blob = await response.blob();
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);
      console.log("Image copied to clipboard!");
      return;
    }

    await navigator.clipboard.writeText(currentImage.value);
    console.log("Image URL copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy image:", error);
    console.log("Failed to copy image. Please try again.");
  }
}
</script>

<template>
  <div class="vision_tab_content">
    <!-- Prompt Section -->
    <div class="vision_section">
      <h3><i class="fa-solid fa-pen-fancy"></i> Prompt</h3>

      <!-- Prompt Prefix -->
      <div class="vision_form_group">
        <label for="vision_prompt_prefix">
          Prompt Prefix
          <span class="vision_help_text">(Quality tags, style tags, etc.)</span>
        </label>
        <textarea
          id="vision_prompt_prefix"
          v-model="promptPrefix"
          rows="2"
          :disabled="isGernerating"
          placeholder="masterpiece, best quality, high resolution, "
        ></textarea>
      </div>

      <!-- Main Prompt -->
      <div class="vision_form_group">
        <label for="vision_prompt">
          Main Prompt
          <span class="vision_help_text"
            >(Describe what you want to generate)</span
          >
        </label>
        <textarea
          id="vision_prompt"
          v-model="prompt"
          rows="4"
          :disabled="isGernerating"
          placeholder="1boy, luffy, anime style, detailed background, "
        ></textarea>
      </div>

      <!-- Prompt Suffix -->
      <div class="vision_form_group">
        <label for="vision_prompt_suffix">
          Prompt Suffix
          <span class="vision_help_text"
            >(Additional details, lighting, etc.)</span
          >
        </label>
        <textarea
          id="vision_prompt_suffix"
          v-model="promptSuffix"
          rows="2"
          :disabled="isGernerating"
          placeholder="cinematic lighting, detailed, vibrant colors, "
        ></textarea>
      </div>

      <!-- Negative Prompt -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_negative_prompt"
            v-model="enabled_negative_prompt"
            type="checkbox"
          />
          <label for="vision_enabled_negative_prompt">
            Negative Prompt
            <span class="vision_help_text"
              >(What to avoid in the generation)</span
            >
          </label>
        </div>
        <textarea
          id="vision_negative_prompt"
          v-model="negativePrompt"
          :disabled="!enabled_negative_prompt"
          rows="3"
          placeholder="nsfw, lowres, bad anatomy, bad hands, "
        ></textarea>
      </div>

      <!-- Model Selection -->
      <div class="vision_form_group">
        <label for="vision_model">Model</label>
        <select id="vision_model" v-model="model">
          <option v-for="model_type in Model">{{ model_type }}</option>
        </select>
      </div>

      <!-- Action -->
      <div class="vision_form_group">
        <label for="vision_action">Action</label>
        <select id="vision_action" v-model="action">
          <option v-for="action_type in Action" :value="action_type">
            {{ action_type }}
          </option>
        </select>
      </div>

      <!-- Quick Settings -->
      <div class="vision_form_row">
        <div class="vision_form_group">
          <div class="vision_checkbox_group">
            <input
              id="vision_enabled_width_quick"
              v-model="enabled_width"
              type="checkbox"
            />
            <label for="vision_enabled_width_quick">Width</label>
          </div>
          <input
            id="vision_width_quick"
            v-model="width"
            type="number"
            min="64"
            max="2048"
            step="64"
            :disabled="!enabled_width"
          />
        </div>
        <div class="vision_form_group">
          <div class="vision_checkbox_group">
            <input
              id="vision_enabled_height_quick"
              v-model="enabled_height"
              type="checkbox"
            />
            <label for="vision_enabled_height_quick">Height</label>
          </div>
          <input
            id="vision_height_quick"
            v-model="height"
            type="number"
            min="64"
            max="2048"
            step="64"
            :disabled="!enabled_height"
          />
        </div>
      </div>

      <!-- Steps -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_steps_quick"
            v-model="enabled_steps"
            type="checkbox"
          />
          <label for="vision_enabled_steps_quick">Steps</label>
        </div>
        <input
          id="vision_steps_quick"
          v-model="n_steps"
          type="number"
          :disabled="!enabled_steps"
        />
      </div>

      <!-- Seed -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_seed_quick"
            v-model="enabled_seed"
            type="checkbox"
          />
          <label for="vision_enabled_seed_quick">
            Seed
            <span class="vision_help_text">(-1 for random)</span>
          </label>
        </div>
        <input
          id="vision_seed_quick"
          v-model="seed"
          type="number"
          :disabled="!enabled_seed"
        />
      </div>
    </div>

    <!-- Generate Button and Result -->
    <div class="vision_section">
      <div class="vision_button_group">
        <button
          class="vision_button primary"
          @click="handleGeneration"
          :disabled="isGernerating"
        >
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          {{ isGernerating ? "Generating..." : "Generate" }}
        </button>
      </div>

      <!-- Result Container -->
      <div v-show="currentImage" class="vision_result_container">
        <div class="vision_result_wrapper">
          <img :src="currentImage" alt="Generated Image" />
          <div class="vision_result_actions">
            <button class="vision_button" @click="downloadImage">
              <i class="fa-solid fa-download"></i> Download
            </button>
            <button class="vision_button" @click="copyImage">
              <i class="fa-solid fa-copy"></i> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vision_tab_content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vision_section {
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  background: var(--st-vision-bg-light, var(--bg-secondary, #242438));
}

.vision_section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--st-vision-text, var(--text-primary, #eee));
  font-size: 1.1em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vision_section h3 i {
  color: var(--st-vision-primary, #667eea);
}

.vision_form_group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.vision_form_group label {
  font-size: 0.95em;
  font-weight: 500;
  color: var(--st-vision-text, var(--text-primary, #eee));
}

.vision_form_group input[type="text"],
.vision_form_group input[type="number"],
.vision_form_group select,
.vision_form_group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 6px;
  background-color: var(--st-vision-bg, var(--bg-primary, #1a1a2e));
  color: var(--st-vision-text, var(--text-primary, #eee));
  font-size: 0.95em;
  transition: border-color 0.2s ease;
}

.vision_form_group input:focus,
.vision_form_group select:focus,
.vision_form_group textarea:focus {
  outline: none;
  border-color: var(--st-vision-primary, #667eea);
}

.vision_form_group textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.vision_form_row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.vision_form_row > * {
  flex: 1;
}

.vision_help_text {
  font-size: 0.85em;
  color: var(--st-vision-text-muted, var(--text-secondary, #888));
  font-style: italic;
}

.vision_checkbox_group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.vision_checkbox_group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--st-vision-primary, #667eea);
}

.vision_checkbox_group label {
  cursor: pointer;
  user-select: none;
}

.vision_button_group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.vision_button {
  padding: 10px 18px;
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 6px;
  background-color: var(--st-vision-bg, var(--bg-primary, #1a1a2e));
  color: var(--st-vision-text, var(--text-primary, #eee));
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.vision_button:hover:not(:disabled) {
  background-color: var(--st-vision-bg-hover, var(--bg-secondary, #242438));
  border-color: var(--st-vision-primary, #667eea);
}

.vision_button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vision_button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
}

.vision_button.primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.vision_result_container {
  margin-top: 20px;
}

.vision_result_wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.vision_result_wrapper img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 10px;
  border: 2px solid var(--st-vision-border, var(--border-color, #333));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.vision_result_actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .vision_form_row {
    flex-direction: column;
    gap: 10px;
  }

  .vision_button_group {
    flex-direction: column;
    gap: 10px;
  }

  .vision_button_group .vision_button {
    width: 100%;
  }

  .vision_result_wrapper img {
    max-height: 300px;
  }
}
</style>
