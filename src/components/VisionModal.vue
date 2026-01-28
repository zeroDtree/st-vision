<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { Vision } from "../libs/vision.js";

import InputDialog from "./InputDialog.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import GenerateTab from "./GenerateTab.vue";
import PluginSettingsTab from "./PluginSettingsTab.vue";
import AdvancedTab from "./AdvancedTab.vue";

const {
  state,
  currentConfig,
  duplicateCurrentConfig,
  renameCurrentConfig,
  deleteCurrentConfig,
  saveState,
  exportCurrentConfig,
  importConfig,
  applyTheme,
} = Vision();

// Tab state
const activeTab = ref("generate");

// InputDialog state
const inputDialogVisible = ref(false);
const inputDialogTitle = ref("Input dialog title");
const inputDialogContent = ref("Input dialog content");
const inputDialogValue = ref("");
let inputDialogResolve = null;

// ConfirmDialog state
const confirmDialogVisible = ref(false);
const confirmDialogTitle = ref("Confirm dialog title");
const confirmDialogContent = ref("Confirm dialog content");
let confirmDialogResolve = null;

function showModal() {
  state.modalVisible = true;
}

function hideModal() {
  state.modalVisible = false;
}

function handleBackdropClick(e) {
  if (e.target.classList.contains("st_vision_modal")) {
    hideModal();
  }
}

function handleKeydown(e) {
  if (e.key === "Escape" && state.modalVisible) {
    hideModal();
  }
}

function openInputDialog(title, content, initialValue = "") {
  return new Promise((resolve, reject) => {
    inputDialogTitle.value = title;
    inputDialogContent.value = content;
    inputDialogValue.value = initialValue;
    inputDialogVisible.value = true;
    inputDialogResolve = resolve;
  });
}

function openConfirmDialog(title, content = "") {
  return new Promise((resolve) => {
    confirmDialogTitle.value = title;
    confirmDialogContent.value = content;
    confirmDialogVisible.value = true;
    confirmDialogResolve = resolve;
  });
}

function handleInputDialogConfirm(value) {
  if (inputDialogResolve) {
    inputDialogResolve(value);
    inputDialogResolve = null;
  }
}

function handleInputDialogCancel() {
  if (inputDialogResolve) {
    inputDialogResolve(null);
    inputDialogResolve = null;
  }
}

function handleConfirmDialogConfirm() {
  if (confirmDialogResolve) {
    confirmDialogResolve(true);
    confirmDialogResolve = null;
  }
}

function handleConfirmDialogCancel() {
  if (confirmDialogResolve) {
    confirmDialogResolve(false);
    confirmDialogResolve = null;
  }
}

async function renameItem(name) {
  try {
    console.log("openInputDialog-rename");
    const userInput = await openInputDialog(
      "Rename",
      `Enter new name for ${name}:`,
      name,
    );
    if (!userInput || !userInput.trim()) {
      console.log("Empty input, rename cancelled");
      return;
    }
    await renameCurrentConfig(userInput.trim());
    console.log("user input", userInput);
  } catch (error) {
    if (error && error.message) {
      console.error("Rename failed:", error.message);
      alert(`Failed to rename: ${error.message}`);
    } else {
      console.log("user cancel input");
    }
  }
}

async function duplicateItem(name) {
  try {
    console.log("openInputDialog-duplicate");
    const userInput = await openInputDialog(
      "New name",
      `Enter new name for ${name}:`,
      "",
    );
    if (!userInput || !userInput.trim()) {
      console.log("Empty input");
      return;
    }
    await duplicateCurrentConfig(userInput.trim());
    console.log("user input", userInput);
  } catch (error) {
    if (error && error.message) {
      console.error("dupl failed:", error.message);
      alert(`Failed to dupl: ${error.message}`);
    } else {
      console.log("user cancel input");
    }
  }
}

async function deleteItem() {
  try {
    console.log("openConfirmDialog-delete");
    const confirmed = await openConfirmDialog(
      "Delete Configuration",
      `Delete current configuration "${state.currentConfigName}"? This cannot be undone.`,
    );
    if (!confirmed) {
      console.log("Delete cancelled");
      return;
    }
    await deleteCurrentConfig();
    console.log("config deleted");
  } catch (error) {
    if (error && error.message) {
      console.error("Delete failed:", error.message);
      alert(`Failed to delete: ${error.message}`);
    } else {
      console.log("user cancel confirm");
    }
  }
}

async function exportItem() {
  try {
    const confirmed = await openConfirmDialog(
      "Export Configuration",
      `Do you want to include your API token in the exported configuration?\n\nClick "yes" to include token, "no" to exclude it.`,
    );
    const includeToken = confirmed === true;
    exportCurrentConfig(includeToken);
    alert(`Configuration "${state.currentConfigName}" exported successfully!`);
  } catch (error) {
    if (error && error.message) {
      console.error("Export failed:", error.message);
      alert(`Failed to export: ${error.message}`);
    } else {
      console.log("Export cancelled");
    }
  }
}

async function importItem() {
  try {
    // First, ask for configuration name
    const configName = await openInputDialog(
      "Import Configuration",
      "Enter a name for the imported configuration:",
      state.currentConfigName,
    );
    if (!configName || !configName.trim()) {
      console.log("Empty input, import cancelled");
      return;
    }

    // Then, ask if user wants to import token
    const confirmed = await openConfirmDialog(
      "Import API Token",
      `Do you want to import the API token from the file?\n\nClick "yes" to import token from file, "no" to keep your current token.`,
    );
    const includeToken = confirmed === true;
    const currentToken = currentConfig.value.token || "";
    await importConfig(configName.trim(), includeToken, currentToken);

    alert(`Configuration "${configName.trim()}" imported successfully!`);
  } catch (error) {
    if (error && error.message) {
      console.error("Import failed:", error.message);
      alert(`Failed to import: ${error.message}`);
    } else {
      console.log("Import cancelled");
    }
  }
}

// Watch for modal visibility changes and reapply theme when modal opens
watch(
  () => state.modalVisible,
  async (isVisible) => {
    if (isVisible) {
      // Wait for DOM to update (modal element to be created)
      await nextTick();
      // Small delay to ensure transition has started and element is fully rendered
      setTimeout(() => {
        // Reapply theme to ensure newly created modal elements have theme variables
        const currentTheme = state.theme?.current || "dark";
        applyTheme(currentTheme);
      }, 50);
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="state.modalVisible"
        class="st_vision_modal"
        @click="handleBackdropClick"
      >
        <div class="st_vision_modal_content">
          <div class="st_vision_modal_header">
            <button
              class="vision_button vision_button_primary vision_button_save"
              @click="saveState"
            >
              <i class="fa-solid fa-save"></i>
              <span>Save Plugin Settings</span>
            </button>
            <button class="st_vision_modal_close" @click="hideModal">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div class="st_vision_modal_body">
            <InputDialog
              :title="inputDialogTitle"
              :content="inputDialogContent"
              :visible="inputDialogVisible"
              :value="inputDialogValue"
              @update:visible="inputDialogVisible = $event"
              @confirm="handleInputDialogConfirm"
              @cancel="handleInputDialogCancel"
            ></InputDialog>
            <ConfirmDialog
              :title="confirmDialogTitle"
              :content="confirmDialogContent"
              :visible="confirmDialogVisible"
              @update:visible="confirmDialogVisible = $event"
              @confirm="handleConfirmDialogConfirm"
              @cancel="handleConfirmDialogCancel"
            ></ConfirmDialog>
            <div class="st_vision_settings">
              <!-- Tab Navigation -->
              <div class="vision_tabs">
                <button
                  class="vision_tab"
                  :class="{ active: activeTab === 'generate' }"
                  @click="activeTab = 'generate'"
                >
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Generate</span>
                </button>
                <button
                  class="vision_tab"
                  :class="{ active: activeTab === 'plugin' }"
                  @click="activeTab = 'plugin'"
                >
                  <i class="fa-solid fa-cog"></i>
                  <span>Plugin Settings</span>
                </button>
                <button
                  class="vision_tab"
                  :class="{ active: activeTab === 'advanced' }"
                  @click="activeTab = 'advanced'"
                >
                  <i class="fa-solid fa-sliders"></i>
                  <span>Advanced</span>
                </button>
              </div>

              <!-- Generate Tab -->
              <GenerateTab v-show="activeTab === 'generate'" />

              <!-- Plugin Settings Tab -->
              <PluginSettingsTab
                v-show="activeTab === 'plugin'"
                @rename-config="renameItem('config')"
                @duplicate-config="duplicateItem('config')"
                @delete-config="deleteItem"
                @export-config="exportItem"
                @import-config="importItem"
              />

              <!-- Advanced Settings Tab -->
              <AdvancedTab v-show="activeTab === 'advanced'" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.st_vision_modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.st_vision_modal_content {
  background: var(--st-vision-bg, var(--bg-primary, #1a1a2e));
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.st_vision_modal_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--st-vision-border, var(--border-color, #333));
  background: linear-gradient(
    135deg,
    var(--st-vision-primary, rgba(102, 126, 234, 0.15)) 0%,
    var(--st-vision-secondary, rgba(118, 75, 162, 0.15)) 100%
  );
  border-radius: 12px 12px 0 0;
}

.st_vision_modal_header h2 {
  margin: 0;
  font-size: 1.5em;
  color: var(--st-vision-text, var(--text-primary, #eee));
  display: flex;
  align-items: center;
  gap: 10px;
}

.st_vision_modal_header h2 i {
  color: var(--st-vision-primary, #667eea);
}

.st_vision_modal_close {
  background: transparent;
  border: none;
  color: var(--st-vision-text, var(--text-primary, #eee));
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.st_vision_modal_close:hover {
  background: var(--st-vision-bg-hover, rgba(255, 255, 255, 0.1));
  color: var(--st-vision-primary, #667eea);
}

.st_vision_modal_body {
  overflow-y: auto;
  padding: 25px;
  flex: 1;
}

/* Settings Panel Styles */
.st_vision_settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vision_button_save {
  align-self: flex-start;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.vision_button_save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.vision_button_save i {
  font-size: 1.1em;
}

/* Tab Navigation Styles */
.vision_tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid var(--st-vision-border, var(--border-color, #333));
  padding-bottom: 0;
  margin-bottom: 0;
}

.vision_tab {
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--st-vision-text, var(--text-primary, #ccc));
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  margin-bottom: -2px;
}

.vision_tab i {
  font-size: 1.1em;
  transition: all 0.3s ease;
}

.vision_tab:hover {
  color: var(--st-vision-primary, #667eea);
  background: var(--st-vision-bg-hover, rgba(102, 126, 234, 0.05));
}

.vision_tab.active {
  color: var(--st-vision-primary, #667eea);
  border-bottom-color: var(--st-vision-primary, #667eea);
  background: var(--st-vision-bg-hover, rgba(102, 126, 234, 0.08));
}

.vision_tab.active i {
  color: var(--st-vision-primary, #667eea);
  transform: scale(1.1);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .st_vision_modal_content,
.modal-leave-active .st_vision_modal_content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .st_vision_modal_content,
.modal-leave-to .st_vision_modal_content {
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .st_vision_modal {
    padding: 0;
    align-items: flex-start;
  }

  .st_vision_modal_content {
    width: 100%;
    max-width: 100%;
    max-height: 100vh;
    height: 100vh;
    margin: 0;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }

  .st_vision_modal_header {
    padding: 12px 15px;
    flex-shrink: 0;
  }

  .st_vision_modal_header h2 {
    font-size: 1.1em;
    flex-wrap: wrap;
  }

  .st_vision_modal_header h2 i {
    font-size: 0.9em;
  }

  .vision_button_save {
    width: 100%;
    justify-content: center;
  }

  .vision_tabs {
    flex-wrap: wrap;
    gap: 4px;
  }

  .vision_tab {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    font-size: 0.9em;
    justify-content: center;
  }

  .vision_tab span {
    display: none;
  }

  .vision_tab i {
    font-size: 1.2em;
  }

  .st_vision_modal_close {
    padding: 8px;
    font-size: 20px;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .st_vision_modal_body {
    padding: 12px 15px;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
