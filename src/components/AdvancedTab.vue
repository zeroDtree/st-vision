<script setup>
import { computed, watch } from "vue";
import { Vision } from "@/libs/vision";

const {
  currentConfig,
  Model,
  Resolution,
  RESOLUTION_DIMENSIONS,
  Sampler,
  Noise,
  Controlnet,
  Metadata,
} = Vision();

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

const scale = computed({
  get: () => currentConfig.value.scale,
  set: (v) => (currentConfig.value.scale = v),
});

const sampler = computed({
  get: () => currentConfig.value.sampler,
  set: (v) => (currentConfig.value.sampler = v),
});

const seed = computed({
  get: () => currentConfig.value.seed,
  set: (v) => (currentConfig.value.seed = v),
});

const sm = computed({
  get: () => currentConfig.value.sm,
  set: (v) => (currentConfig.value.sm = v),
});

const sm_dyn = computed({
  get: () => currentConfig.value.sm_dyn,
  set: (v) => (currentConfig.value.sm_dyn = v),
});

const stream = computed({
  get: () => currentConfig.value.stream,
  set: (v) => (currentConfig.value.stream = v),
});

const noise = computed({
  get: () => currentConfig.value.noise,
  set: (v) => (currentConfig.value.noise = v),
});

const resPreset = computed({
  get: () => currentConfig.value.resPreset,
  set: (v) => (currentConfig.value.resPreset = v),
});

const qualityToggle = computed({
  get: () => currentConfig.value.qualityToggle,
  set: (v) => (currentConfig.value.qualityToggle = v),
});

const ucPreset = computed({
  get: () => currentConfig.value.ucPreset,
  set: (v) => (currentConfig.value.ucPreset = v),
});

const n_samples = computed({
  get: () => currentConfig.value.n_samples,
  set: (v) => (currentConfig.value.n_samples = v),
});

const dynamic_thresholding = computed({
  get: () => currentConfig.value.dynamic_thresholding,
  set: (v) => (currentConfig.value.dynamic_thresholding = v),
});

const extra_noise_seed = computed({
  get: () => currentConfig.value.extra_noise_seed,
  set: (v) => (currentConfig.value.extra_noise_seed = v),
});

const cfg_rescale = computed({
  get: () => currentConfig.value.cfg_rescale,
  set: (v) => (currentConfig.value.cfg_rescale = v),
});

const noise_schedule = computed({
  get: () => currentConfig.value.noise_schedule,
  set: (v) => (currentConfig.value.noise_schedule = v),
});

const image = computed({
  get: () => currentConfig.value.image,
  set: (v) => (currentConfig.value.image = v),
});

const strength = computed({
  get: () => currentConfig.value.strength,
  set: (v) => (currentConfig.value.strength = v),
});

const controlnet_strength = computed({
  get: () => currentConfig.value.controlnet_strength,
  set: (v) => (currentConfig.value.controlnet_strength = v),
});

const controlnet_condition = computed({
  get: () => currentConfig.value.controlnet_condition,
  set: (v) => (currentConfig.value.controlnet_condition = v),
});

const controlnet_model = computed({
  get: () => currentConfig.value.controlnet_model,
  set: (v) => (currentConfig.value.controlnet_model = v),
});

const add_original_image = computed({
  get: () => currentConfig.value.add_original_image,
  set: (v) => (currentConfig.value.add_original_image = v),
});

const mask = computed({
  get: () => currentConfig.value.mask,
  set: (v) => (currentConfig.value.mask = v),
});

const reference_image_multiple = computed({
  get: () => {
    const val = currentConfig.value.reference_image_multiple;
    return Array.isArray(val) ? val.join(",") : val || "";
  },
  set: (v) => {
    currentConfig.value.reference_image_multiple = v
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : undefined;
  },
});

const reference_information_extracted_multiple = computed({
  get: () => {
    const val = currentConfig.value.reference_information_extracted_multiple;
    return Array.isArray(val) ? val.join(",") : val || "";
  },
  set: (v) => {
    currentConfig.value.reference_information_extracted_multiple = v
      ? v
          .split(",")
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !isNaN(n))
      : undefined;
  },
});

const reference_strength_multiple = computed({
  get: () => {
    const val = currentConfig.value.reference_strength_multiple;
    return Array.isArray(val) ? val.join(",") : val || "";
  },
  set: (v) => {
    currentConfig.value.reference_strength_multiple = v
      ? v
          .split(",")
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !isNaN(n))
      : undefined;
  },
});

const params_version = computed({
  get: () => currentConfig.value.params_version,
  set: (v) => (currentConfig.value.params_version = v),
});

const autoSmea = computed({
  get: () => currentConfig.value.autoSmea,
  set: (v) => (currentConfig.value.autoSmea = v),
});

const characterPrompts = computed({
  get: () => {
    const val = currentConfig.value.characterPrompts;
    return val ? JSON.stringify(val, null, 2) : "";
  },
  set: (v) => {
    try {
      currentConfig.value.characterPrompts = v ? JSON.parse(v) : undefined;
    } catch (e) {
      console.error("Invalid JSON for characterPrompts:", e);
    }
  },
});

const v4_prompt = computed({
  get: () => {
    const val = currentConfig.value.v4_prompt;
    return val ? JSON.stringify(val, null, 2) : "";
  },
  set: (v) => {
    try {
      currentConfig.value.v4_prompt = v ? JSON.parse(v) : undefined;
    } catch (e) {
      console.error("Invalid JSON for v4_prompt:", e);
    }
  },
});

const v4_negative_prompt = computed({
  get: () => {
    const val = currentConfig.value.v4_negative_prompt;
    return val ? JSON.stringify(val, null, 2) : "";
  },
  set: (v) => {
    try {
      currentConfig.value.v4_negative_prompt = v ? JSON.parse(v) : undefined;
    } catch (e) {
      console.error("Invalid JSON for v4_negative_prompt:", e);
    }
  },
});

const skip_cfg_above_sigma = computed({
  get: () => currentConfig.value.skip_cfg_above_sigma,
  set: (v) => (currentConfig.value.skip_cfg_above_sigma = v),
});

const use_coords = computed({
  get: () => currentConfig.value.use_coords,
  set: (v) => (currentConfig.value.use_coords = v),
});

const legacy_uc = computed({
  get: () => currentConfig.value.legacy_uc,
  set: (v) => (currentConfig.value.legacy_uc = v),
});

const normalize_reference_strength_multiple = computed({
  get: () => currentConfig.value.normalize_reference_strength_multiple,
  set: (v) => (currentConfig.value.normalize_reference_strength_multiple = v),
});

const deliberate_euler_ancestral_bug = computed({
  get: () => currentConfig.value.deliberate_euler_ancestral_bug,
  set: (v) => (currentConfig.value.deliberate_euler_ancestral_bug = v),
});

const prefer_brownian = computed({
  get: () => currentConfig.value.prefer_brownian,
  set: (v) => (currentConfig.value.prefer_brownian = v),
});

const inpaintImg2ImgStrength = computed({
  get: () => currentConfig.value.inpaintImg2ImgStrength,
  set: (v) => (currentConfig.value.inpaintImg2ImgStrength = v),
});

const legacy = computed({
  get: () => currentConfig.value.legacy,
  set: (v) => (currentConfig.value.legacy = v),
});

const legacy_v3_extend = computed({
  get: () => currentConfig.value.legacy_v3_extend,
  set: (v) => (currentConfig.value.legacy_v3_extend = v),
});

const supportStream = computed(() => {
  return (
    model.value == Model.V4_CUR ||
    model.value == Model.V4 ||
    model.value == Model.V4_5_CUR ||
    model.value == Model.V4_5
  );
});

function createEnabledState(key) {
  return computed({
    get: () => currentConfig.value[key] !== undefined,
    set: (enabled) => {
      if (!enabled) {
        currentConfig.value[key] = undefined;
      } else {
        const defaultValue = Metadata[key];
        if (defaultValue !== undefined) {
          currentConfig.value[key] = defaultValue;
        } else {
          if (key === "skip_cfg_above_sigma" || key === "stream") {
            currentConfig.value[key] = null;
          } else if (typeof Metadata[key] === "boolean") {
            currentConfig.value[key] = false;
          } else if (typeof Metadata[key] === "number") {
            currentConfig.value[key] = 0;
          } else if (typeof Metadata[key] === "string") {
            currentConfig.value[key] = "";
          } else if (Array.isArray(Metadata[key])) {
            currentConfig.value[key] = [];
          } else {
            currentConfig.value[key] = null;
          }
        }
      }
    },
  });
}

const enabled_resPreset = createEnabledState("resPreset");
const enabled_qualityToggle = createEnabledState("qualityToggle");
const enabled_ucPreset = createEnabledState("ucPreset");
const enabled_width = createEnabledState("width");
const enabled_height = createEnabledState("height");
const enabled_n_samples = createEnabledState("n_samples");
const enabled_steps = createEnabledState("steps");
const enabled_scale = createEnabledState("scale");
const enabled_dynamic_thresholding = createEnabledState("dynamic_thresholding");
const enabled_seed = createEnabledState("seed");
const enabled_extra_noise_seed = createEnabledState("extra_noise_seed");
const enabled_sampler = createEnabledState("sampler");
const enabled_sm = createEnabledState("sm");
const enabled_sm_dyn = createEnabledState("sm_dyn");
const enabled_cfg_rescale = createEnabledState("cfg_rescale");
const enabled_noise_schedule = createEnabledState("noise_schedule");
const enabled_image = createEnabledState("image");
const enabled_strength = createEnabledState("strength");
const enabled_noise = createEnabledState("noise");
const enabled_controlnet_strength = createEnabledState("controlnet_strength");
const enabled_controlnet_condition = createEnabledState("controlnet_condition");
const enabled_controlnet_model = createEnabledState("controlnet_model");
const enabled_add_original_image = createEnabledState("add_original_image");
const enabled_mask = createEnabledState("mask");
const enabled_reference_image_multiple = createEnabledState(
  "reference_image_multiple",
);
const enabled_reference_information_extracted_multiple = createEnabledState(
  "reference_information_extracted_multiple",
);
const enabled_reference_strength_multiple = createEnabledState(
  "reference_strength_multiple",
);
const enabled_params_version = createEnabledState("params_version");
const enabled_autoSmea = createEnabledState("autoSmea");
const enabled_characterPrompts = createEnabledState("characterPrompts");
const enabled_v4_prompt = createEnabledState("v4_prompt");
const enabled_v4_negative_prompt = createEnabledState("v4_negative_prompt");
const enabled_skip_cfg_above_sigma = createEnabledState("skip_cfg_above_sigma");
const enabled_use_coords = createEnabledState("use_coords");
const enabled_legacy_uc = createEnabledState("legacy_uc");
const enabled_normalize_reference_strength_multiple = createEnabledState(
  "normalize_reference_strength_multiple",
);
const enabled_deliberate_euler_ancestral_bug = createEnabledState(
  "deliberate_euler_ancestral_bug",
);
const enabled_prefer_brownian = createEnabledState("prefer_brownian");
const enabled_inpaintImg2ImgStrength = createEnabledState(
  "inpaintImg2ImgStrength",
);
const enabled_legacy = createEnabledState("legacy");
const enabled_legacy_v3_extend = createEnabledState("legacy_v3_extend");
const enabled_stream = createEnabledState("stream");

watch([resPreset, enabled_resPreset], ([newResPreset, isEnabled]) => {
  if (isEnabled && newResPreset && RESOLUTION_DIMENSIONS[newResPreset]) {
    const [newWidth, newHeight] = RESOLUTION_DIMENSIONS[newResPreset];
    if (enabled_width.value) {
      width.value = newWidth;
    }
    if (enabled_height.value) {
      height.value = newHeight;
    }
  }
});
</script>

<template>
  <div class="vision_tab_content">
    <!-- Advanced Generation Settings -->
    <div class="vision_section">
      <h3><i class="fa-solid fa-sliders"></i> Advanced Generation Settings</h3>

      <!-- Resolution Preset with Width and Height -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_res_preset"
            v-model="enabled_resPreset"
            type="checkbox"
          />
          <label for="vision_enabled_res_preset">Resolution Preset</label>
        </div>
        <select
          id="vision_res_preset"
          v-model="resPreset"
          :disabled="!enabled_resPreset"
        >
          <option v-for="(res, key) in Resolution" :key="key" :value="res">
            {{ res }}
          </option>
        </select>
      </div>

      <!-- Width and Height -->
      <div class="vision_form_row">
        <div class="vision_form_group">
          <div class="vision_checkbox_group">
            <input
              id="vision_enabled_width"
              v-model="enabled_width"
              type="checkbox"
            />
            <label for="vision_enabled_width">Width</label>
          </div>
          <input
            id="vision_width"
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
              id="vision_enabled_height"
              v-model="enabled_height"
              type="checkbox"
            />
            <label for="vision_enabled_height">Height</label>
          </div>
          <input
            id="vision_height"
            v-model="height"
            type="number"
            min="64"
            max="2048"
            step="64"
            :disabled="!enabled_height"
          />
        </div>
      </div>

      <!-- Sampler -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_sampler"
            v-model="enabled_sampler"
            type="checkbox"
          />
          <label for="vision_enabled_sampler">Sampler</label>
        </div>
        <select
          id="vision_sampler"
          v-model="sampler"
          :disabled="!enabled_sampler"
        >
          <option v-for="s in Sampler" :value="s">{{ s }}</option>
        </select>
      </div>

      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_noise"
            v-model="enabled_noise"
            type="checkbox"
          />
          <label for="vision_enabled_noise">Noise</label>
        </div>
        <input
          id="vision_noise"
          v-model="noise"
          type="number"
          :disabled="!enabled_noise"
        />
      </div>

      <!-- Noise Schedule -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_noise_schedule"
            v-model="enabled_noise_schedule"
            type="checkbox"
          />
          <label for="vision_enabled_noise_schedule">Noise Schedule</label>
        </div>
        <select
          id="vision_noise_schedule"
          v-model="noise_schedule"
          :disabled="!enabled_noise_schedule"
        >
          <option v-for="n in Noise" :value="n">{{ n }}</option>
        </select>
      </div>

      <!-- Steps -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_steps"
            v-model="enabled_steps"
            type="checkbox"
          />
          <label for="vision_enabled_steps">Steps</label>
        </div>
        <div class="vision_slider_container">
          <div class="vision_slider_header">
            <span class="vision_slider_value">{{ n_steps }}</span>
          </div>
          <input
            id="vision_steps"
            v-model="n_steps"
            type="number"
            :disabled="!enabled_steps"
          />
        </div>
      </div>

      <!-- N Samples -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_n_samples"
            v-model="enabled_n_samples"
            type="checkbox"
          />
          <label for="vision_enabled_n_samples">N Samples</label>
        </div>
        <input
          id="vision_n_samples"
          v-model="n_samples"
          type="number"
          :disabled="!enabled_n_samples"
        />
      </div>

      <!-- Scale (CFG) -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_scale"
            v-model="enabled_scale"
            type="checkbox"
          />
          <label for="vision_enabled_scale">Guidance Scale (CFG)</label>
        </div>
        <div class="vision_slider_container">
          <div class="vision_slider_header">
            <span class="vision_slider_value"></span>
          </div>
          <input
            id="vision_scale"
            v-model="scale"
            type="text"
            :disabled="!enabled_scale"
          />
        </div>
      </div>

      <!-- CFG Rescale -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_cfg_rescale"
            v-model="enabled_cfg_rescale"
            type="checkbox"
          />
          <label for="vision_enabled_cfg_rescale">CFG Rescale</label>
        </div>
        <input
          id="vision_cfg_rescale"
          v-model="cfg_rescale"
          type="number"
          :disabled="!enabled_cfg_rescale"
        />
      </div>

      <!-- Seed -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_seed"
            v-model="enabled_seed"
            type="checkbox"
          />
          <label for="vision_enabled_seed">
            Seed
            <span class="vision_help_text">(-1 for random)</span>
          </label>
        </div>
        <input
          id="vision_seed"
          v-model="seed"
          type="number"
          :disabled="!enabled_seed"
        />
      </div>

      <!-- Extra Noise Seed -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_extra_noise_seed"
            v-model="enabled_extra_noise_seed"
            type="checkbox"
          />
          <label for="vision_enabled_extra_noise_seed">Extra Noise Seed</label>
        </div>
        <input
          id="vision_extra_noise_seed"
          v-model="extra_noise_seed"
          type="number"
          :disabled="!enabled_extra_noise_seed"
        />
      </div>

      <!-- Quality Options -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input id="vision_enabled_sm" v-model="enabled_sm" type="checkbox" />
          <input
            id="vision_sm"
            v-model="sm"
            type="checkbox"
            :disabled="!enabled_sm"
          />
          <label for="vision_enabled_sm">
            SMEA
            <span class="vision_help_text">(Improved coherence)</span>
          </label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_sm_dyn"
            v-model="enabled_sm_dyn"
            type="checkbox"
          />
          <input
            id="vision_sm_dyn"
            v-model="sm_dyn"
            type="checkbox"
            :disabled="!enabled_sm_dyn"
          />
          <label for="vision_enabled_sm_dyn">
            SMEA DYN
            <span class="vision_help_text"
              >(Dynamic SMEA for better details)</span
            >
          </label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_quality_toggle"
            v-model="enabled_qualityToggle"
            type="checkbox"
          />
          <input
            id="vision_quality_toggle"
            v-model="qualityToggle"
            type="checkbox"
            :disabled="!enabled_qualityToggle"
          />
          <label for="vision_enabled_quality_toggle">Quality Toggle</label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_dynamic_thresholding"
            v-model="enabled_dynamic_thresholding"
            type="checkbox"
          />
          <input
            id="vision_dynamic_thresholding"
            v-model="dynamic_thresholding"
            type="checkbox"
            :disabled="!enabled_dynamic_thresholding"
          />
          <label for="vision_enabled_dynamic_thresholding"
            >Dynamic Thresholding</label
          >
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_auto_smea"
            v-model="enabled_autoSmea"
            type="checkbox"
          />
          <input
            id="vision_auto_smea"
            v-model="autoSmea"
            type="checkbox"
            :disabled="!enabled_autoSmea"
          />
          <label for="vision_enabled_auto_smea">Auto SMEA</label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_add_original_image"
            v-model="enabled_add_original_image"
            type="checkbox"
          />
          <input
            id="vision_add_original_image"
            v-model="add_original_image"
            type="checkbox"
            :disabled="!enabled_add_original_image"
          />
          <label for="vision_enabled_add_original_image"
            >Add Original Image</label
          >
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_use_coords"
            v-model="enabled_use_coords"
            type="checkbox"
          />
          <input
            id="vision_use_coords"
            v-model="use_coords"
            type="checkbox"
            :disabled="!enabled_use_coords"
          />
          <label for="vision_enabled_use_coords">Use Coords</label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_legacy_uc"
            v-model="enabled_legacy_uc"
            type="checkbox"
          />
          <input
            id="vision_legacy_uc"
            v-model="legacy_uc"
            type="checkbox"
            :disabled="!enabled_legacy_uc"
          />
          <label for="vision_enabled_legacy_uc">Legacy UC</label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_normalize_reference_strength_multiple"
            v-model="enabled_normalize_reference_strength_multiple"
            type="checkbox"
          />
          <input
            id="vision_normalize_reference_strength_multiple"
            v-model="normalize_reference_strength_multiple"
            type="checkbox"
            :disabled="!enabled_normalize_reference_strength_multiple"
          />
          <label for="vision_enabled_normalize_reference_strength_multiple"
            >Normalize Reference Strength Multiple</label
          >
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_deliberate_euler_ancestral_bug"
            v-model="enabled_deliberate_euler_ancestral_bug"
            type="checkbox"
          />
          <input
            id="vision_deliberate_euler_ancestral_bug"
            v-model="deliberate_euler_ancestral_bug"
            type="checkbox"
            :disabled="!enabled_deliberate_euler_ancestral_bug"
          />
          <label for="vision_enabled_deliberate_euler_ancestral_bug"
            >Deliberate Euler Ancestral Bug</label
          >
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_prefer_brownian"
            v-model="enabled_prefer_brownian"
            type="checkbox"
          />
          <input
            id="vision_prefer_brownian"
            v-model="prefer_brownian"
            type="checkbox"
            :disabled="!enabled_prefer_brownian"
          />
          <label for="vision_enabled_prefer_brownian">Prefer Brownian</label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_legacy"
            v-model="enabled_legacy"
            type="checkbox"
          />
          <input
            id="vision_legacy"
            v-model="legacy"
            type="checkbox"
            :disabled="!enabled_legacy"
          />
          <label for="vision_enabled_legacy">Legacy</label>
        </div>
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_legacy_v3_extend"
            v-model="enabled_legacy_v3_extend"
            type="checkbox"
          />
          <input
            id="vision_legacy_v3_extend"
            v-model="legacy_v3_extend"
            type="checkbox"
            :disabled="!enabled_legacy_v3_extend"
          />
          <label for="vision_enabled_legacy_v3_extend">Legacy V3 Extend</label>
        </div>
      </div>

      <!-- UC Preset -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_uc_preset"
            v-model="enabled_ucPreset"
            type="checkbox"
          />
          <label for="vision_enabled_uc_preset">UC Preset</label>
        </div>
        <select
          id="vision_uc_preset"
          v-model="ucPreset"
          :disabled="!enabled_ucPreset"
        >
          <option :value="0">0</option>
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </div>

      <!-- Params Version -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_params_version"
            v-model="enabled_params_version"
            type="checkbox"
          />
          <label for="vision_enabled_params_version">Params Version</label>
        </div>
        <select
          id="vision_params_version"
          v-model="params_version"
          :disabled="!enabled_params_version"
        >
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </div>

      <!-- Image -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_image"
            v-model="enabled_image"
            type="checkbox"
          />
          <label for="vision_enabled_image">Image</label>
        </div>
        <input
          id="vision_image"
          v-model="image"
          type="text"
          :disabled="!enabled_image"
        />
      </div>

      <!-- Strength -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_strength"
            v-model="enabled_strength"
            type="checkbox"
          />
          <label for="vision_enabled_strength">Strength</label>
        </div>
        <input
          id="vision_strength"
          v-model="strength"
          type="number"
          step="0.01"
          :disabled="!enabled_strength"
        />
      </div>

      <!-- Inpaint Img2Img Strength -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_inpaint_img2img_strength"
            v-model="enabled_inpaintImg2ImgStrength"
            type="checkbox"
          />
          <label for="vision_enabled_inpaint_img2img_strength"
            >Inpaint Img2Img Strength</label
          >
        </div>
        <input
          id="vision_inpaint_img2img_strength"
          v-model="inpaintImg2ImgStrength"
          type="number"
          step="0.01"
          :disabled="!enabled_inpaintImg2ImgStrength"
        />
      </div>

      <!-- Mask -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_mask"
            v-model="enabled_mask"
            type="checkbox"
          />
          <label for="vision_enabled_mask">Mask</label>
        </div>
        <input
          id="vision_mask"
          v-model="mask"
          type="text"
          :disabled="!enabled_mask"
        />
      </div>

      <!-- Controlnet Model -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_controlnet_model"
            v-model="enabled_controlnet_model"
            type="checkbox"
          />
          <label for="vision_enabled_controlnet_model">Controlnet Model</label>
        </div>
        <select
          id="vision_controlnet_model"
          v-model="controlnet_model"
          :disabled="!enabled_controlnet_model"
        >
          <option v-for="c in Controlnet" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- Controlnet Strength -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_controlnet_strength"
            v-model="enabled_controlnet_strength"
            type="checkbox"
          />
          <label for="vision_enabled_controlnet_strength"
            >Controlnet Strength</label
          >
        </div>
        <input
          id="vision_controlnet_strength"
          v-model="controlnet_strength"
          type="number"
          step="0.01"
          :disabled="!enabled_controlnet_strength"
        />
      </div>

      <!-- Controlnet Condition -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_controlnet_condition"
            v-model="enabled_controlnet_condition"
            type="checkbox"
          />
          <label for="vision_enabled_controlnet_condition"
            >Controlnet Condition</label
          >
        </div>
        <input
          id="vision_controlnet_condition"
          v-model="controlnet_condition"
          type="text"
          :disabled="!enabled_controlnet_condition"
        />
      </div>

      <!-- Skip CFG Above Sigma -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_skip_cfg_above_sigma"
            v-model="enabled_skip_cfg_above_sigma"
            type="checkbox"
          />
          <label for="vision_enabled_skip_cfg_above_sigma"
            >Skip CFG Above Sigma</label
          >
        </div>
        <input
          id="vision_skip_cfg_above_sigma"
          v-model="skip_cfg_above_sigma"
          type="number"
          :disabled="!enabled_skip_cfg_above_sigma"
        />
      </div>

      <!-- Reference Image Multiple -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_reference_image_multiple"
            v-model="enabled_reference_image_multiple"
            type="checkbox"
          />
          <label for="vision_enabled_reference_image_multiple"
            >Reference Image Multiple</label
          >
        </div>
        <textarea
          id="vision_reference_image_multiple"
          v-model="reference_image_multiple"
          :disabled="!enabled_reference_image_multiple"
          placeholder="Enter image URLs separated by commas"
        ></textarea>
      </div>

      <!-- Reference Information Extracted Multiple -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_reference_information_extracted_multiple"
            v-model="enabled_reference_information_extracted_multiple"
            type="checkbox"
          />
          <label for="vision_enabled_reference_information_extracted_multiple"
            >Reference Information Extracted Multiple</label
          >
        </div>
        <input
          id="vision_reference_information_extracted_multiple"
          v-model="reference_information_extracted_multiple"
          type="text"
          :disabled="!enabled_reference_information_extracted_multiple"
          placeholder="Enter numbers separated by commas"
        />
      </div>

      <!-- Reference Strength Multiple -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_reference_strength_multiple"
            v-model="enabled_reference_strength_multiple"
            type="checkbox"
          />
          <label for="vision_enabled_reference_strength_multiple"
            >Reference Strength Multiple</label
          >
        </div>
        <input
          id="vision_reference_strength_multiple"
          v-model="reference_strength_multiple"
          type="text"
          :disabled="!enabled_reference_strength_multiple"
          placeholder="Enter numbers separated by commas"
        />
      </div>

      <!-- Character Prompts -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_character_prompts"
            v-model="enabled_characterPrompts"
            type="checkbox"
          />
          <label for="vision_enabled_character_prompts"
            >Character Prompts</label
          >
        </div>
        <textarea
          id="vision_character_prompts"
          v-model="characterPrompts"
          :disabled="!enabled_characterPrompts"
          placeholder="JSON format"
        ></textarea>
      </div>

      <!-- V4 Prompt -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_v4_prompt"
            v-model="enabled_v4_prompt"
            type="checkbox"
          />
          <label for="vision_enabled_v4_prompt">V4 Prompt</label>
        </div>
        <textarea
          id="vision_v4_prompt"
          v-model="v4_prompt"
          :disabled="!enabled_v4_prompt"
          placeholder="JSON format"
        ></textarea>
      </div>

      <!-- V4 Negative Prompt -->
      <div class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_v4_negative_prompt"
            v-model="enabled_v4_negative_prompt"
            type="checkbox"
          />
          <label for="vision_enabled_v4_negative_prompt"
            >V4 Negative Prompt</label
          >
        </div>
        <textarea
          id="vision_v4_negative_prompt"
          v-model="v4_negative_prompt"
          :disabled="!enabled_v4_negative_prompt"
          placeholder="JSON format"
        ></textarea>
      </div>

      <!-- Streaming Option (V4/V4.5 only) -->
      <div v-if="supportStream" class="vision_form_group">
        <div class="vision_checkbox_group">
          <input
            id="vision_enabled_stream"
            v-model="enabled_stream"
            type="checkbox"
          />
          <input
            id="vision_stream"
            v-model="stream"
            type="checkbox"
            :disabled="!enabled_stream"
          />
          <label for="vision_enabled_stream">
            Enable Streaming
            <span class="vision_help_text"
              >(Watch generation progress in real-time)</span
            >
          </label>
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

.vision_slider_container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.vision_slider_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vision_slider_value {
  font-weight: 600;
  color: var(--st-vision-primary, #667eea);
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

@media (max-width: 768px) {
  .vision_form_row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
