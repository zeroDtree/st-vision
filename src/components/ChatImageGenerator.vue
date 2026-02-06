<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import { Vision } from "../libs/vision.js";
import { NovelAIUtils } from "../libs/novel_ai_adapter.vue";
import { smartBuildPrompt } from "../libs/prompt_parser.js";
import { uploadImage, pathToURL } from "../libs/image_api.js";

const { currentConfig, state, applyTheme } = Vision();
const { generateImage } = NovelAIUtils();

// Watch for theme changes and apply them
watch(
  () => state.theme?.current,
  (newTheme) => {
    if (newTheme) {
      applyTheme(newTheme);
    }
  },
  { immediate: true },
);

let eventSource = null;
let context = null;

const processedMessages = new Set();

const generatingPrompts = new Set();

// Global request queue to prevent API rate limiting
const requestQueue = [];
let isProcessingQueue = false;

function getMessageUid(message, fallbackMesId = null) {
  const chatId = context?.chatId || "chat";
  const mesId =
    message?.id ?? message?._stVisionMesId ?? fallbackMesId ?? "no-id";
  return `${chatId}::${mesId}`;
}

function getPromptKeyForMessage(message, prompt, fallbackMesId = null) {
  const messageUid = getMessageUid(message, fallbackMesId);
  return `${messageUid}::${prompt.trim()}`;
}

function collectImagesForPrompt(message, promptKey, prompt) {
  const globalHistory =
    context?.extensionSettings?.st_vision?.imageHistory || [];
  const refs = message?.extra?.st_vision_images || [];
  const images = [];
  const seen = new Set();

  refs
    .filter((ref) => ref.promptKey === promptKey)
    .forEach((ref) => {
      const img = getImageFromHistory(ref.imageId);
      if (img && !seen.has(img.imageId)) {
        // Ensure dataURL is set from path if needed
        if (img.path && !img.dataURL) {
          img.dataURL = pathToURL(img.path);
        }
        images.push(img);
        seen.add(img.imageId);
      }
    });

  globalHistory
    .filter((img) => img.promptKey === promptKey)
    .forEach((img) => {
      if (!seen.has(img.imageId)) {
        // Ensure dataURL is set from path if needed
        if (img.path && !img.dataURL) {
          img.dataURL = pathToURL(img.path);
        }
        images.push(img);
        seen.add(img.imageId);
      }
    });

  images.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return images;
}

// Fullscreen image viewer
function showFullscreenImage(imageDataURL, images = [], currentIndex = 0) {
  // Remove existing viewer if any
  const existingViewer = document.getElementById("st-vision-fullscreen-viewer");
  if (existingViewer) {
    existingViewer.remove();
  }

  const viewer = document.createElement("div");
  viewer.id = "st-vision-fullscreen-viewer";
  viewer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    touch-action: none;
    -webkit-overflow-scrolling: touch;
  `;

  const imageContainer = document.createElement("div");
  imageContainer.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
  `;

  const img = document.createElement("img");
  img.src = imageDataURL;
  img.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    user-select: none;
    -webkit-user-select: none;
    display: block;
    margin: auto;
    position: relative;
    z-index: 1;
    visibility: visible;
    opacity: 1;
  `;

  // 确保图片加载后正确显示
  img.onload = () => {
    // 强制重绘以确保图片显示
    img.style.display = "block";
    img.style.visibility = "visible";
    img.style.opacity = "1";
    // 在移动端，确保图片尺寸正确
    if (window.innerWidth <= 768) {
      const containerWidth = imageContainer.clientWidth;
      const containerHeight = imageContainer.clientHeight;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      if (imgAspect > containerAspect) {
        // 图片更宽，以宽度为准
        img.style.width = `${containerWidth}px`;
        img.style.height = "auto";
      } else {
        // 图片更高，以高度为准
        img.style.width = "auto";
        img.style.height = `${containerHeight}px`;
      }
    }
  };

  img.onerror = () => {
    console.error("[ST Vision] Failed to load image:", imageDataURL);
    img.style.display = "none";
    // 显示错误提示
    const errorMsg = document.createElement("div");
    errorMsg.textContent = "Failed to load image";
    errorMsg.style.cssText = `
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 16px;
    `;
    imageContainer.appendChild(errorMsg);
  };

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("tabindex", "-1");
  closeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
  closeBtn.style.cssText = `
    position: absolute;
    top: max(20px, env(safe-area-inset-top));
    right: max(20px, env(safe-area-inset-right));
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 100;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;
  closeBtn.addEventListener("focus", (e) => {
    e.preventDefault();
    closeBtn.blur();
  });
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(255, 255, 255, 0.3)";
    closeBtn.style.transform = "scale(1.1)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
    closeBtn.style.transform = "scale(1)";
  });

  // Navigation buttons (if multiple images)
  let navContainer = null;
  let prevBtn = null;
  let nextBtn = null;
  let indicator = null;
  let currentIdx = currentIndex;

  if (images.length > 1) {
    navContainer = document.createElement("div");
    navContainer.style.cssText = `
      position: absolute;
      bottom: max(20px, env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(0, 0, 0, 0.6);
      padding: 12px 20px;
      border-radius: 24px;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;

    prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.setAttribute("tabindex", "-1");
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      touch-action: manipulation;
      outline: none;
    `;
    prevBtn.addEventListener("focus", (e) => {
      e.preventDefault();
      prevBtn.blur();
    });

    indicator = document.createElement("span");
    indicator.style.cssText = `
      color: white;
      font-size: 14px;
      min-width: 60px;
      text-align: center;
    `;
    indicator.textContent = `${currentIdx + 1} / ${images.length}`;

    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.setAttribute("tabindex", "-1");
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.style.cssText = prevBtn.style.cssText;
    nextBtn.addEventListener("focus", (e) => {
      e.preventDefault();
      nextBtn.blur();
    });

    const updateImage = (newIndex) => {
      currentIdx = (newIndex + images.length) % images.length;
      img.src = images[currentIdx].dataURL;
      indicator.textContent = `${currentIdx + 1} / ${images.length}`;
    };

    const handleNavClick = (e, delta) => {
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement) {
        document.activeElement.blur();
      }
      updateImage(currentIdx + delta);
    };

    prevBtn.addEventListener("click", (e) => handleNavClick(e, -1));
    nextBtn.addEventListener("click", (e) => handleNavClick(e, 1));

    // Also handle touch events
    prevBtn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNavClick(e, -1);
      },
      { passive: false },
    );
    nextBtn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNavClick(e, 1);
      },
      { passive: false },
    );

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(indicator);
    navContainer.appendChild(nextBtn);
  }

  // Save original body styles
  const originalOverflow = document.body.style.overflow;
  const originalPosition = document.body.style.position;
  const originalWidth = document.body.style.width;
  const originalHeight = document.body.style.height;

  const closeViewer = () => {
    viewer.remove();
    document.body.style.overflow = originalOverflow || "";
    if (window.innerWidth <= 768) {
      document.body.style.position = originalPosition || "";
      document.body.style.width = originalWidth || "";
      document.body.style.height = originalHeight || "";
    }
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (document.activeElement) {
      document.activeElement.blur();
    }
    closeViewer();
  });
  closeBtn.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement) {
        document.activeElement.blur();
      }
      closeViewer();
    },
    { passive: false },
  );

  viewer.addEventListener("click", (e) => {
    if (e.target === viewer || e.target === imageContainer) {
      closeViewer();
    }
  });

  // 移动端触摸关闭（点击背景区域）
  let touchStartY = 0;
  let touchStartX = 0;
  viewer.addEventListener(
    "touchstart",
    (e) => {
      if (e.target === viewer || e.target === imageContainer) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    },
    { passive: true },
  );

  viewer.addEventListener(
    "touchend",
    (e) => {
      if (e.target === viewer || e.target === imageContainer) {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaY = Math.abs(touchEndY - touchStartY);
        const deltaX = Math.abs(touchEndX - touchStartX);
        // 如果是点击（移动距离小于10px），则关闭
        if (deltaY < 10 && deltaX < 10) {
          e.preventDefault();
          closeViewer();
        }
      }
    },
    { passive: false },
  );

  // Close on Escape key
  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      closeViewer();
      document.removeEventListener("keydown", handleKeydown);
    } else if (images.length > 1) {
      if (e.key === "ArrowLeft") {
        updateImage(currentIdx - 1);
      } else if (e.key === "ArrowRight") {
        updateImage(currentIdx + 1);
      }
    }
  };
  document.addEventListener("keydown", handleKeydown);

  // Prevent body scroll
  document.body.style.overflow = "hidden";
  // 在移动端，可能需要固定 body 位置以防止滚动
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
  }

  // 添加移动端特定的样式
  if (isMobile) {
    viewer.style.padding = "0";
    // 使用视口单位确保全屏显示
    viewer.style.width = "100vw";
    viewer.style.height = "100vh";
    viewer.style.maxWidth = "100vw";
    viewer.style.maxHeight = "100vh";

    imageContainer.style.width = "100vw";
    imageContainer.style.height = "100vh";
    imageContainer.style.maxWidth = "100vw";
    imageContainer.style.maxHeight = "100vh";
    imageContainer.style.padding =
      "max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))";

    img.style.maxWidth =
      "calc(100vw - max(40px, calc(env(safe-area-inset-left) + env(safe-area-inset-right))))";
    img.style.maxHeight =
      "calc(100vh - max(40px, calc(env(safe-area-inset-top) + env(safe-area-inset-bottom))))";
    img.style.width = "auto";
    img.style.height = "auto";
  }

  imageContainer.appendChild(img);
  if (navContainer) {
    imageContainer.appendChild(navContainer);
  }
  imageContainer.appendChild(closeBtn);
  viewer.appendChild(imageContainer);
  document.body.appendChild(viewer);

  // 确保图片在移动端正确显示 - 延迟一帧以确保样式应用
  requestAnimationFrame(() => {
    if (isMobile) {
      // 强制重新计算图片尺寸
      img.style.display = "none";
      requestAnimationFrame(() => {
        img.style.display = "block";
      });
    }
  });
}

function ensureGalleryControls(container) {
  let imageWrapper = container.querySelector(".st-vision-image-wrapper");
  if (!imageWrapper) {
    imageWrapper = document.createElement("div");
    imageWrapper.className = "st-vision-image-wrapper";
    imageWrapper.style.cssText =
      "display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;";
    container.appendChild(imageWrapper);
  } else {
    // Update existing wrapper styles
    imageWrapper.style.cssText =
      "display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;";
  }

  const openFullscreenForGallery = () => {
    const images = container._stVisionImages || [];
    const currentIndex =
      parseInt(container.dataset.currentIndex || "0", 10) || 0;
    const current = images[currentIndex];
    if (current?.dataURL) {
      showFullscreenImage(current.dataURL, images, currentIndex);
    }
  };

  const bindImageTapAndClick = (imageEl) => {
    imageEl.addEventListener("click", (e) => {
      if (
        imageEl._stVisionTapOpenedAt &&
        Date.now() - imageEl._stVisionTapOpenedAt < 400
      ) {
        delete imageEl._stVisionTapOpenedAt;
        return;
      }
      openFullscreenForGallery();
    });
    imageEl.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        imageEl._stVisionTouchStart = {
          x: t.clientX,
          y: t.clientY,
          time: Date.now(),
        };
        imageEl._stVisionTouchMoved = false;
      },
      { passive: true },
    );
    imageEl.addEventListener(
      "touchmove",
      (e) => {
        if (!imageEl._stVisionTouchStart) return;
        const t = e.touches[0];
        const dx = t.clientX - imageEl._stVisionTouchStart.x;
        const dy = t.clientY - imageEl._stVisionTouchStart.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          imageEl._stVisionTouchMoved = true;
        }
      },
      { passive: true },
    );
    imageEl.addEventListener(
      "touchend",
      (e) => {
        if (!imageEl._stVisionTouchStart) return;
        const moved = imageEl._stVisionTouchMoved;
        const duration = Date.now() - imageEl._stVisionTouchStart.time;
        imageEl._stVisionTouchStart = null;
        if (moved || duration >= 500) return;
        e.preventDefault();
        e.stopPropagation();
        imageEl._stVisionTapOpenedAt = Date.now();
        openFullscreenForGallery();
      },
      { passive: false },
    );
  };

  let img = imageWrapper.querySelector(".st-vision-image");
  if (!img) {
    img = document.createElement("img");
    img.className = "st-vision-image";
    img.style.cssText =
      "max-width: 400px; max-height: 400px; width: auto; height: auto; object-fit: contain; border-radius: 8px; display: block; cursor: pointer; margin: 0 auto; touch-action: manipulation;";
    img.title = "Click to view full size";
    bindImageTapAndClick(img);
    imageWrapper.appendChild(img);
  } else {
    // Update existing image styles
    img.style.margin = "0 auto";
    // Re-bind click handler if needed
    if (!img._stVisionClickBound) {
      bindImageTapAndClick(img);
      img._stVisionClickBound = true;
    }
  }

  let nav = imageWrapper.querySelector(".st-vision-nav");
  let indicator = imageWrapper.querySelector(".st-vision-image-indicator");
  let prevBtn = imageWrapper.querySelector(".st-vision-prev");
  let nextBtn = imageWrapper.querySelector(".st-vision-next");

  if (!nav) {
    nav = document.createElement("div");
    nav.className = "st-vision-nav";
    nav.style.cssText =
      "display: none; align-items: center; justify-content: center; gap: 8px; width: 100%; max-width: 400px; margin: 0 auto;";

    prevBtn = document.createElement("button");
    prevBtn.className = "st-vision-prev";
    prevBtn.textContent = "← Prev";
    prevBtn.style.cssText =
      "padding: 6px 12px; border-radius: 4px; border: 1px solid var(--st-vision-nav-border, #555); background: var(--st-vision-nav-bg, #3a3a3a); color: var(--st-vision-text, #e0e0e0); cursor: pointer; transition: all 0.2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent;";

    nextBtn = document.createElement("button");
    nextBtn.className = "st-vision-next";
    nextBtn.textContent = "Next →";
    nextBtn.style.cssText =
      "padding: 6px 12px; border-radius: 4px; border: 1px solid var(--st-vision-nav-border, #555); background: var(--st-vision-nav-bg, #3a3a3a); color: var(--st-vision-text, #e0e0e0); cursor: pointer; transition: all 0.2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent;";

    indicator = document.createElement("span");
    indicator.className = "st-vision-image-indicator";
    indicator.style.cssText =
      "font-size: 0.9em; color: var(--st-vision-text-muted, #b0b0b0);";

    nav.appendChild(prevBtn);
    nav.appendChild(indicator);
    nav.appendChild(nextBtn);
    imageWrapper.appendChild(nav);
  } else {
    // Update existing nav styles to ensure alignment (preserve display state)
    const currentDisplay = nav.style.display || "none";
    nav.style.cssText = `display: ${currentDisplay}; align-items: center; justify-content: center; gap: 8px; width: 100%; max-width: 400px; margin: 0 auto;`;

    // Update existing button styles with theme variables
    if (prevBtn) {
      prevBtn.style.cssText =
        "padding: 6px 12px; border-radius: 4px; border: 1px solid var(--st-vision-nav-border, #555); background: var(--st-vision-nav-bg, #3a3a3a); color: var(--st-vision-text, #e0e0e0); cursor: pointer; transition: all 0.2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent;";
    }
    if (nextBtn) {
      nextBtn.style.cssText =
        "padding: 6px 12px; border-radius: 4px; border: 1px solid var(--st-vision-nav-border, #555); background: var(--st-vision-nav-bg, #3a3a3a); color: var(--st-vision-text, #e0e0e0); cursor: pointer; transition: all 0.2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent;";
    }
    if (indicator) {
      indicator.style.cssText =
        "font-size: 0.9em; color: var(--st-vision-text-muted, #b0b0b0);";
    }
  }

  if (!prevBtn._stVisionBound) {
    prevBtn.addEventListener("click", () => shiftGallery(container, -1));
    prevBtn._stVisionBound = true;
  }
  if (!nextBtn._stVisionBound) {
    nextBtn.addEventListener("click", () => shiftGallery(container, 1));
    nextBtn._stVisionBound = true;
  }

  return { img, nav, indicator };
}

function renderGallery(container, images, startIndex = 0) {
  container._stVisionImages = images;
  const { img, nav, indicator } = ensureGalleryControls(container);

  if (!images || images.length === 0) {
    img.style.display = "none";
    nav.style.display = "none";
    indicator.textContent = "";
    container.dataset.currentIndex = "0";
    return;
  }

  const safeIndex = Math.max(0, Math.min(startIndex, images.length - 1));
  const current = images[safeIndex];

  img.style.display = "block";
  img.src = current.dataURL;
  img.dataset.imageId = current.imageId;
  container.dataset.currentIndex = String(safeIndex);

  indicator.textContent = `${safeIndex + 1}/${images.length}`;
  nav.style.display = images.length > 1 ? "flex" : "none";
}

function shiftGallery(container, delta) {
  const images = container._stVisionImages || [];
  if (!images.length) return;
  const current = parseInt(container.dataset.currentIndex || "0", 10) || 0;
  const nextIndex = (current + delta + images.length) % images.length;
  renderGallery(container, images, nextIndex);
}

function getImageFromHistory(imageId) {
  try {
    const context = SillyTavern.getContext();
    const imageHistory =
      context.extensionSettings?.st_vision?.imageHistory || [];
    const found = imageHistory.find((img) => img.imageId === imageId);

    if (found && found.path && !found.dataURL) {
      found.dataURL = pathToURL(found.path);
    }

    return found;
  } catch (error) {
    console.error("[ST Vision] Failed to get image from history:", error);
    return null;
  }
}

const getTagPattern = () => {
  const prefix = state.chatImageGen.tagPrefix.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const suffix = state.chatImageGen.tagSuffix.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  return new RegExp(`${prefix}([\\s\\S]*?)${suffix}`, "g");
};

// Process request queue sequentially to avoid API rate limiting
async function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  // Get delay from config (default to 8 seconds if not set)
  // Ensure delay is within valid range (0-12 seconds)
  let delaySeconds = state.chatImageGen.queueDelay ?? 8;
  if (delaySeconds < 0) delaySeconds = 0;
  if (delaySeconds > 12) delaySeconds = 12;
  const delayMs = delaySeconds * 1000;

  const delayWhen = state.chatImageGen.queueDelayWhen || "after_response";

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();

    if (delayWhen === "after_send") {
      // Delay is from when request is sent: start request (don't await), wait delay, then next
      request.fn().catch((error) => {
        console.error("[ST Vision] Queue request failed:", error);
      });
      if (requestQueue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } else {
      // after_response (default): wait for response, then delay before next
      try {
        await request.fn();
      } catch (error) {
        console.error("[ST Vision] Queue request failed:", error);
      }
      if (requestQueue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  isProcessingQueue = false;
}

async function generateAndInsertImage(messageId, prompt, containerElement) {
  const promptKey =
    containerElement?.dataset.promptKey ||
    `${messageId || "no-id"}::${prompt.trim()}`;

  if (generatingPrompts.has(promptKey)) {
    return;
  }

  if (!containerElement) {
    console.error("[ST Vision] No container element provided");
    return;
  }

  const button = containerElement.querySelector(".st-vision-generate-btn");
  if (!button) {
    console.error("[ST Vision] Button not found in container");
    return;
  }

  if (button.disabled) {
    return;
  }

  generatingPrompts.add(promptKey);
  button.disabled = true;
  // Get original HTML from dataset, or fallback to current HTML if not set
  const originalHTML = button.dataset.originalHtml || button.innerHTML;
  // Ensure dataset has the original HTML for future use
  if (!button.dataset.originalHtml) {
    button.dataset.originalHtml = originalHTML;
  }
  button.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

  // Generation logic
  const executeGeneration = async () => {
    try {
      const config = currentConfig.value;

      const parsed = smartBuildPrompt(
        config.prompt_prefix || "",
        prompt.trim(),
        config.prompt_suffix || "",
        config.negative_prompt || "",
        config.model,
      );

      let generateParams = {};

      if (parsed.hasCharacters) {
        generateParams = {
          prompt: parsed.prompt || prompt.trim(),
          negative_prompt: parsed.negative_prompt,
          v4_prompt: parsed.v4_prompt,
          v4_negative_prompt: parsed.v4_negative_prompt,
          use_coords: parsed.use_coords,
          characterPrompts: parsed.characterPrompts,
        };
      } else {
        generateParams = {
          prompt: parsed.prompt || prompt.trim(),
          negative_prompt: parsed.negative_prompt,
        };
      }

      if (typeof generateImage !== "function") {
        throw new Error(
          "generateImage is not a function. Check if NovelAIUtils is properly initialized.",
        );
      }

      const result = await generateImage(generateParams, false);

      let imageData = null;
      if (Array.isArray(result) && result.length > 0) {
        imageData = result[0];
      } else if (result && result.dataURL) {
        imageData = result;
      }

      if (!imageData || !imageData.dataURL) {
        throw new Error("Failed to generate image");
      }

      const saved = await saveImageToChat(
        messageId,
        imageData.dataURL,
        prompt,
        containerElement?.dataset.mesid ?? null,
      );

      const newEntry = saved?.imageEntry || {
        imageId: saved?.imageRef?.imageId,
        prompt: prompt.trim(),
        dataURL: imageData.dataURL,
        timestamp: Date.now(),
        promptKey,
        messageId,
      };
      const galleryImages = containerElement._stVisionImages || [];
      const updatedImages = [...galleryImages, newEntry].filter(
        (img) => img && img.imageId,
      );

      button.disabled = false;
      // Always restore to original HTML from dataset (not the saved originalHTML variable)
      const restoredHTML =
        button.dataset.originalHtml ||
        originalHTML ||
        '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Image';
      button.innerHTML = restoredHTML;

      renderGallery(containerElement, updatedImages, updatedImages.length - 1);
    } catch (error) {
      console.error("[ST Vision] Failed to generate image:", error);
      button.disabled = false;
      // Show retry button, but keep original HTML in dataset for future recovery
      button.innerHTML =
        '<i class="fa-solid fa-exclamation-triangle"></i> Retry';
      // Ensure original HTML is preserved in dataset if not already set
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml =
          originalHTML ||
          '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Image';
      }
      alert("Failed to generate image: " + error.message);
    } finally {
      generatingPrompts.delete(promptKey);
    }
  };

  // Use queue if enabled, otherwise execute directly
  if (state.chatImageGen.useRequestQueue) {
    requestQueue.push({ fn: executeGeneration });
    processRequestQueue();
  } else {
    executeGeneration();
  }
}

async function saveImageToChat(
  messageId,
  imageDataURL,
  prompt,
  fallbackMesId = null,
) {
  try {
    if (!context || !context.chat) return;

    let message = null;
    if (messageId !== undefined && messageId !== null) {
      message = context.chat.find((msg) => msg.id === messageId);
    }

    if (!message) {
      const idx =
        fallbackMesId !== null ? parseInt(String(fallbackMesId), 10) : NaN;
      if (!Number.isNaN(idx) && idx >= 0 && idx < context.chat.length) {
        message = context.chat[idx];
      }
    }

    if (!message) {
      console.warn("[ST Vision] Message not found for messageId:", messageId);
      return;
    }

    const timestamp = Date.now();
    const imageId = `st-vision-${timestamp}-${Math.random().toString(36).substring(7)}`;
    const promptKey = getPromptKeyForMessage(message, prompt, fallbackMesId);

    const imageEntry = await saveToGlobalHistory(
      imageId,
      imageDataURL,
      prompt,
      message,
      promptKey,
    );

    if (!message.extra) {
      message.extra = {};
    }
    if (!message.extra.st_vision_images) {
      message.extra.st_vision_images = [];
    }

    const imageRef = {
      imageId: imageId,
      prompt: prompt,
      promptKey,
      timestamp: timestamp,
    };

    message.extra.st_vision_images.push(imageRef);

    if (context.saveChat) {
      await context.saveChat();
    }

    return { imageEntry, imageRef };
  } catch (error) {
    console.error("[ST Vision] Failed to save image to chat:", error);
  }
}

async function saveToGlobalHistory(
  imageId,
  imageDataURL,
  prompt,
  message,
  promptKey,
) {
  try {
    const context = SillyTavern.getContext();
    const extensionSettings = context.extensionSettings;

    if (!extensionSettings.st_vision) {
      extensionSettings.st_vision = {};
    }
    if (!extensionSettings.st_vision.imageHistory) {
      extensionSettings.st_vision.imageHistory = [];
    }

    // Upload image to ST server
    const characterName = message.name || null;
    const filename = `${imageId}.png`;
    const uploadResult = await uploadImage(
      imageDataURL,
      characterName,
      filename,
    );

    // Store only metadata in config (not the full image data)
    const imageEntry = {
      imageId: imageId,
      prompt: prompt,
      path: uploadResult.path,
      timestamp: Date.now(),
      promptKey,
      characterName: message.name,
      chatId: context.chatId,
      messageId: message.id,
      isUser: message.is_user,
    };

    const existingIndex = extensionSettings.st_vision.imageHistory.findIndex(
      (img) => img.imageId === imageId,
    );

    if (existingIndex >= 0) {
      extensionSettings.st_vision.imageHistory[existingIndex] = imageEntry;
    } else {
      extensionSettings.st_vision.imageHistory.unshift(imageEntry);
    }

    if (extensionSettings.st_vision.imageHistory.length > 1000) {
      extensionSettings.st_vision.imageHistory =
        extensionSettings.st_vision.imageHistory.slice(0, 1000);
    }

    if (context.saveSettingsDebounced) {
      context.saveSettingsDebounced();
    }

    return {
      ...imageEntry,
      dataURL: imageDataURL,
    };
  } catch (error) {
    console.error("[ST Vision] Failed to save to global history:", error);
    throw error;
  }
}

// Helper function to rebind button events after HTML insertion
function rebindButtonEvents(button, message, prompt, container) {
  if (!button || !container) {
    console.error(
      "[ST Vision] Cannot rebind events: missing button or container",
    );
    return;
  }

  // Ensure button has correct attributes
  button.type = "button";
  button.setAttribute("tabindex", "-1");

  // Ensure original HTML is saved in dataset if not already set
  if (!button.dataset.originalHtml) {
    const defaultHTML =
      '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Image';
    // If button is in error state (showing Retry), save the default HTML
    // Otherwise, save current HTML as original
    if (
      button.innerHTML.includes("Retry") ||
      button.innerHTML.includes("exclamation-triangle")
    ) {
      button.dataset.originalHtml = defaultHTML;
    } else {
      button.dataset.originalHtml = button.innerHTML || defaultHTML;
    }
  }

  // Prevent focus events that might trigger keyboard
  button.addEventListener("focus", (e) => {
    e.preventDefault();
    button.blur();
  });
  button.addEventListener("focusin", (e) => {
    e.preventDefault();
    button.blur();
  });

  // Re-bind click handler
  const handleButtonClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent keyboard from opening
    if (document.activeElement) {
      document.activeElement.blur();
    }
    button.blur();

    if (button.disabled) {
      return;
    }

    try {
      generateAndInsertImage(message.id, prompt, container);
    } catch (error) {
      console.error("[ST Vision] Error in button click handler:", error);
      alert("Error generating image: " + error.message);
    }
  };

  // Add click event listener
  button.addEventListener("click", handleButtonClick, false);

  // Touch events for mobile - prevent keyboard
  let touchStartTime = 0;
  let touchMoved = false;

  button.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      touchStartTime = Date.now();
      touchMoved = false;
      button.style.opacity = "0.8";
      // Blur any focused element to prevent keyboard
      if (document.activeElement && document.activeElement !== button) {
        document.activeElement.blur();
      }
    },
    { passive: false },
  );

  button.addEventListener(
    "touchmove",
    (e) => {
      touchMoved = true;
    },
    { passive: true },
  );

  button.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const touchDuration = Date.now() - touchStartTime;

      // Only trigger click if it was a tap (not a swipe)
      if (!touchMoved && touchDuration < 500) {
        handleButtonClick(e);
      }

      // Restore opacity
      if (touchDuration < 300) {
        setTimeout(() => {
          button.style.opacity = "1";
        }, 150);
      } else {
        button.style.opacity = "1";
      }

      // Ensure keyboard doesn't open
      button.blur();
      if (document.activeElement) {
        document.activeElement.blur();
      }
    },
    { passive: false },
  );

  button.addEventListener(
    "touchcancel",
    (e) => {
      e.preventDefault();
      button.style.opacity = "1";
      button.blur();
    },
    { passive: false },
  );
}

function createImageContainer(promptKey, prompt, fullTag, message, domMesId) {
  const container = document.createElement("div");
  container.className = "st-vision-inline-container";
  container.style.cssText = `
    display: inline-block;
    margin: 8px 0;
    padding: 12px;
    border: 1px solid var(--st-vision-border, #404040);
    border-radius: 8px;
    background: var(--st-vision-bg, #2a2a2a);
    max-width: 424px;
    width: 100%;
    box-sizing: border-box;
  `;
  container.dataset.promptKey = promptKey;
  container.dataset.messageId = message.id ?? "";
  container.dataset.mesid = domMesId ?? "";

  const button = document.createElement("button");
  button.type = "button"; // Explicitly set type to prevent form submission and keyboard
  button.className = "st-vision-generate-btn";
  button.setAttribute("tabindex", "-1"); // Prevent keyboard focus
  button.style.cssText = `
    background: var(--st-vision-button-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 8px;
    width: 100%;
    box-sizing: border-box;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    z-index: 1;
    pointer-events: auto;
    user-select: none;
    -webkit-user-select: none;
    outline: none;
  `;
  const originalButtonHTML =
    '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Image';
  button.innerHTML = originalButtonHTML;
  button.dataset.originalHtml = originalButtonHTML; // Save original HTML for recovery
  button.title = `Generate image: ${prompt.trim().substring(0, 50)}...`;
  button.dataset.prompt = prompt.trim();
  button.dataset.originalTag = fullTag;

  // Prevent focus events that might trigger keyboard
  button.addEventListener("focus", (e) => {
    e.preventDefault();
    button.blur();
  });
  button.addEventListener("focusin", (e) => {
    e.preventDefault();
    button.blur();
  });

  // Only add hover effects on non-touch devices
  if (window.matchMedia("(hover: hover)").matches) {
    button.addEventListener("mouseenter", () => {
      button.style.background =
        "var(--st-vision-button-hover, linear-gradient(135deg, #7a8ef0 0%, #8650b8 100%))";
      button.style.transform = "scale(1.02)";
      button.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.4)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background =
        "var(--st-vision-button-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))";
      button.style.transform = "scale(1)";
      button.style.boxShadow = "none";
    });
  }

  // Click handler function
  const handleButtonClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent keyboard from opening
    if (document.activeElement) {
      document.activeElement.blur();
    }
    button.blur();

    // Double check button is not disabled
    if (button.disabled) {
      return;
    }

    try {
      generateAndInsertImage(message.id, prompt, container);
    } catch (error) {
      console.error("[ST Vision] Error in button click handler:", error);
      alert("Error generating image: " + error.message);
    }
  };

  // Touch feedback and handling
  let touchStartTime = 0;
  let touchMoved = false;

  button.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault(); // Prevent default touch behavior (including keyboard)
      e.stopPropagation();
      touchStartTime = Date.now();
      touchMoved = false;
      button.style.opacity = "0.8";
      // Blur any focused element to prevent keyboard
      if (document.activeElement && document.activeElement !== button) {
        document.activeElement.blur();
      }
    },
    { passive: false },
  );

  button.addEventListener(
    "touchmove",
    (e) => {
      touchMoved = true;
    },
    { passive: true },
  );

  button.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault(); // Prevent default touch behavior
      e.stopPropagation();

      const touchDuration = Date.now() - touchStartTime;

      // Only trigger click if it was a tap (not a swipe)
      if (!touchMoved && touchDuration < 500) {
        handleButtonClick(e);
      }

      // Restore opacity
      if (touchDuration < 300) {
        setTimeout(() => {
          button.style.opacity = "1";
        }, 150);
      } else {
        button.style.opacity = "1";
      }

      // Ensure keyboard doesn't open
      button.blur();
      if (document.activeElement) {
        document.activeElement.blur();
      }
    },
    { passive: false },
  );

  button.addEventListener(
    "touchcancel",
    (e) => {
      e.preventDefault();
      button.style.opacity = "1";
      button.blur();
    },
    { passive: false },
  );

  // Add click event listener (for desktop)
  button.addEventListener("click", handleButtonClick, false);

  container.appendChild(button);

  const galleryImages = collectImagesForPrompt(message, promptKey, prompt);
  renderGallery(container, galleryImages, 0);

  return container;
}

function processMessage(message, messageElement) {
  if (!message || !messageElement) {
    return;
  }

  const domMesId = messageElement.getAttribute("mesid");
  message._stVisionMesId = domMesId;

  const messageKey = `${context?.chatId || "chat"}_${domMesId ?? message.id ?? "no-id"}_${message.mes?.length || 0}`;

  if (processedMessages.has(messageKey)) {
    return;
  }

  if (!state.chatImageGen.enabled) {
    return;
  }

  const mesText = messageElement.querySelector(".mes_text");
  if (!mesText) {
    return;
  }

  // Get the original text content for pattern matching
  // This preserves regex plugin transformations that may have modified the text
  const originalContent = message.mes || "";
  const tagPattern = getTagPattern();

  // Find matches in the original text to get the tag patterns
  const matches = [...originalContent.matchAll(tagPattern)];

  if (matches.length === 0) {
    return;
  }

  const existingContainers = mesText.querySelectorAll(
    ".st-vision-inline-container",
  );
  if (existingContainers.length > 0) {
    let allHaveImages = true;
    existingContainers.forEach((container) => {
      if (!container.querySelector("img")) {
        allHaveImages = false;
      }
    });

    if (existingContainers.length === matches.length && allHaveImages) {
      processedMessages.add(messageKey);
      return;
    }

    existingContainers.forEach((container) => container.remove());
  }

  processedMessages.add(messageKey);

  // Preserve the existing HTML structure from regex plugin and other formatters
  // Strategy: Work with the existing HTML, find tags in text content, and replace them
  // while preserving surrounding HTML elements (like <mark> tags from regex)

  // Save the current HTML to preserve regex formatting
  let currentHTML = mesText.innerHTML;

  // Replace each tag in the HTML by finding it in the text content and replacing it
  // Process in reverse order to maintain correct positions
  matches.reverse().forEach((match) => {
    const fullTag = match[0];
    const prompt = match[1] || match[0];
    const promptKey = getPromptKeyForMessage(message, prompt, domMesId);

    // Create the container - DO NOT convert to HTML string to preserve event listeners
    const container = createImageContainer(
      promptKey,
      prompt,
      fullTag,
      message,
      domMesId,
    );

    // Find the tag in the current HTML's text content
    // We need to find it even if it's inside HTML tags (like <mark>)
    const textContent = mesText.textContent || "";
    const tagIndex = textContent.indexOf(fullTag);

    if (tagIndex === -1) {
      console.warn(
        "[ST Vision] Tag not found in DOM text content, may have been modified by regex",
      );
      // Try to find a partial match or skip
      return;
    }

    // Use Range API to find and replace the tag while preserving HTML structure
    const range = document.createRange();
    const walker = document.createTreeWalker(
      mesText,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let currentPos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    let node;
    while ((node = walker.nextNode())) {
      const nodeText = node.textContent || "";
      const nodeStart = currentPos;
      const nodeEnd = currentPos + nodeText.length;

      // Check if tag starts in this node
      if (!startNode && tagIndex >= nodeStart && tagIndex < nodeEnd) {
        startNode = node;
        startOffset = tagIndex - nodeStart;
      }

      // Check if tag ends in this node
      if (
        startNode &&
        tagIndex + fullTag.length > nodeStart &&
        tagIndex + fullTag.length <= nodeEnd
      ) {
        endNode = node;
        endOffset = tagIndex + fullTag.length - nodeStart;
        break;
      }

      currentPos = nodeEnd;
    }

    if (startNode && endNode) {
      // Set range to the matched text
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);

      // Delete the matched content
      range.deleteContents();

      // Insert the container directly (not as HTML string) to preserve event listeners
      // This is critical - inserting the actual DOM node preserves all event listeners
      range.insertNode(container);
    } else {
      // Fallback: use string replacement but then re-bind events
      // First, find the container's parent to get the correct container reference
      const tempDiv = document.createElement("div");
      const clonedContainer = container.cloneNode(true);
      tempDiv.appendChild(clonedContainer);
      const containerHTML = tempDiv.innerHTML;

      // Replace in HTML string
      const newHTML = currentHTML.replace(fullTag, containerHTML);
      mesText.innerHTML = newHTML;

      // Find the newly inserted container and button
      const insertedContainer = mesText.querySelector(
        `.st-vision-inline-container[data-prompt-key="${promptKey}"]`,
      );
      const insertedButton = insertedContainer?.querySelector(
        ".st-vision-generate-btn",
      );

      if (insertedButton && insertedContainer) {
        // Re-bind all events to the newly inserted button
        rebindButtonEvents(insertedButton, message, prompt, insertedContainer);

        // Also need to re-bind gallery navigation buttons
        const prevBtn = insertedContainer.querySelector(".st-vision-prev");
        const nextBtn = insertedContainer.querySelector(".st-vision-next");
        if (prevBtn && !prevBtn._stVisionBound) {
          prevBtn.addEventListener("click", () =>
            shiftGallery(insertedContainer, -1),
          );
          prevBtn._stVisionBound = true;
        }
        if (nextBtn && !nextBtn._stVisionBound) {
          nextBtn.addEventListener("click", () =>
            shiftGallery(insertedContainer, 1),
          );
          nextBtn._stVisionBound = true;
        }
      } else {
        console.error(
          "[ST Vision] Could not find inserted button/container for event rebinding",
        );
      }
    }
  });
}

function scanMessages() {
  if (!context) {
    return;
  }

  context = SillyTavern.getContext();
  const chat = context.chat;

  let chatArray = [];
  if (chat) {
    for (let item of chat) {
      chatArray.push(item);
    }
  }

  const messageElements = document.querySelectorAll(".mes");

  if (chatArray.length === 0 || messageElements.length === 0) {
    return;
  }

  chatArray.forEach((message, i) => {
    let messageElement = null;
    for (const elem of messageElements) {
      const mesid = elem.getAttribute("mesid");
      if (mesid !== null && parseInt(mesid) === i) {
        messageElement = elem;
        break;
      }
    }

    if (!messageElement) {
      return;
    }

    processMessage(message, messageElement);
  });
}

// Event handler configuration: { clearProcessed, delay, logPrefix }
const eventConfig = {
  // Message events
  MESSAGE_SENT: {
    clearProcessed: false,
    delay: 500,
    logPrefix: "MESSAGE_SENT",
  },
  MESSAGE_RECEIVED: {
    clearProcessed: false,
    delay: 500,
    logPrefix: "MESSAGE_RECEIVED",
  },
  MESSAGE_EDITED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "MESSAGE_EDITED",
  },
  MESSAGE_UPDATED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "MESSAGE_UPDATED",
  },
  MESSAGE_DELETED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "MESSAGE_DELETED",
  },
  MESSAGE_SWIPED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "MESSAGE_SWIPED",
  },
  MESSAGE_SWIPE_DELETED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "MESSAGE_SWIPE_DELETED",
  },
  MESSAGE_FILE_EMBEDDED: {
    clearProcessed: true,
    delay: 200,
    logPrefix: "MESSAGE_FILE_EMBEDDED",
  },
  MESSAGE_REASONING_EDITED: {
    clearProcessed: false,
    delay: 100,
    logPrefix: "MESSAGE_REASONING_EDITED",
  },
  MESSAGE_REASONING_DELETED: {
    clearProcessed: false,
    delay: 100,
    logPrefix: "MESSAGE_REASONING_DELETED",
  },
  MORE_MESSAGES_LOADED: {
    clearProcessed: true,
    delay: 500,
    logPrefix: "MORE_MESSAGES_LOADED",
  },
  USER_MESSAGE_RENDERED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "USER_MESSAGE_RENDERED",
  },
  CHARACTER_MESSAGE_RENDERED: {
    clearProcessed: true,
    delay: 100,
    logPrefix: "CHARACTER_MESSAGE_RENDERED",
  },
  // Chat events
  CHAT_CHANGED: {
    clearProcessed: true,
    delay: 2000,
    logPrefix: "CHAT_CHANGED",
  },
  CHAT_LOADED: { clearProcessed: true, delay: 1000, logPrefix: "CHAT_LOADED" },
  CHAT_CREATED: {
    clearProcessed: true,
    delay: 1000,
    logPrefix: "CHAT_CREATED",
  },
  CHAT_DELETED: { clearProcessed: true, delay: 500, logPrefix: "CHAT_DELETED" },
  GROUP_CHAT_CREATED: {
    clearProcessed: true,
    delay: 1000,
    logPrefix: "GROUP_CHAT_CREATED",
  },
  GROUP_CHAT_DELETED: {
    clearProcessed: true,
    delay: 500,
    logPrefix: "GROUP_CHAT_DELETED",
  },
};

function handleEvent(eventType, data) {
  const config = eventConfig[eventType];
  if (!config) {
    return;
  }

  if (config.clearProcessed) {
    processedMessages.clear();
  }

  context = SillyTavern.getContext();

  setTimeout(() => {
    scanMessages();
  }, config.delay);
}

function initialize() {
  try {
    // Apply theme on initialization
    if (state.theme?.current) {
      applyTheme(state.theme.current);
    }

    context = SillyTavern.getContext();
    eventSource = context.eventSource;

    if (!eventSource) {
      console.error("[ST Vision] Event source not available");
      return;
    }

    const { eventTypes } = context;
    const eventHandlers = new Map();

    // Register all configured events
    Object.keys(eventConfig).forEach((eventKey) => {
      const eventName = eventTypes[eventKey];
      if (eventName) {
        const handler = (data) => handleEvent(eventKey, data);
        eventSource.on(eventName, handler);
        eventHandlers.set(eventKey, { eventName, handler });
      }
    });

    // Store handlers for cleanup
    context._stVisionEventHandlers = eventHandlers;

    if (context.chat && context.chat.length > 0) {
      setTimeout(() => {
        scanMessages();
      }, 2000);
    }
  } catch (error) {
    console.error("[ST Vision] Failed to initialize:", error);
  }
}

function cleanup() {
  if (eventSource && context && context._stVisionEventHandlers) {
    const handlers = context._stVisionEventHandlers;
    handlers.forEach(({ eventName, handler }) => {
      eventSource.off(eventName, handler);
    });
    delete context._stVisionEventHandlers;
  }
}

onMounted(() => {
  initialize();
});

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div style="display: none"></div>
</template>

<style>
.st-vision-inline-generator {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.st-vision-inline-container {
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.st-vision-generate-btn {
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
}

.st-vision-image-wrapper {
  box-sizing: border-box;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .st-vision-inline-container {
    max-width: 100% !important;
    padding: 10px !important;
  }

  .st-vision-image {
    max-width: 100% !important;
    max-height: 300px !important;
  }

  .st-vision-generate-btn {
    padding: 10px 16px !important;
    font-size: 1em !important;
    min-height: 44px;
  }

  .st-vision-nav {
    max-width: 100% !important;
    padding: 8px !important;
  }

  .st-vision-prev,
  .st-vision-next {
    padding: 8px 12px !important;
    min-height: 44px;
    font-size: 0.95em !important;
  }
}

/* Tablet adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .st-vision-inline-container {
    max-width: 500px !important;
  }

  .st-vision-image {
    max-width: 450px !important;
    max-height: 450px !important;
  }
}

.st-vision-generate-btn:active {
  transform: scale(0.95) !important;
}

@media (hover: hover) {
  .st-vision-prev:hover,
  .st-vision-next:hover {
    background: var(--st-vision-bg-hover, #4a4a4a) !important;
    border-color: var(--st-vision-primary, #667eea) !important;
    transform: scale(1.05);
  }
}

.st-vision-prev:active,
.st-vision-next:active {
  transform: scale(0.95) !important;
}

.st-vision-generated-image {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
