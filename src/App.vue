<script setup>
import { ref } from "vue";
import FloatingButton from "./components/FloatingButton.vue";
import VisionModal from "./components/VisionModal.vue";
import ChatImageGenerator from "./components/ChatImageGenerator.vue";
import ImageHistory from "./components/ImageHistory.vue";

const imageHistoryVisible = ref(false);

if (typeof window !== "undefined") {
  window.addEventListener("st-vision-show-history", () => {
    imageHistoryVisible.value = true;
  });
}
</script>

<template>
  <div id="st-vision-app" class="st-vision-app">
    <FloatingButton />
    <VisionModal />
    <ChatImageGenerator />
    <ImageHistory
      :visible="imageHistoryVisible"
      @close="imageHistoryVisible = false"
    />
  </div>
</template>

<style scoped>
/* Ensure theme variables are scoped to this container */
.st-vision-app,
#st-vision-app {
  /* Variables will be set dynamically by applyTheme() */
}
</style>
