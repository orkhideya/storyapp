// CSS imports
import "../styles/styles.css";
import App from "./pages/app";
import Navbar from "./components/navbar";
import SkipToContentInitiator from "./utils/skip-to-content-initiator";

// Helper untuk mendapatkan base path
const getBasePath = () => {
  const isProduction = window.location.hostname.includes('github.io');
  return isProduction ? '/storyapp/' : '/';
};

// Update manifest link dengan base path yang benar
const updateManifestPath = () => {
  const basePath = getBasePath();
  const manifestLink = document.querySelector('link[rel="manifest"]');
  
  if (manifestLink) {
    manifestLink.href = `${basePath}app.webmanifest`;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  // Update manifest path
  updateManifestPath();
  
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

// Register service worker
const registerServiceWorker = async () => {
  const isProduction = window.location.hostname.includes('github.io');
  const basePath = getBasePath();
  
  if ("serviceWorker" in navigator && isProduction) {
    try {
      const registration = await navigator.serviceWorker.register(`${basePath}sw.bundle.js`, {
        scope: basePath,
      });
      console.log("Service Worker registered with scope:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  } else if (!isProduction) {
    console.log("Service Worker disabled in development mode");
  }
  return null;
};

// Call this when your app initializes
registerServiceWorker();