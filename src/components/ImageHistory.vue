<template>
  <div v-if="visible" class="st-vision-image-history-modal">
    <div class="modal-overlay" @click="close"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2><i class="fa-solid fa-images"></i> Image History</h2>
        <button class="close-btn" @click="close">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- 搜索和筛选 -->
        <div class="filters">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by prompt or character..."
            class="search-input"
          />
          <select v-model="sortBy" class="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="character">By Character</option>
          </select>
          <button @click="clearHistory" class="clear-btn">
            <i class="fa-solid fa-trash"></i> Clear All
          </button>
        </div>

        <!-- 统计信息 -->
        <div class="stats">
          <span>Total: {{ filteredImages.length }} images</span>
        </div>

        <!-- 图片网格 -->
        <div v-if="filteredImages.length > 0" class="image-grid">
          <div
            v-for="(img, index) in paginatedImages"
            :key="index"
            class="image-card"
          >
            <div class="image-wrapper">
              <img
                :src="img.dataURL"
                :alt="img.prompt"
                @click="viewImage(img)"
                @touchstart="handleImageTouchStart($event, index)"
                @touchend="handleImageTouchEnd"
              />
              <div
                class="image-overlay"
                :class="{ 'show-overlay': activeOverlayIndex === index }"
              >
                <button
                  @click.stop="copyPrompt(img.prompt)"
                  title="Copy prompt"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button @click.stop="downloadImage(img)" title="Download">
                  <i class="fa-solid fa-download"></i>
                </button>
                <button
                  @click.stop="deleteImageFromHistory(index)"
                  title="Delete"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="image-info">
              <div class="prompt">{{ truncatePrompt(img.prompt) }}</div>
              <div class="meta">
                <span class="character">{{ img.characterName }}</span>
                <span class="time">{{ formatTime(img.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fa-solid fa-image"></i>
          <p>No images generated yet</p>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  pathToURL,
  deleteImage as deleteImageFromServer,
} from "../libs/image_api.js";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const searchQuery = ref("");
const sortBy = ref("newest");
const currentPage = ref(1);
const itemsPerPage = 20;
const activeOverlayIndex = ref(-1);
let touchTimer = null;

const imageHistory = computed(() => {
  try {
    const context = SillyTavern.getContext();
    const history = context.extensionSettings?.st_vision?.imageHistory || [];
    // Convert server paths to URLs for display
    return history.map((img) => {
      if (img.path && !img.dataURL) {
        return {
          ...img,
          dataURL: pathToURL(img.path),
        };
      }
      return img;
    });
  } catch (error) {
    console.error("[ST Vision] Failed to get image history:", error);
    return [];
  }
});

const filteredImages = computed(() => {
  let images = [...imageHistory.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    images = images.filter(
      (img) =>
        img.prompt?.toLowerCase().includes(query) ||
        img.characterName?.toLowerCase().includes(query),
    );
  }

  if (sortBy.value === "newest") {
    images.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortBy.value === "oldest") {
    images.sort((a, b) => a.timestamp - b.timestamp);
  } else if (sortBy.value === "character") {
    images.sort((a, b) =>
      (a.characterName || "").localeCompare(b.characterName || ""),
    );
  }

  return images;
});

const totalPages = computed(() =>
  Math.ceil(filteredImages.value.length / itemsPerPage),
);
const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredImages.value.slice(start, start + itemsPerPage);
});

const totalSize = computed(() => {
  // Size calculation is not accurate since we no longer store full image data in config
  // Images are now stored on the server, so we can't calculate size from metadata
  return null;
});

watch([searchQuery, sortBy], () => {
  currentPage.value = 1;
});

function close() {
  emit("close");
}

function handleImageTouchStart(event, index) {
  // 在移动端，长按显示操作按钮
  touchTimer = setTimeout(() => {
    activeOverlayIndex.value = index;
    // 3秒后自动隐藏
    setTimeout(() => {
      activeOverlayIndex.value = -1;
    }, 3000);
  }, 500);
}

function handleImageTouchEnd() {
  if (touchTimer) {
    clearTimeout(touchTimer);
    touchTimer = null;
  }
}

function truncatePrompt(prompt, maxLength = 60) {
  if (!prompt) return "";
  return prompt.length > maxLength
    ? prompt.substring(0, maxLength) + "..."
    : prompt;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function viewImage(img) {
  window.open(img.dataURL, "_blank");
}

function copyPrompt(prompt) {
  navigator.clipboard
    .writeText(prompt)
    .then(() => {
      console.log("[ST Vision] Prompt copied to clipboard");
    })
    .catch((err) => {
      console.error("[ST Vision] Failed to copy prompt:", err);
    });
}

function downloadImage(img) {
  const link = document.createElement("a");
  link.href = img.dataURL;
  const filename = img.imageId
    ? `${img.imageId}.png`
    : `st-vision-${img.timestamp || Date.now()}.png`;
  link.download = filename;
  link.click();
}

async function deleteImageFromHistory(index) {
  if (!confirm("Delete this image from history?")) return;

  try {
    const context = SillyTavern.getContext();
    const actualIndex = (currentPage.value - 1) * itemsPerPage + index;
    const image = filteredImages.value[actualIndex];

    // Delete from server if path exists
    if (image.path) {
      try {
        await deleteImageFromServer(image.path);
      } catch (error) {
        console.error("[ST Vision] Failed to delete image from server:", error);
        // Continue with removing from history even if server delete fails
      }
    }

    // Remove from config
    context.extensionSettings.st_vision.imageHistory.splice(actualIndex, 1);

    if (context.saveSettingsDebounced) {
      context.saveSettingsDebounced();
    }

    if (paginatedImages.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error("[ST Vision] Failed to delete image:", error);
  }
}

async function clearHistory() {
  if (!confirm("Clear all image history? This cannot be undone.")) return;

  try {
    const context = SillyTavern.getContext();
    const history = context.extensionSettings.st_vision.imageHistory || [];

    // Delete all images from server
    const deletePromises = history
      .filter((img) => img.path)
      .map((img) =>
        deleteImageFromServer(img.path).catch((error) => {
          console.error(
            `[ST Vision] Failed to delete image ${img.path}:`,
            error,
          );
        }),
      );

    await Promise.all(deletePromises);

    // Clear from config
    context.extensionSettings.st_vision.imageHistory = [];

    if (context.saveSettingsDebounced) {
      context.saveSettingsDebounced();
    }

    currentPage.value = 1;
  } catch (error) {
    console.error("[ST Vision] Failed to clear history:", error);
  }
}
</script>

<style scoped>
.st-vision-image-history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 防止移动端滚动穿透 */
  overscroll-behavior: contain;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--st-vision-bg, var(--SmartThemeBlurTintColor, #1a1a2e));
  border: 1px solid var(--st-vision-border, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  /* 确保在移动端可以正确显示 */
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--st-vision-border, rgba(255, 255, 255, 0.1));
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: var(--st-vision-text, var(--SmartThemeBodyColor, #e0e0e0));
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--st-vision-text, var(--SmartThemeBodyColor, #e0e0e0));
  font-size: 1.5em;
  cursor: pointer;
  padding: 5px 10px;
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--st-vision-primary, #ff4444);
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.search-input,
.sort-select {
  flex: 1;
  min-width: 200px;
  padding: 10px 15px;
  border: 1px solid var(--st-vision-border, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  background: var(--st-vision-bg-light, rgba(255, 255, 255, 0.05));
  color: var(--st-vision-text, var(--SmartThemeBodyColor, #e0e0e0));
  font-size: 0.95em;
}

.search-input:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--st-vision-primary, rgba(255, 255, 255, 0.4));
}

.clear-btn {
  padding: 10px 20px;
  background: var(--st-vision-primary, #ff4444);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--st-vision-secondary, #cc0000);
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: var(--st-vision-text-muted, rgba(255, 255, 255, 0.6));
  font-size: 0.9em;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.image-card {
  background: var(--st-vision-bg-light, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--st-vision-border, transparent);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: var(--st-vision-primary, rgba(255, 255, 255, 0.1));
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-wrapper:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.image-wrapper:hover .image-overlay,
.image-overlay.show-overlay {
  opacity: 1;
}

.image-overlay button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.image-overlay button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.image-info {
  padding: 12px;
}

.prompt {
  font-size: 0.9em;
  margin-bottom: 8px;
  color: var(--st-vision-text, var(--SmartThemeBodyColor, #e0e0e0));
  line-height: 1.4;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: var(--st-vision-text-muted, rgba(255, 255, 255, 0.5));
}

.character {
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--st-vision-text-muted, rgba(255, 255, 255, 0.4));
}

.empty-state i {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.3;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--st-vision-border, rgba(255, 255, 255, 0.1));
}

.pagination button {
  background: var(--st-vision-bg-light, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--st-vision-border, transparent);
  color: var(--st-vision-text, var(--SmartThemeBodyColor, #e0e0e0));
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: var(--st-vision-bg-hover, rgba(255, 255, 255, 0.2));
  border-color: var(--st-vision-primary, rgba(255, 255, 255, 0.3));
}

.pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .st-vision-image-history-modal {
    padding: 0;
    align-items: stretch;
  }

  .modal-content {
    width: 100%;
    max-width: 100%;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
    /* 确保全屏显示 */
    margin: 0;
  }

  .modal-header {
    padding: 12px 15px;
    flex-shrink: 0;
    /* 防止被压缩 */
    min-height: 56px;
  }

  .modal-header h2 {
    font-size: 1.2em;
    flex: 1;
  }

  .close-btn {
    padding: 8px;
    font-size: 1.3em;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }

  .modal-body {
    padding: 12px 15px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    /* 确保可以滚动 */
    min-height: 0;
    /* 添加底部安全区域 */
    padding-bottom: max(15px, env(safe-area-inset-bottom));
  }

  .filters {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .search-input,
  .sort-select {
    width: 100%;
    min-width: 0;
    padding: 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px;
    box-sizing: border-box;
  }

  .clear-btn {
    padding: 12px 18px;
    min-height: 44px;
    font-size: 1em;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
  }

  .stats {
    flex-direction: column;
    gap: 8px;
    font-size: 0.85em;
    margin-bottom: 12px;
  }

  .image-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    /* 确保网格正确显示 */
    width: 100%;
  }

  .image-card {
    /* 确保卡片不会被压缩 */
    min-width: 0;
  }

  .image-wrapper {
    /* 确保图片容器正确显示 */
    width: 100%;
  }

  .image-overlay {
    /* 移动端始终显示，但默认透明 */
    opacity: 0;
  }

  .image-overlay.show-overlay {
    opacity: 1;
  }

  .image-overlay button {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    font-size: 0.9em;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .image-info {
    padding: 10px 8px;
  }

  .prompt {
    font-size: 0.85em;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .meta {
    font-size: 0.75em;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 15px;
    margin-top: 15px;
    /* 添加底部安全区域 */
    padding-bottom: max(15px, env(safe-area-inset-bottom));
  }

  .pagination button {
    padding: 10px 16px;
    min-height: 44px;
    min-width: 44px;
    font-size: 0.9em;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .pagination span {
    font-size: 0.9em;
    padding: 0 8px;
    flex: 1;
    text-align: center;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .empty-state i {
    font-size: 3em;
    margin-bottom: 15px;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .modal-header {
    padding: 10px 12px;
  }

  .modal-header h2 {
    font-size: 1.1em;
  }

  .modal-body {
    padding: 10px 12px;
  }

  .image-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .image-info {
    padding: 8px 6px;
  }

  .prompt {
    font-size: 0.8em;
    max-height: 2.8em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .meta {
    font-size: 0.7em;
  }

  .filters {
    gap: 6px;
  }

  .search-input,
  .sort-select,
  .clear-btn {
    padding: 10px;
    font-size: 15px;
  }
}
</style>
