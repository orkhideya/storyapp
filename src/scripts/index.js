// CSS imports
import "../styles/styles.css";
import App from "./pages/app";
import Navbar from "./components/navbar";
import SkipToContentInitiator from "./utils/skip-to-content-initiator";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Skip to Content feature
  SkipToContentInitiator.init({
    skipLinkId: "skip-to-content",
    mainContentId: "main-content",
  });

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  // Initialize navigation
  Navbar.init();
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});

// Register service worker - otomatis detect dev/prod
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // Deteksi environment berdasarkan hostname
      const isGitHubPages = window.location.hostname.includes('github.io');
      const basePath = isGitHubPages ? '/storyapp' : '';
      
      const registration = await navigator.serviceWorker.register(`${basePath}/sw.bundle.js`, {
        scope: isGitHubPages ? '/storyapp/' : '/',
      });
      console.log("Service Worker registered with scope:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};

// Call this when your app initializes
registerServiceWorker();