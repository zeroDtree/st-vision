import { state } from "./state.vue";
const DEFAULT_CONFIG_NAME = "default";

import { saveState } from "./base_lib";

export function listConfigs() {
  return Object.keys(state.configs);
}

export async function saveConfig(configName, config) {
  if (!state.configs) {
    state.configs = {};
  }
  // Clone config to avoid modifying original
  const configToSave = JSON.parse(JSON.stringify(config));

  state.configs[configName] = configToSave;
  await saveState();
  console.log(`[ST Vision] Saved config: ${configName}`);
  return true;
}

export function getConfig(configName) {
  const config = state.configs?.[configName];
  if (config) {
    // Clone config to avoid modifying original
    const loadedConfig = JSON.parse(JSON.stringify(config));
    console.log(`[ST Vision] Loaded config: ${configName}`);
    return loadedConfig;
  }
  console.log(`[ST Vision] Config not found: ${configName}`);
  return null;
}

export async function deleteConfig(configName) {
  if (configName === DEFAULT_CONFIG_NAME) {
    throw new Error("Cannot delete default configuration");
  }
  if (state.configs?.[configName]) {
    delete state.configs[configName];

    // If deleted config was current, switch to default
    if (state.currentConfigName === configName) {
      state.currentConfigName = DEFAULT_CONFIG_NAME;
    }

    await saveState();
    console.log(`[ST Vision] Deleted config: ${configName}`);
    return true;
  }
  throw new Error(`Configuration ${configName} not found`);
}

export async function renameConfig(oldName, newName) {
  if (oldName === DEFAULT_CONFIG_NAME) {
    throw new Error("Cannot rename default configuration");
  }
  const config = state.configs?.[oldName];
  if (!config) {
    throw new Error(`Configuration ${oldName} not found`);
  }

  // Save with new name
  state.configs[newName] = config;

  // Delete old one
  delete state.configs[oldName];

  // Update current if needed
  if (state.currentConfigName === oldName) {
    state.currentConfigName = newName;
  }

  await saveState();
  console.log(`[ST Vision] Renamed config: ${oldName} -> ${newName}`);
  return true;
}

export function exportConfig(configName, includeToken = false) {
  const config = getConfig(configName);
  if (!config) {
    throw new Error(`Configuration ${configName} not found`);
  }

  const exportData = {
    ...config,
  };

  if (!includeToken) {
    exportData.token = "";
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `st-vision-config-${configName}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function importConfig(
  configName,
  includeToken = false,
  currentToken = "",
) {
  const file = await new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () =>
      input.files?.[0]
        ? resolve(input.files[0])
        : reject(new Error("Import cancelled"));
    input.click();
  });

  const text = await file.text();
  const imported = JSON.parse(text);

  if (!includeToken) {
    imported.token = currentToken;
  }

  await saveConfig(configName, imported);
}

export async function setCurrentConfigName(configName) {
  state.currentConfigName = configName;
  await saveState();
  return true;
}

export async function deleteCurrentConfig() {
  await deleteConfig(state.currentConfigName);
  return true;
}

export async function renameCurrentConfig(newName) {
  await renameConfig(state.currentConfigName, newName);
  return true;
}
export function exportCurrentConfig(includeToken = false) {
  exportConfig(state.currentConfigName, includeToken);
  return true;
}
export async function importCurrentConfig(
  includeToken = false,
  currentToken = "",
) {
  await importConfig(state.currentConfigName, includeToken, currentToken);
  return true;
}

export async function duplicateCurrentConfig(newName) {
  await saveConfig(newName, state.configs[state.currentConfigName]);
  return true;
}
