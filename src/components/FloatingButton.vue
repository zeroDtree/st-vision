<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Vision } from "../libs/vision.js";

const { state, saveState } = Vision();

function toggleModal() {
  state.modalVisible = !state.modalVisible;
}

function setFabPosition(x, y) {
  state.fabPosition = { x, y };
  saveState();
}

const fab = ref(null);
const isDragging = ref(false);
const dragStartTime = ref(0);

let xOffset = 0;
let yOffset = 0;
let initialX = 0;
let initialY = 0;
let currentX = 0;
let currentY = 0;

function loadPosition() {
  if (!fab.value) return;

  const fabEl = fab.value;
  const fabWidth = fabEl.offsetWidth;
  const fabHeight = fabEl.offsetHeight;
  const maxX = window.innerWidth - fabWidth;
  const maxY = window.innerHeight - fabHeight;

  if (state.fabPosition.x !== null && state.fabPosition.y !== null) {
    const validX = Math.max(0, Math.min(state.fabPosition.x, maxX));
    const validY = Math.max(0, Math.min(state.fabPosition.y, maxY));

    fabEl.style.left = validX + "px";
    fabEl.style.top = validY + "px";
    fabEl.style.right = "auto";
    fabEl.style.bottom = "auto";

    xOffset = validX;
    yOffset = validY;
  } else {
    const defaultX = maxX - 30;
    const defaultY = maxY - 80;

    fabEl.style.left = defaultX + "px";
    fabEl.style.top = defaultY + "px";
    fabEl.style.right = "auto";
    fabEl.style.bottom = "auto";

    xOffset = defaultX;
    yOffset = defaultY;
  }
}

function drag(e) {
  if (!isDragging.value) return;

  e.preventDefault();

  if (e.type === "touchmove") {
    currentX = e.touches[0].clientX - initialX;
    currentY = e.touches[0].clientY - initialY;
  } else {
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
  }

  xOffset = currentX;
  yOffset = currentY;

  const fabEl = fab.value;
  if (!fabEl) return;

  const fabWidth = fabEl.offsetWidth;
  const fabHeight = fabEl.offsetHeight;
  const maxX = window.innerWidth - fabWidth;
  const maxY = window.innerHeight - fabHeight;

  xOffset = Math.max(0, Math.min(xOffset, maxX));
  yOffset = Math.max(0, Math.min(yOffset, maxY));

  fabEl.style.left = xOffset + "px";
  fabEl.style.top = yOffset + "px";
}

function dragEnd() {
  if (isDragging.value) {
    const dragDuration = Date.now() - dragStartTime.value;

    if (dragDuration < 200) {
      toggleModal();
    } else {
      setFabPosition(xOffset, yOffset);
    }

    isDragging.value = false;
    removeDragListeners();
  }
}

function addDragListeners() {
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("mouseleave", dragEnd);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("touchend", dragEnd);
  document.addEventListener("touchcancel", dragEnd);
}

function removeDragListeners() {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", dragEnd);
  document.removeEventListener("mouseleave", dragEnd);
  document.removeEventListener("touchmove", drag);
  document.removeEventListener("touchend", dragEnd);
  document.removeEventListener("touchcancel", dragEnd);
}

function dragStart(e) {
  dragStartTime.value = Date.now();

  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  isDragging.value = true;
  addDragListeners();
}

onMounted(() => {
  loadPosition();
});

onUnmounted(() => {
  removeDragListeners();
});
</script>

<template>
  <div
    ref="fab"
    class="st_vision_fab"
    :class="{ st_vision_fab_dragging: isDragging }"
    title="ST Vision - Image Generation (Drag to move)"
    @mousedown="dragStart"
    @touchstart="dragStart"
  >
    <i class="fa-solid fa-wand-magic-sparkles"></i>
  </div>
</template>

<style scoped>
.st_vision_fab {
  position: fixed;
  bottom: 80px;
  right: 30px;
  width: 56px;
  height: 56px;
  background: var(
    --st-vision-button-bg,
    linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9998;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  color: white;
  font-size: 24px;
  user-select: none;
  touch-action: none;
}

.st_vision_fab:hover {
  transform: scale(1.1);
  background: var(
    --st-vision-button-hover,
    linear-gradient(135deg, #7a8ef0 0%, #8650b8 100%)
  );
  box-shadow: 0 6px 20px var(--st-vision-primary, rgba(102, 126, 234, 0.5));
}

.st_vision_fab:active {
  cursor: grabbing;
}

.st_vision_fab_dragging {
  cursor: grabbing !important;
  transform: scale(1.15) !important;
  box-shadow: 0 8px 30px var(--st-vision-primary, rgba(102, 126, 234, 0.7)) !important;
  transition: none !important;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .st_vision_fab {
    width: 56px;
    height: 56px;
    font-size: 24px;
    bottom: 20px;
    right: 20px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .st_vision_fab:active {
    transform: scale(0.95);
  }
}
</style>
