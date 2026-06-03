import type { App, Component, Plugin } from "vue";

const COMPONENT_NAMES = [
  "UButton",
  "UInput",
  "UFormField",
  "UPageCard",
  "UCard",
  "UHeader",
  "UMain",
  "UFooter",
  "UApp",
];

export async function registerNuxtUIIfAvailable(app: App) {
  try {
    if (import.meta.env.PROD) {
      return;
    }

    const nuxtUI: Record<string, unknown> & { default?: unknown } =
      await import(/* @vite-ignore */ "@nuxt/ui");
    const candidate = nuxtUI.default ?? nuxtUI;

    if (typeof candidate === "function") {
      app.use(candidate as Plugin);
      return;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      "install" in candidate &&
      typeof candidate.install === "function"
    ) {
      app.use(candidate as { install: (app: App) => void });
      return;
    }

    for (const name of COMPONENT_NAMES) {
      const comp =
        nuxtUI[name] ??
        ((nuxtUI.default as Record<string, unknown> | undefined)?.[name] ||
          undefined);
      if (comp) {
        app.component(name, comp as Component);
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug("[main] @nuxt/ui not loaded; continuing without it.", error);
    }
  }
}
