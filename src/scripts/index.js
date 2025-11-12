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

// Register service worker - HANYA di production (GitHub Pages)
const registerServiceWorker = async () => {
  // Cek apakah di production (GitHub Pages)
  const isProduction = window.location.hostname.includes('github.io');
  
  if ("serviceWorker" in navigator && isProduction) {
    try {
      const registration = await navigator.serviceWorker.register('/storyapp/sw.bundle.js', {
        scope: '/storyapp/',
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