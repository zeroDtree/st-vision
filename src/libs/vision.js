import {
  Model,
  Resolution,
  Sampler,
  Host,
  Noise,
  Action,
  Controlnet,
  RESOLUTION_DIMENSIONS,
  currentConfig,
  DEFAULT_CONFIG,
  Metadata,
  state,
  THEMES,
  currentTheme,
  applyTheme,
} from "./state.vue";
import { loadState, saveState } from "@/libs/base_lib.js";
import {
  listConfigs,
  saveConfig,
  deleteConfig,
  renameConfig,
  exportConfig,
  importConfig,
  setCurrentConfigName,
  exportCurrentConfig,
  importCurrentConfig,
  deleteCurrentConfig,
  renameCurrentConfig,
  duplicateCurrentConfig,
} from "./config_lib.js";

export const Vision = () => ({
  // state
  state,
  loadState,
  saveState,
  // novel ai
  Host,
  Model,
  Resolution,
  RESOLUTION_DIMENSIONS,
  Sampler,
  Noise,
  Action,
  Controlnet,
  DEFAULT_CONFIG,
  Metadata,
  // Config
  currentConfig,
  listConfigs,
  saveConfig,
  deleteConfig,
  renameConfig,
  exportConfig,
  importConfig,
  setCurrentConfigName,
  exportCurrentConfig,
  importCurrentConfig,
  deleteCurrentConfig,
  renameCurrentConfig,
  duplicateCurrentConfig,
  // Theme
  THEMES,
  currentTheme,
  applyTheme,
});

function init() {
  loadState();
  state.modalVisible = false;

  // Ensure theme object exists
  if (!state.theme) {
    state.theme = { current: "dark" };
  }

  // Apply theme on init - wait for DOM to be ready
  if (typeof window !== "undefined") {
    const applyThemeOnReady = () => {
      const themeName = state.theme?.current || "dark";
      console.log("[ST Vision] Applying theme on init:", themeName);
      applyTheme(themeName);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        // Wait a bit more for Vue components to mount
        setTimeout(applyThemeOnReady, 200);
      });
    } else {
      // DOM already loaded, wait for Vue components
      setTimeout(applyThemeOnReady, 200);
    }

    // Listen for system theme changes if auto theme is selected
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = () => {
        if (state.theme?.current === "auto") {
          console.log("[ST Vision] System theme changed, applying auto theme");
          applyTheme("auto");
        }
      };
      mediaQuery.addEventListener("change", handleThemeChange);
    }
  }
}

init();
