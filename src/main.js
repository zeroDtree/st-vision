import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles.css";

// Mount to #st-vision-app in SillyTavern, or #app in development
const mountPoint =
  document.getElementById("st-vision-app") || document.getElementById("app");
if (mountPoint) {
  createApp(App).mount(mountPoint);
} else {
  console.error("[ST Vision] Mount point not found");
}
