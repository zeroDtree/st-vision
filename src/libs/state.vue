<script>
import { reactive, computed } from "vue";
import * as NekoAI from "nekoai-js";
import {
  THEMES,
  createCurrentTheme,
  applyTheme as applyThemeUtil,
} from "./theme.js";

export const EXTENSION_NAME = "st-paint";

export const Model = NekoAI.Model;
export const Action = NekoAI.Action;
export const Resolution = NekoAI.Resolution;
export const Sampler = NekoAI.Sampler;
export const Host = NekoAI.Host;
export const Noise = NekoAI.Noise;
export const Controlnet = NekoAI.Controlnet;
// =================================================
export const DirectorTools = NekoAI.DirectorTools;
export const EmotionOptions = NekoAI.EmotionOptions;
export const EmotionLevel = NekoAI.EmotionLevel;
export const EventType = NekoAI.EventType;

export const RESOLUTION_DIMENSIONS = {
  small_portrait: [512, 768],
  small_landscape: [768, 512],
  small_square: [640, 640],
  normal_portrait: [832, 1216],
  normal_landscape: [1216, 832],
  normal_square: [1024, 1024],
  large_portrait: [1024, 1536],
  large_landscape: [1536, 1024],
  large_square: [1472, 1472],
  wallpaper_portrait: [1080, 1920],
  wallpaper_landscape: [1920, 1080],
};

export const Metadata = {
  prompt: "",
  prompt_prefix: "",
  prompt_suffix: "",
  model: Model.V4_5,
  action: Action.GENERATE,
  resPreset: Resolution.NORMAL_PORTRAIT,
  negative_prompt: "",
  qualityToggle: false,
  ucPreset: 0,
  width: 832,
  height: 1216,
  n_samples: 1,
  steps: 28,
  scale: 6.6,
  dynamic_thresholding: false,
  seed: -1,
  extra_noise_seed: -1,
  sampler: Sampler.EULER_ANC,
  sm: false,
  sm_dyn: false,
  cfg_rescale: 0,
  noise_schedule: Noise.KARRAS,
  image: undefined,
  strength: undefined,
  noise: undefined,
  controlnet_strength: undefined,
  controlnet_condition: undefined,
  controlnet_model: undefined,
  add_original_image: undefined,
  mask: undefined,
  reference_image_multiple: undefined,
  reference_information_extracted_multiple: undefined,
  reference_strength_multiple: undefined,
  params_version: undefined,
  autoSmea: undefined,
  characterPrompts: undefined,
  v4_prompt: undefined,
  v4_negative_prompt: undefined,
  skip_cfg_above_sigma: undefined,
  use_coords: undefined,
  legacy_uc: undefined,
  normalize_reference_strength_multiple: undefined,
  deliberate_euler_ancestral_bug: undefined,
  prefer_brownian: undefined,
  inpaintImg2ImgStrength: undefined,
  legacy: undefined,
  legacy_v3_extend: undefined,
  stream: undefined,
};

export const DEFAULT_CONFIG = {
  token: "",
  host: Host.WEB,
  timeout: 120000, // 120 seconds timeout for API requests
  ...Metadata,
};

// Re-export THEMES for backward compatibility
export { THEMES };

export const state = reactive({
  configs: {
    default: { ...DEFAULT_CONFIG },
  },
  currentConfigName: "default",
  modalVisible: false,
  fabPosition: { x: null, y: null },
  // Chat image generation settings
  chatImageGen: {
    enabled: true,
    tagPrefix: "[img-gen]",
    tagSuffix: "[/img-gen]",
    useRequestQueue: true, // Queue requests to avoid API rate limiting
    queueDelay: 8, // Delay between requests in seconds (0-12 seconds)
    // 'after_response': wait for response then delay (default). 'after_send': delay from when request is sent.
    queueDelayWhen: "after_response",
  },
  // Theme settings
  theme: {
    current: "dark", // 'dark', 'light', or 'auto'
  },
});

export const currentConfig = computed(() => {
  return state.configs[state.currentConfigName];
});

// Get current theme colors
export const currentTheme = createCurrentTheme(state);

// Apply theme to plugin container and related elements
export function applyTheme(themeName = null) {
  applyThemeUtil(themeName, state);
}
</script>
