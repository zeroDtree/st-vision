/**
 * ST Vision - SillyTavern Extension Entry Point
 * This file is loaded by SillyTavern when the extension is enabled
 */

(function () {
  "use strict";

  // Extension initialization
  const extensionName = "st-vision";
  const extensionPath = `/scripts/extensions/third-party/${extensionName}`;
  const build_dir_name = "output";
  const build_file_name = "st/index.js";
  const build_css_file_name = "st/index.css";

  console.log("[ST Vision] Initializing extension...");

  // Create mount point for Vue app if it doesn't exist
  function createMountPoint() {
    let appContainer = document.getElementById("st-vision-app");
    if (!appContainer) {
      appContainer = document.createElement("div");
      appContainer.id = "st-vision-app";
      document.body.appendChild(appContainer);
    }
    return appContainer;
  }

  // Load Vue app from built files
  function loadVueApp() {
    createMountPoint();

    // Load the built CSS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${extensionPath}/${build_dir_name}/${build_css_file_name}`;
    document.head.appendChild(cssLink);

    // Load the built JS
    const script = document.createElement("script");
    script.type = "module";
    script.src = `${extensionPath}/${build_dir_name}/${build_file_name}`;
    script.onload = () => {
      console.log("[ST Vision] Vue app loaded successfully");
    };
    script.onerror = () => {
      console.error(
        '[ST Vision] Failed to load Vue app. Make sure to run "npm run build" first.',
      );
    };
    document.head.appendChild(script);
  }

  // Add menu item to extensions menu
  function addExtensionsMenuItem() {
    // Wait for extensionsMenu to be available
    const checkMenu = setInterval(() => {
      const menuContainer = document.getElementById('st_vision_wand_container');
      if (menuContainer) {
        clearInterval(checkMenu);
        
        const menuItemHtml = `
          <div id="st_vision_fab_toggle" class="list-group-item flex-container flexGap5">
            <div class="extensionsMenuExtensionButton fa-solid fa-wand-magic-sparkles"></div>
            <span>Toggle Floating Button</span>
          </div>
        `;
        
        menuContainer.innerHTML = menuItemHtml;
        
        // Add click handler
        document.getElementById('st_vision_fab_toggle').addEventListener('click', () => {
          // Access Vue state through window
          if (window.stVisionState) {
            window.stVisionState.showFloatingButton = !window.stVisionState.showFloatingButton;
            // Save state
            if (window.stVisionSaveState) {
              window.stVisionSaveState();
            }
          }
        });
        
        console.log("[ST Vision] Extensions menu item added");
      }
    }, 100);
    
    // Clear interval after 5 seconds to prevent infinite checking
    setTimeout(() => clearInterval(checkMenu), 5000);
  }

  // Initialize extension
  jQuery(async () => {
    console.log("[ST Vision] Extension loaded");
    loadVueApp();
    
    // Add extensions menu item after a short delay to ensure DOM is ready
    setTimeout(addExtensionsMenuItem, 500);
  });

  // Export extension API if needed
  window.stVisionExtension = {
    name: extensionName,
    version: "1.0.0",
  };
})();
