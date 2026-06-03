import { createI18n } from "vue-i18n";
import { messages } from "./messages";

export type SupportedLocale = "en" | "zh";

export function detectInitialLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem("locale");
    if (saved === "en" || saved === "zh") {
      return saved;
    }
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch {
    return "en";
  }
}

export function createKamI18n() {
  return createI18n({
    legacy: false,
    locale: detectInitialLocale(),
    fallbackLocale: "en",
    messages,
  });
}
