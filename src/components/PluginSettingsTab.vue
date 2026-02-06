<script setup>
import { computed, watch } from "vue";
import { Vision } from "@/libs/vision";

const {
  state,
  currentConfig,
  Host,
  saveState,
  THEMES,
  currentTheme,
  applyTheme,
} = Vision();

const token = computed({
  get: () => currentConfig.value.token,
  set: (v) => (currentConfig.value.token = v),
});

const host = computed({
  get: () => currentConfig.value.host,
  set: (v) => (currentConfig.value.host = v),
});

const timeout = computed({
  get: () => currentConfig.value.timeout,
  set: (v) => (currentConfig.value.timeout = v),
});

const currentThemeName = computed({
  get: () => state.theme?.current || "dark",
  set: async (value) => {
    console.log("[ST Vision] Theme changed to:", value);
    if (!state.theme) {
      state.theme = { current: value };
    } else {
      state.theme.current = value;
    }
    applyTheme(value);
    try {
      await saveState();
      console.log("[ST Vision] Theme saved successfully");
    } catch (error) {
      console.error("[ST Vision] Failed to save theme:", error);
    }
  },
});

watch(
  () => state.theme?.current,
  (newTheme) => {
    if (newTheme) {
      applyTheme(newTheme);
    }
  },
  { immediate: true },
);

function getThemeDescription(themeName) {
  const descriptions = {
    dark: "Dark theme provides a comfortable viewing experience in low-light environments.",
    light:
      "Light theme offers a clean and bright interface for well-lit environments.",
    blue: "Blue theme features cool blue tones for a calming and professional look.",
    green:
      "Green theme uses natural green colors for a fresh and vibrant appearance.",
    purple:
      "Purple theme showcases rich purple hues for a creative and elegant feel.",
    red: "Red theme displays bold red accents for a passionate and energetic vibe.",
    orange:
      "Orange theme features warm orange tones for a friendly and inviting atmosphere.",
    pink: "Pink theme uses soft pink colors for a playful and modern aesthetic.",
    cyan: "Cyan theme showcases bright cyan shades for a fresh and tech-forward look.",
    teal: "Teal theme combines blue and green for a balanced and sophisticated style.",
    indigo:
      "Indigo theme features deep indigo colors for a mysterious and premium feel.",
    amber:
      "Amber theme uses golden amber tones for a warm and luxurious appearance.",
    emerald:
      "Emerald theme displays rich emerald greens for a natural and elegant vibe.",
    auto: "Auto theme automatically switches between dark and light based on your system preferences.",
  };
  return descriptions[themeName] || descriptions.dark;
}

function openImageHistory() {
  window.dispatchEvent(new CustomEvent("st-vision-show-history"));
}

const emit = defineEmits([
  "rename-config",
  "duplicate-config",
  "delete-config",
  "export-config",
  "import-config",
]);
</script>

<template>
  <div class="vision_tab_content">
    <!-- API Configuration -->
    <div class="vision_section">
      <h3><i class="fa-solid fa-key"></i> API Configuration</h3>

      <div class="vision_form_group">
        <label for="vision_plugin_token">
          NovelAI Token *
          <span class="vision_help_text"
            >(Required - Get your token from NovelAI account settings)</span
          >
        </label>
        <input
          id="vision_plugin_token"
          v-model="token"
          type="password"
          placeholder="Enter your NovelAI access token"
        />
      </div>

      <div class="vision_form_group">
        <label for="vision_plugin_host">API Host</label>
        <select id="vision_plugin_host" v-model="host">
          <option :value="Host.WEB">Web Host (Default)</option>
          <option :value="Host.API">API Host</option>
        </select>
      </div>

      <div class="vision_form_group">
        <label for="vision_plugin_timeout">
          Request Timeout (ms)
          <span class="vision_help_text"
            >(Increase if you get timeout errors, default: 120000ms = 2
            minutes)</span
          >
        </label>
        <input
          id="vision_plugin_timeout"
          v-model.number="timeout"
          type="number"
          min="30000"
          max="600000"
          step="10000"
          placeholder="120000"
        />
      </div>
    </div>

    <!-- Configuration Management -->
    <div class="vision_section">
      <h3><i class="fa-solid fa-folder"></i> Configuration Management</h3>

      <div class="vision_form_group">
        <label for="vision_plugin_config_select">Current Configuration</label>
        <div class="vision_button_group">
          <select
            id="vision_plugin_config_select"
            v-model="state.currentConfigName"
            style="flex: 1"
          >
            <option
              v-for="cfg in Object.keys(state.configs)"
              :key="cfg"
              :value="cfg"
            >
              {{ cfg }}
            </option>
          </select>
        </div>
      </div>

      <div class="vision_button_group">
        <button class="vision_button" @click="emit('rename-config')">
          <i class="fa-solid fa-edit"></i> Rename
        </button>
        <button class="vision_button" @click="emit('duplicate-config')">
          <i class="fa-solid fa-clone"></i> Duplicate
        </button>
        <button class="vision_button" @click="emit('delete-config')">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
        <button class="vision_button" @click="emit('export-config')">
          <i class="fa-solid fa-download"></i> Export
        </button>
        <button class="vision_button" @click="emit('import-config')">
          <i class="fa-solid fa-upload"></i> Import
        </button>
      </div>
    </div>

    <!-- Chat Image Generation Settings -->
    <div class="vision_section">
      <h3><i class="fa-solid fa-comments"></i> Chat Image Generation</h3>
      <p class="vision_help_text" style="margin-bottom: 15px">
        Configure automatic image generation in chat messages. Use custom tags
        to trigger image generation.
      </p>

      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_chat_image_enabled"
            v-model="state.chatImageGen.enabled"
            type="checkbox"
          />
          <label for="vision_chat_image_enabled">
            Enable Chat Image Generation
            <span class="vision_help_text"
              >(Automatically detect and generate images from chat
              messages)</span
            >
          </label>
        </div>
      </div>

      <div class="vision_form_group">
        <label for="vision_chat_tag_prefix">
          Tag Prefix
          <span class="vision_help_text"
            >(Opening tag for image prompts, e.g., [img-gen] or
            &lt;image_prompt&gt;)</span
          >
        </label>
        <input
          id="vision_chat_tag_prefix"
          v-model="state.chatImageGen.tagPrefix"
          type="text"
          placeholder="[img-gen]"
          :disabled="!state.chatImageGen.enabled"
        />
      </div>

      <div class="vision_form_group">
        <label for="vision_chat_tag_suffix">
          Tag Suffix
          <span class="vision_help_text"
            >(Closing tag for image prompts, e.g., [/img-gen] or
            &lt;/image_prompt&gt;)</span
          >
        </label>
        <input
          id="vision_chat_tag_suffix"
          v-model="state.chatImageGen.tagSuffix"
          type="text"
          placeholder="[/img-gen]"
          :disabled="!state.chatImageGen.enabled"
        />
      </div>

      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_chat_request_queue"
            v-model="state.chatImageGen.useRequestQueue"
            type="checkbox"
            :disabled="!state.chatImageGen.enabled"
          />
          <label for="vision_chat_request_queue">
            Use Request Queue
            <span class="vision_help_text"
              >(Queue requests sequentially to avoid API rate limiting. Disable
              to allow concurrent requests.)</span
            >
          </label>
        </div>
      </div>

      <div v-if="state.chatImageGen.useRequestQueue" class="vision_form_group">
        <label for="vision_chat_queue_delay_when">Queue delay when</label>
        <select
          id="vision_chat_queue_delay_when"
          v-model="state.chatImageGen.queueDelayWhen"
          :disabled="
            !state.chatImageGen.enabled || !state.chatImageGen.useRequestQueue
          "
          style="margin-bottom: 8px"
        >
          <option value="after_response">After response (wait for reply, then delay)</option>
          <option value="after_send">After send (delay from when request is sent)</option>
        </select>
        <label for="vision_chat_queue_delay">
          Queue Delay (seconds)
          <span class="vision_help_text"
            >(Delay between requests: 5-12 seconds recommended to prevent 429
            errors)</span
          >
        </label>
        <div style="display: flex; align-items: center; gap: 12px">
          <input
            id="vision_chat_queue_delay"
            v-model.number="state.chatImageGen.queueDelay"
            type="range"
            min="5"
            max="12"
            step="1"
            :disabled="
              !state.chatImageGen.enabled || !state.chatImageGen.useRequestQueue
            "
            style="flex: 1"
          />
          <span
            style="
              min-width: 40px;
              text-align: right;
              color: var(--st-vision-primary, #667eea);
              font-weight: 600;
            "
          >
            {{ state.chatImageGen.queueDelay }}s
          </span>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            font-size: 0.85em;
            color: var(--st-vision-text-muted, #888);
            margin-top: 4px;
          "
        >
          <span>5s</span>
          <span>12s</span>
        </div>
      </div>

      <div class="vision_form_group">
        <label> <i class="fa-solid fa-info-circle"></i> Usage Example </label>
        <div
          :style="{
            background: 'var(--st-vision-bg-light, rgba(0, 0, 0, 0.2))',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
          }"
        >
          <div
            style="color: var(--st-vision-text-muted, #888); margin-bottom: 8px"
          >
            In your chat message:
          </div>
          <div style="color: var(--st-vision-primary, #667eea)">
            {{ state.chatImageGen.tagPrefix }}
          </div>
          <div style="color: var(--st-vision-text, #eee); margin-left: 20px">
            1girl, beautiful, detailed face, high quality
          </div>
          <div style="color: var(--st-vision-primary, #667eea)">
            {{ state.chatImageGen.tagSuffix }}
          </div>
          <div
            style="
              color: var(--st-vision-text-muted, #888);
              margin-top: 8px;
              font-size: 0.85em;
            "
          >
            <i class="fa-solid fa-lightbulb"></i> A "Generate Image" button will
            appear automatically
          </div>
        </div>
      </div>

      <div class="vision_form_group">
        <div class="vision_button_group">
          <button
            class="vision_button"
            @click="openImageHistory"
            style="flex: 1"
          >
            <i class="fa-solid fa-images"></i> View Image History
          </button>
        </div>
      </div>
    </div>

    <!-- Theme Settings -->
    <div class="vision_section">
      <h3><i class="fa-solid fa-palette"></i> Theme Settings</h3>
      <p class="vision_help_text" style="margin-bottom: 15px">
        Choose a theme for the chat image generator interface. The theme affects
        colors, backgrounds, and overall appearance.
      </p>

      <div class="vision_form_group">
        <label for="vision_theme_select">
          Theme
          <span class="vision_help_text"
            >(Select your preferred color theme)</span
          >
        </label>
        <select
          id="vision_theme_select"
          v-model="currentThemeName"
          style="width: 100%"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="red">Red</option>
          <option value="orange">Orange</option>
          <option value="pink">Pink</option>
          <option value="cyan">Cyan</option>
          <option value="teal">Teal</option>
          <option value="indigo">Indigo</option>
          <option value="amber">Amber</option>
          <option value="emerald">Emerald</option>
          <option value="auto">Auto (Follow System)</option>
        </select>
      </div>

      <div class="vision_info_block">
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-info-circle"></i>
          <div>
            <strong>Theme Preview:</strong>
            <div style="margin-top: 8px; font-size: 0.9em">
              <div
                :style="{
                  padding: '8px',
                  background: currentTheme.colors?.background || '#2a2a2a',
                  border: `1px solid ${currentTheme.colors?.border || '#404040'}`,
                  borderRadius: '4px',
                  color: currentTheme.colors?.text || '#e0e0e0',
                }"
              >
                {{ getThemeDescription(currentThemeName) }}
              </div>
            </div>
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
.vision_form_group input[type="password"],
.vision_form_group select {
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
.vision_form_group select:focus {
  outline: none;
  border-color: var(--st-vision-primary, #667eea);
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

.vision_info_block {
  padding: 12px;
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 6px;
  background: var(--st-vision-bg-light, rgba(0, 0, 0, 0.2));
  color: var(--st-vision-text, var(--text-primary, #eee));
}

@media (max-width: 768px) {
  .vision_button_group {
    flex-direction: column;
    gap: 10px;
  }

  .vision_button_group .vision_button {
    width: 100%;
  }
}
</style>
