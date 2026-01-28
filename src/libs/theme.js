import { computed } from "vue";

// Comprehensive theme definitions with high contrast for readability
export const THEMES = {
  dark: {
    name: "Dark",
    colors: {
      // Primary colors
      primary: "#667eea",
      primaryHover: "#7a8ef0",
      primaryLight: "#8b9ef5",
      secondary: "#764ba2",
      secondaryHover: "#8650b8",

      // Background colors
      background: "#1e1e1e",
      backgroundLight: "#2a2a2a",
      backgroundHover: "#353535",
      backgroundActive: "#404040",
      backgroundElevated: "#2f2f2f",

      // Text colors (high contrast for readability)
      text: "#ffffff",
      textMuted: "#b0b0b0",
      textDisabled: "#666666",
      textInverse: "#1a1a1a",

      // Border colors
      border: "#555555",
      borderLight: "#666666",
      borderDark: "#404040",

      // Button colors
      buttonBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      buttonHover: "linear-gradient(135deg, #7a8ef0 0%, #8650b8 100%)",
      buttonActive: "linear-gradient(135deg, #5a6ed8 0%, #6a3a92 100%)",
      buttonText: "#ffffff",

      // Navigation colors
      navBg: "#2a2a2a",
      navBorder: "#555555",
      navHover: "#353535",

      // Panel colors
      panelBg: "#2a2a2a",
      panelBorder: "#555555",
      panelHeader: "#353535",

      // Input colors
      inputBg: "#2a2a2a",
      inputBorder: "#555555",
      inputFocus: "#667eea",
      inputText: "#ffffff",
      inputPlaceholder: "#888888",

      // Card colors
      cardBg: "#2a2a2a",
      cardBorder: "#555555",
      cardHover: "#353535",

      // Status colors
      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      // Shadow
      shadow: "rgba(0, 0, 0, 0.3)",
      shadowLight: "rgba(0, 0, 0, 0.1)",
    },
  },
  light: {
    name: "Light",
    colors: {
      primary: "#667eea",
      primaryHover: "#7a8ef0",
      primaryLight: "#8b9ef5",
      secondary: "#764ba2",
      secondaryHover: "#8650b8",

      background: "#ffffff",
      backgroundLight: "#f8f8f8",
      backgroundHover: "#eeeeee",
      backgroundActive: "#e0e0e0",
      backgroundElevated: "#f5f5f5",

      text: "#1a1a1a",
      textMuted: "#666666",
      textDisabled: "#999999",
      textInverse: "#ffffff",

      border: "#cccccc",
      borderLight: "#dddddd",
      borderDark: "#aaaaaa",

      buttonBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      buttonHover: "linear-gradient(135deg, #7a8ef0 0%, #8650b8 100%)",
      buttonActive: "linear-gradient(135deg, #5a6ed8 0%, #6a3a92 100%)",
      buttonText: "#ffffff",

      navBg: "#f8f8f8",
      navBorder: "#cccccc",
      navHover: "#eeeeee",

      panelBg: "#f8f8f8",
      panelBorder: "#cccccc",
      panelHeader: "#eeeeee",

      inputBg: "#ffffff",
      inputBorder: "#cccccc",
      inputFocus: "#667eea",
      inputText: "#1a1a1a",
      inputPlaceholder: "#999999",

      cardBg: "#ffffff",
      cardBorder: "#cccccc",
      cardHover: "#f5f5f5",

      success: "#059669",
      successBg: "#d1fae5",
      warning: "#d97706",
      warningBg: "#fef3c7",
      error: "#dc2626",
      errorBg: "#fee2e2",
      info: "#2563eb",
      infoBg: "#dbeafe",

      shadow: "rgba(0, 0, 0, 0.1)",
      shadowLight: "rgba(0, 0, 0, 0.05)",
    },
  },
  blue: {
    name: "Blue",
    colors: {
      primary: "#3b82f6",
      primaryHover: "#60a5fa",
      primaryLight: "#93c5fd",
      secondary: "#2563eb",
      secondaryHover: "#3b82f6",

      background: "#0f172a",
      backgroundLight: "#1e293b",
      backgroundHover: "#334155",
      backgroundActive: "#475569",
      backgroundElevated: "#1e293b",

      text: "#f8fafc",
      textMuted: "#cbd5e1",
      textDisabled: "#64748b",
      textInverse: "#0f172a",

      border: "#475569",
      borderLight: "#64748b",
      borderDark: "#334155",

      buttonBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      buttonHover: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
      buttonActive: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      buttonText: "#ffffff",

      navBg: "#1e293b",
      navBorder: "#475569",
      navHover: "#334155",

      panelBg: "#1e293b",
      panelBorder: "#475569",
      panelHeader: "#334155",

      inputBg: "#1e293b",
      inputBorder: "#475569",
      inputFocus: "#3b82f6",
      inputText: "#f8fafc",
      inputPlaceholder: "#94a3b8",

      cardBg: "#1e293b",
      cardBorder: "#475569",
      cardHover: "#334155",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(15, 23, 42, 0.4)",
      shadowLight: "rgba(15, 23, 42, 0.2)",
    },
  },
  green: {
    name: "Green",
    colors: {
      primary: "#10b981",
      primaryHover: "#34d399",
      primaryLight: "#6ee7b7",
      secondary: "#059669",
      secondaryHover: "#10b981",

      background: "#0a1f1a",
      backgroundLight: "#1a2e28",
      backgroundHover: "#2a3d36",
      backgroundActive: "#3a4c44",
      backgroundElevated: "#1a2e28",

      text: "#f0fdf4",
      textMuted: "#c6f6d5",
      textDisabled: "#86efac",
      textInverse: "#0a1f1a",

      border: "#3a4c44",
      borderLight: "#4a5d55",
      borderDark: "#2a3d36",

      buttonBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      buttonHover: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
      buttonActive: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      buttonText: "#ffffff",

      navBg: "#1a2e28",
      navBorder: "#3a4c44",
      navHover: "#2a3d36",

      panelBg: "#1a2e28",
      panelBorder: "#3a4c44",
      panelHeader: "#2a3d36",

      inputBg: "#1a2e28",
      inputBorder: "#3a4c44",
      inputFocus: "#10b981",
      inputText: "#f0fdf4",
      inputPlaceholder: "#86efac",

      cardBg: "#1a2e28",
      cardBorder: "#3a4c44",
      cardHover: "#2a3d36",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(10, 31, 26, 0.4)",
      shadowLight: "rgba(10, 31, 26, 0.2)",
    },
  },
  purple: {
    name: "Purple",
    colors: {
      primary: "#8b5cf6",
      primaryHover: "#a78bfa",
      primaryLight: "#c4b5fd",
      secondary: "#7c3aed",
      secondaryHover: "#8b5cf6",

      background: "#1a0f2e",
      backgroundLight: "#2a1f3e",
      backgroundHover: "#3a2f4e",
      backgroundActive: "#4a3f5e",
      backgroundElevated: "#2a1f3e",

      text: "#faf5ff",
      textMuted: "#e9d5ff",
      textDisabled: "#c084fc",
      textInverse: "#1a0f2e",

      border: "#4a3f5e",
      borderLight: "#5a4f6e",
      borderDark: "#3a2f4e",

      buttonBg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      buttonHover: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
      buttonActive: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      buttonText: "#ffffff",

      navBg: "#2a1f3e",
      navBorder: "#4a3f5e",
      navHover: "#3a2f4e",

      panelBg: "#2a1f3e",
      panelBorder: "#4a3f5e",
      panelHeader: "#3a2f4e",

      inputBg: "#2a1f3e",
      inputBorder: "#4a3f5e",
      inputFocus: "#8b5cf6",
      inputText: "#faf5ff",
      inputPlaceholder: "#c084fc",

      cardBg: "#2a1f3e",
      cardBorder: "#4a3f5e",
      cardHover: "#3a2f4e",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(26, 15, 46, 0.4)",
      shadowLight: "rgba(26, 15, 46, 0.2)",
    },
  },
  red: {
    name: "Red",
    colors: {
      primary: "#ef4444",
      primaryHover: "#f87171",
      primaryLight: "#fca5a5",
      secondary: "#dc2626",
      secondaryHover: "#ef4444",

      background: "#1f0a0a",
      backgroundLight: "#2f1a1a",
      backgroundHover: "#3f2a2a",
      backgroundActive: "#4f3a3a",
      backgroundElevated: "#2f1a1a",

      text: "#fef2f2",
      textMuted: "#fee2e2",
      textDisabled: "#fca5a5",
      textInverse: "#1f0a0a",

      border: "#4f3a3a",
      borderLight: "#5f4a4a",
      borderDark: "#3f2a2a",

      buttonBg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      buttonHover: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
      buttonActive: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      buttonText: "#ffffff",

      navBg: "#2f1a1a",
      navBorder: "#4f3a3a",
      navHover: "#3f2a2a",

      panelBg: "#2f1a1a",
      panelBorder: "#4f3a3a",
      panelHeader: "#3f2a2a",

      inputBg: "#2f1a1a",
      inputBorder: "#4f3a3a",
      inputFocus: "#ef4444",
      inputText: "#fef2f2",
      inputPlaceholder: "#fca5a5",

      cardBg: "#2f1a1a",
      cardBorder: "#4f3a3a",
      cardHover: "#3f2a2a",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(31, 10, 10, 0.4)",
      shadowLight: "rgba(31, 10, 10, 0.2)",
    },
  },
  orange: {
    name: "Orange",
    colors: {
      primary: "#f97316",
      primaryHover: "#fb923c",
      primaryLight: "#fdba74",
      secondary: "#ea580c",
      secondaryHover: "#f97316",

      background: "#1f0f0a",
      backgroundLight: "#2f1f1a",
      backgroundHover: "#3f2f2a",
      backgroundActive: "#4f3f3a",
      backgroundElevated: "#2f1f1a",

      text: "#fff7ed",
      textMuted: "#ffedd5",
      textDisabled: "#fdba74",
      textInverse: "#1f0f0a",

      border: "#4f3f3a",
      borderLight: "#5f4f4a",
      borderDark: "#3f2f2a",

      buttonBg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      buttonHover: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
      buttonActive: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
      buttonText: "#ffffff",

      navBg: "#2f1f1a",
      navBorder: "#4f3f3a",
      navHover: "#3f2f2a",

      panelBg: "#2f1f1a",
      panelBorder: "#4f3f3a",
      panelHeader: "#3f2f2a",

      inputBg: "#2f1f1a",
      inputBorder: "#4f3f3a",
      inputFocus: "#f97316",
      inputText: "#fff7ed",
      inputPlaceholder: "#fdba74",

      cardBg: "#2f1f1a",
      cardBorder: "#4f3f3a",
      cardHover: "#3f2f2a",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(31, 15, 10, 0.4)",
      shadowLight: "rgba(31, 15, 10, 0.2)",
    },
  },
  pink: {
    name: "Pink",
    colors: {
      primary: "#ec4899",
      primaryHover: "#f472b6",
      primaryLight: "#f9a8d4",
      secondary: "#db2777",
      secondaryHover: "#ec4899",

      background: "#1f0a1a",
      backgroundLight: "#2f1a2a",
      backgroundHover: "#3f2a3a",
      backgroundActive: "#4f3a4a",
      backgroundElevated: "#2f1a2a",

      text: "#fdf2f8",
      textMuted: "#fce7f3",
      textDisabled: "#f9a8d4",
      textInverse: "#1f0a1a",

      border: "#4f3a4a",
      borderLight: "#5f4a5a",
      borderDark: "#3f2a3a",

      buttonBg: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      buttonHover: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
      buttonActive: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
      buttonText: "#ffffff",

      navBg: "#2f1a2a",
      navBorder: "#4f3a4a",
      navHover: "#3f2a3a",

      panelBg: "#2f1a2a",
      panelBorder: "#4f3a4a",
      panelHeader: "#3f2a3a",

      inputBg: "#2f1a2a",
      inputBorder: "#4f3a4a",
      inputFocus: "#ec4899",
      inputText: "#fdf2f8",
      inputPlaceholder: "#f9a8d4",

      cardBg: "#2f1a2a",
      cardBorder: "#4f3a4a",
      cardHover: "#3f2a3a",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(31, 10, 26, 0.4)",
      shadowLight: "rgba(31, 10, 26, 0.2)",
    },
  },
  cyan: {
    name: "Cyan",
    colors: {
      primary: "#06b6d4",
      primaryHover: "#22d3ee",
      primaryLight: "#67e8f9",
      secondary: "#0891b2",
      secondaryHover: "#06b6d4",

      background: "#0a1f1f",
      backgroundLight: "#1a2f2f",
      backgroundHover: "#2a3f3f",
      backgroundActive: "#3a4f4f",
      backgroundElevated: "#1a2f2f",

      text: "#ecfeff",
      textMuted: "#cffafe",
      textDisabled: "#67e8f9",
      textInverse: "#0a1f1f",

      border: "#3a4f4f",
      borderLight: "#4a5f5f",
      borderDark: "#2a3f3f",

      buttonBg: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
      buttonHover: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
      buttonActive: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
      buttonText: "#ffffff",

      navBg: "#1a2f2f",
      navBorder: "#3a4f4f",
      navHover: "#2a3f3f",

      panelBg: "#1a2f2f",
      panelBorder: "#3a4f4f",
      panelHeader: "#2a3f3f",

      inputBg: "#1a2f2f",
      inputBorder: "#3a4f4f",
      inputFocus: "#06b6d4",
      inputText: "#ecfeff",
      inputPlaceholder: "#67e8f9",

      cardBg: "#1a2f2f",
      cardBorder: "#3a4f4f",
      cardHover: "#2a3f3f",

      success: "#10b981",
      successBg: "#064e3b",
      warning: "#f59e0b",
      warningBg: "#78350f",
      error: "#ef4444",
      errorBg: "#7f1d1d",
      info: "#3b82f6",
      infoBg: "#1e3a8a",

      shadow: "rgba(10, 31, 31, 0.4)",
      shadowLight: "rgba(10, 31, 31, 0.2)",
    },
  },
  auto: {
    name: "Auto",
    colors: null, // Will use system preference
  },
};

/**
 * Get current theme based on theme name
 * @param {string} themeName - Theme name or null for auto
 * @param {object} state - State object with theme.current
 * @returns {object} Theme object
 */
export function getTheme(themeName = null, state = null) {
  let name = themeName;
  if (!name && state) {
    name = state.theme?.current || "dark";
  }
  if (!name) {
    name = "dark";
  }

  if (name === "auto") {
    // Check system preference
    if (typeof window !== "undefined" && window.matchMedia) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return THEMES[prefersDark ? "dark" : "light"];
    }
    return THEMES.dark; // Fallback to dark
  }

  return THEMES[name] || THEMES.dark;
}

/**
 * Create computed theme getter
 * @param {object} state - Reactive state object
 * @returns {ComputedRef} Computed theme
 */
export function createCurrentTheme(state) {
  return computed(() => {
    return getTheme(null, state);
  });
}

/**
 * Apply theme CSS variables to DOM elements
 * @param {string|null} themeName - Theme name or null to use current theme
 * @param {object} state - State object (optional, for auto theme resolution)
 */
export function applyTheme(themeName = null, state = null) {
  const theme = getTheme(themeName, state);

  if (!theme || !theme.colors) {
    // Fallback to dark theme
    const fallbackTheme = THEMES.dark;
    applyThemeVariables(fallbackTheme.colors);
    return;
  }

  applyThemeVariables(theme.colors);
}

/**
 * Apply theme CSS variables to all relevant DOM elements
 * @param {object} colors - Color object from theme
 */
function applyThemeVariables(colors) {
  // Helper function to apply variables to an element
  const applyToElement = (element) => {
    if (!element) return;

    // Primary colors
    element.style.setProperty("--st-vision-primary", colors.primary);
    element.style.setProperty("--st-vision-primary-hover", colors.primaryHover);
    element.style.setProperty("--st-vision-primary-light", colors.primaryLight);
    element.style.setProperty("--st-vision-secondary", colors.secondary);
    element.style.setProperty(
      "--st-vision-secondary-hover",
      colors.secondaryHover,
    );

    // Background colors
    element.style.setProperty("--st-vision-bg", colors.background);
    element.style.setProperty("--st-vision-bg-light", colors.backgroundLight);
    element.style.setProperty("--st-vision-bg-hover", colors.backgroundHover);
    element.style.setProperty("--st-vision-bg-active", colors.backgroundActive);
    element.style.setProperty(
      "--st-vision-bg-elevated",
      colors.backgroundElevated,
    );

    // Text colors
    element.style.setProperty("--st-vision-text", colors.text);
    element.style.setProperty("--st-vision-text-muted", colors.textMuted);
    element.style.setProperty("--st-vision-text-disabled", colors.textDisabled);
    element.style.setProperty("--st-vision-text-inverse", colors.textInverse);

    // Border colors
    element.style.setProperty("--st-vision-border", colors.border);
    element.style.setProperty("--st-vision-border-light", colors.borderLight);
    element.style.setProperty("--st-vision-border-dark", colors.borderDark);

    // Button colors
    element.style.setProperty("--st-vision-button-bg", colors.buttonBg);
    element.style.setProperty("--st-vision-button-hover", colors.buttonHover);
    element.style.setProperty("--st-vision-button-active", colors.buttonActive);
    element.style.setProperty("--st-vision-button-text", colors.buttonText);

    // Navigation colors
    element.style.setProperty("--st-vision-nav-bg", colors.navBg);
    element.style.setProperty("--st-vision-nav-border", colors.navBorder);
    element.style.setProperty("--st-vision-nav-hover", colors.navHover);

    // Panel colors
    element.style.setProperty("--st-vision-panel-bg", colors.panelBg);
    element.style.setProperty("--st-vision-panel-border", colors.panelBorder);
    element.style.setProperty("--st-vision-panel-header", colors.panelHeader);

    // Input colors
    element.style.setProperty("--st-vision-input-bg", colors.inputBg);
    element.style.setProperty("--st-vision-input-border", colors.inputBorder);
    element.style.setProperty("--st-vision-input-focus", colors.inputFocus);
    element.style.setProperty("--st-vision-input-text", colors.inputText);
    element.style.setProperty(
      "--st-vision-input-placeholder",
      colors.inputPlaceholder,
    );

    // Card colors
    element.style.setProperty("--st-vision-card-bg", colors.cardBg);
    element.style.setProperty("--st-vision-card-border", colors.cardBorder);
    element.style.setProperty("--st-vision-card-hover", colors.cardHover);

    // Status colors
    element.style.setProperty("--st-vision-success", colors.success);
    element.style.setProperty("--st-vision-success-bg", colors.successBg);
    element.style.setProperty("--st-vision-warning", colors.warning);
    element.style.setProperty("--st-vision-warning-bg", colors.warningBg);
    element.style.setProperty("--st-vision-error", colors.error);
    element.style.setProperty("--st-vision-error-bg", colors.errorBg);
    element.style.setProperty("--st-vision-info", colors.info);
    element.style.setProperty("--st-vision-info-bg", colors.infoBg);

    // Shadow
    element.style.setProperty("--st-vision-shadow", colors.shadow);
    element.style.setProperty("--st-vision-shadow-light", colors.shadowLight);

    // Legacy variables for backward compatibility
    element.style.setProperty("--bg-primary", colors.background);
    element.style.setProperty("--bg-secondary", colors.backgroundLight);
    element.style.setProperty("--border-color", colors.border);
    element.style.setProperty("--text-primary", colors.text);
  };

  // Helper function to check if element is within plugin container
  const isWithinPlugin = (element, container) => {
    if (!container || !element) return false;
    return container.contains(element) || container === element;
  };

  // Find plugin container - this is the root scope for all theme variables
  let container = document.getElementById("st-vision-app");
  if (!container) {
    container = document.querySelector(".st-vision-app");
  }

  if (!container) {
    // If no container found, don't apply theme to avoid affecting external elements
    return;
  }

  // Apply to plugin container (this makes CSS variables available to all children)
  applyToElement(container);

  // Apply to Teleport elements (modals, dialogs) that belong to this plugin
  // Teleport elements are typically direct children of body, outside the plugin container
  // All selectors use plugin-specific prefixes (st-vision-*, st_vision_*, vision_*),
  // so elements matching these selectors are guaranteed to be part of this plugin
  const teleportSelectors = [
    ".st_vision_modal",
    ".vision_popup_overlay",
    ".st-vision-image-history-modal",
    ".st-vision-settings-panel",
    ".st-vision-confirm-dialog",
    ".st-vision-input-dialog",
  ];

  teleportSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      // All selectors are plugin-specific, so safe to apply theme
      applyToElement(el);
    });
  });

  // Apply to all existing inline containers in messages (only within plugin)
  const inlineContainers = container.querySelectorAll(
    ".st-vision-inline-container",
  );
  inlineContainers.forEach((el) => {
    applyToElement(el);
  });

  // Apply to all panels and cards (only within plugin)
  const panels = container.querySelectorAll(
    ".st-vision-panel, .st-vision-card, .st-vision-modal-content",
  );
  panels.forEach((el) => {
    applyToElement(el);
  });
}
