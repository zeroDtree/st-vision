/**
 * Image API utility for SillyTavern image persistence
 * Uses ST's native image API endpoints instead of storing images in config
 */

const IMAGE_FOLDER = "st-vision";

/**
 * Get request headers with CSRF token
 */
function getRequestHeaders() {
  try {
    const context = SillyTavern.getContext();
    if (context?.getRequestHeaders) {
      return context.getRequestHeaders();
    }
  } catch (error) {
    console.warn("[ST Vision] Failed to get request headers:", error);
  }

  return {
    "Content-Type": "application/json",
  };
}

/**
 * Convert dataURL to base64 string (remove data:image/...;base64, prefix)
 */
function dataURLToBase64(dataURL) {
  const base64Index = dataURL.indexOf(",");
  if (base64Index === -1) {
    throw new Error("Invalid dataURL format");
  }
  return dataURL.substring(base64Index + 1);
}

/**
 * Extract format from dataURL
 */
function getFormatFromDataURL(dataURL) {
  const match = dataURL.match(/data:image\/(\w+);base64,/);
  return match ? match[1] : "png";
}

/**
 * Upload image to ST server
 * @param {string} imageDataURL - Base64 encoded image data URL
 * @param {string} [characterName] - Optional character name for folder organization
 * @param {string} [filename] - Optional custom filename
 * @returns {Promise<{path: string, format: string}>} - Server path and format
 */
export async function uploadImage(
  imageDataURL,
  characterName = null,
  filename = null,
) {
  try {
    const base64Data = dataURLToBase64(imageDataURL);
    const format = getFormatFromDataURL(imageDataURL);

    const requestBody = {
      image: base64Data,
      format: format,
    };

    if (characterName) {
      requestBody.ch_name = characterName;
    }

    if (filename) {
      requestBody.filename = filename;
    }

    const response = await fetch("/api/images/upload", {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return {
      path: result.path,
      format: format,
    };
  } catch (error) {
    console.error("[ST Vision] Failed to upload image:", error);
    throw error;
  }
}

/**
 * Delete image from ST server
 * @param {string} imagePath - Server path to the image
 * @returns {Promise<void>}
 */
export async function deleteImage(imagePath) {
  try {
    const response = await fetch("/api/images/delete", {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify({ path: imagePath }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `Delete failed: ${response.status}`);
    }
  } catch (error) {
    console.error("[ST Vision] Failed to delete image:", error);
    throw error;
  }
}

/**
 * List images in a folder
 * @param {string} folder - Folder name (default: "st-vision")
 * @param {Object} options - Additional options (sort, order, type)
 * @returns {Promise<Array>} - Array of image metadata
 */
export async function listImages(folder = IMAGE_FOLDER, options = {}) {
  try {
    const requestBody = {
      folder: folder,
      sortField: options.sortField || "date",
      sortOrder: options.sortOrder || "desc",
      type: options.type || 0, // 0 = IMAGE
    };

    const response = await fetch("/api/images/list", {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `List failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[ST Vision] Failed to list images:", error);
    throw error;
  }
}

/**
 * Convert server path to URL
 * @param {string} path - Server path
 * @returns {string} - URL path
 */
export function pathToURL(path) {
  if (!path) return null;
  return path.startsWith("/") ? path : `/${path}`;
}
