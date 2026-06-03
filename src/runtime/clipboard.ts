import type { App } from "vue";

export function installClipboardHelper(app: App) {
  app.config.globalProperties.$copy = async (text: string) => {
    if (!navigator?.clipboard) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Failed to copy to clipboard", err);
      return false;
    }
  };
}
