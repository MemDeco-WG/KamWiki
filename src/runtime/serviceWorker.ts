export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) {
    return;
  }

  try {
    const base = import.meta.env.BASE_URL || "/";
    const swUrl = new URL("sw.js", location.origin + base);
    const reg = await navigator.serviceWorker.register(swUrl.href);
    console.debug("[main] Service Worker registered at scope:", reg.scope);
  } catch (err) {
    console.warn("[main] Service Worker registration failed:", err);
  }
}
