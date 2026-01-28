<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  title: { type: String, default: "Input dialog title" },
  content: { type: String, default: "Input dialog content" },
  visible: { type: Boolean, default: false },
  value: { type: String, default: "" },
});

const emit = defineEmits(["update:visible", "confirm", "cancel"]);

const inputValue = ref(props.value);

watch(
  () => props.value,
  (newVal) => {
    inputValue.value = newVal;
  },
);

function closeDialog() {
  emit("update:visible", false);
}

function confirmDialog() {
  emit("confirm", inputValue.value);
  closeDialog();
}

function cancelDialog() {
  emit("cancel");
  closeDialog();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="props.visible" class="vision_popup_overlay">
        <div class="vision_input_dialog">
          <div class="vision_input_dialog_header">
            <h3>{{ props.title }}</h3>
            <p>{{ props.content }}</p>
          </div>
          <div class="vision_input_dialog_body">
            <input
              type="text"
              class="vision_input_dialog_input"
              v-model="inputValue"
            />
          </div>
          <div class="vision_input_dialog_footer">
            <button class="vision_button" @click="cancelDialog">Cancel</button>
            <button
              class="vision_button vision_button_primary"
              @click="confirmDialog"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vision_input_dialog {
  background: var(--st-vision-bg, var(--bg-primary, #1a1a2e));
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.vision_input_dialog_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid var(--st-vision-border, var(--border-color, #333));
}

.vision_input_dialog_header h3 {
  margin: 0;
  color: var(--st-vision-text, var(--text-primary, #eee));
  font-size: 1.1em;
  font-weight: 600;
}

.vision_input_dialog_body {
  padding: 20px;
}

.vision_input_dialog_body p {
  margin: 0 0 15px 0;
  color: var(--st-vision-text, var(--text-primary, #eee));
  line-height: 1.6;
}

.vision_input_dialog_input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--st-vision-border, var(--border-color, #333));
  border-radius: 6px;
  background-color: var(--st-vision-bg-light, var(--bg-secondary, #242438));
  color: var(--st-vision-text, var(--text-primary, #eee));
  font-size: 1em;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.vision_input_dialog_input:focus {
  outline: none;
  border-color: var(--st-vision-primary, #667eea);
}

.vision_input_dialog_footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid var(--st-vision-border, var(--border-color, #333));
}

.vision_popup_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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

.vision_button_primary {
  background: var(
    --st-vision-button-bg,
    linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  );
  border-color: var(--st-vision-primary, #667eea);
  font-weight: 600;
}

.vision_button_primary:hover:not(:disabled) {
  background: var(
    --st-vision-button-hover,
    linear-gradient(135deg, #764ba2 0%, #667eea 100%)
  );
  border-color: var(--st-vision-secondary, #8b5cf6);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--st-vision-primary, rgba(102, 126, 234, 0.3));
}

/* Popup Transitions */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s ease;
}

.popup-enter-active .vision_input_dialog,
.popup-leave-active .vision_input_dialog {
  transition: transform 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-from .vision_input_dialog,
.popup-leave-to .vision_input_dialog {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .vision_input_dialog {
    width: 95%;
    max-width: none;
    margin: 10px;
  }

  .vision_input_dialog_header {
    padding: 12px 15px;
  }

  .vision_input_dialog_header h3 {
    font-size: 1em;
  }

  .vision_input_dialog_body {
    padding: 15px;
  }

  .vision_input_dialog_input {
    padding: 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px;
  }

  .vision_input_dialog_footer {
    padding: 12px 15px;
    flex-direction: column;
    gap: 8px;
  }

  .vision_button {
    width: 100%;
    padding: 12px 18px;
    min-height: 44px;
    font-size: 1em;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
