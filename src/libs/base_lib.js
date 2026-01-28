import { EXTENSION_NAME, state } from "./state.vue";

export { loadState, saveState };

function loadState() {
  try {
    const { extensionSettings } = SillyTavern.getContext();
    let tmp = extensionSettings?.[EXTENSION_NAME];
    console.log("[ST Vision] Loading state, tmp=", tmp);
    if (!tmp) {
      extensionSettings[EXTENSION_NAME] = state;
    } else {
      // Deep merge nested objects like theme and chatImageGen
      for (const key in tmp) {
        if (tmp[key] !== undefined) {
          if (
            typeof tmp[key] === "object" &&
            tmp[key] !== null &&
            !Array.isArray(tmp[key])
          ) {
            // For nested objects, merge properties
            if (state[key] && typeof state[key] === "object") {
              Object.assign(state[key], tmp[key]);
            } else {
              state[key] = tmp[key];
            }
          } else {
            state[key] = tmp[key];
          }
        }
      }
      extensionSettings[EXTENSION_NAME] = state;
    }
    console.log("[ST Vision] Load state done. Theme:", state.theme);
  } catch (e) {
    console.error("[ST Vision] Failed to load state:", e);
    throw new Error("extension_settings not available");
  }
}
async function saveState() {
  try {
    const { extensionSettings } = SillyTavern.getContext();
    const { saveSettingsDebounced } = SillyTavern.getContext();

    // Ensure state is synced to extensionSettings before saving
    extensionSettings[EXTENSION_NAME] = state;

    saveSettingsDebounced();
    console.log("[ST Vision] Save state done. Theme:", state.theme);
    console.log(
      "[ST Vision] Saved extensionSettings:",
      extensionSettings[EXTENSION_NAME],
    );
  } catch (e) {
    console.error("[ST Vision] Failed to save state:", e);
    throw new Error("failed to save");
  }
}
