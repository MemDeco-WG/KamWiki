import { ref } from "vue";

export function useClipboardFeedback(timeoutMs = 1500) {
  const copiedKey = ref<string | null>(null);
  const isCopying = ref(false);

  async function copyText(text: string, key = "default") {
    if (!text) return false;
    isCopying.value = true;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      copiedKey.value = key;
      window.setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = null;
      }, timeoutMs);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      return false;
    } finally {
      isCopying.value = false;
    }
  }

  return {
    copiedKey,
    isCopying,
    copyText,
  };
}
