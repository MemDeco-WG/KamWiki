import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/main.css";
import { createI18n } from "vue-i18n";

/**
 * Main entry for the Kam Wiki app.
 *
 * - Mounts the Vue app
 * - Registers `vue-router`
 * - Attempts to dynamically register `@nuxt/ui` if present, and falls back to local UI
 * - Adds a small global helper for copying to clipboard
 * - Registers the service worker to enable caching and improve availability (if available)
 *
 * Notes:
 * - `@nuxt/ui` is designed for Nuxt, but this file attempts to integrate it
 *   into a plain Vue 3 + Vite context gracefully through dynamic import.
 */

// Create the Vue app
const app = createApp(App);

//
// Error overlay helpers:
// - createErrorOverlay() builds a floating element to display errors
// - showErrorOverlay() writes text to the overlay and shows it
// - Global event listeners capture window error/unhandledrejection and surface them
// - Vue's app.config.errorHandler surfaces Vue runtime errors as well
//
function createErrorOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "error-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(0, 0, 0, 0.6)";
  overlay.style.zIndex = "999999";
  overlay.style.fontFamily =
    'system-ui, -apple-system, Roboto, "Helvetica Neue", Arial';

  const panel = document.createElement("div");
  panel.style.maxHeight = "90vh";
  panel.style.overflow = "auto";
  panel.style.maxWidth = "90vw";
  panel.style.background = "#0b1220";
  panel.style.color = "#fff";
  panel.style.padding = "16px";
  panel.style.borderRadius = "10px";
  panel.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
  panel.style.border = "1px solid rgba(255,255,255,0.05)";
  overlay.appendChild(panel);

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.gap = "12px";

  const title = document.createElement("div");
  title.textContent = "An error occurred";
  title.style.fontWeight = "700";
  title.style.fontSize = "1.05rem";
  header.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.padding = "6px 10px";
  closeBtn.style.borderRadius = "8px";
  closeBtn.style.border = "none";
  closeBtn.style.background = "#333";
  closeBtn.style.color = "#fff";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontWeight = "700";
  closeBtn.addEventListener("click", () => overlay.remove());
  header.appendChild(closeBtn);

  panel.appendChild(header);

  const pre = document.createElement("pre");
  pre.id = "error-overlay-pre";
  pre.style.whiteSpace = "pre-wrap";
  pre.style.whiteSpace = "break-spaces";
  pre.style.marginTop = "12px";
  pre.style.fontSize = "0.9rem";
  pre.style.lineHeight = "1.35";
  panel.appendChild(pre);

  return overlay;
}

function showErrorOverlay(
  message: string | undefined,
  stack?: string | undefined,
): void {
  try {
    let overlay = document.getElementById("error-overlay");
    if (!overlay) {
      overlay = createErrorOverlay();
      document.body.appendChild(overlay);
    }
    const pre = overlay.querySelector("#error-overlay-pre");
    if (pre) pre.textContent = `${message || "Error"}\n\n${stack || ""}`;
    overlay.scrollIntoView({ block: "center" });
  } catch (err) {
    // If overlay creation fails, still log to console to help debugging
    // eslint-disable-next-line no-console
    console.error("Failed to show error overlay", err);
  }
}

// global error events
window.addEventListener("error", (event: ErrorEvent) => {
  try {
    const msg =
      event?.message ||
      ((event as any)?.error && (event as any).error.message) ||
      String(event);
    const stack =
      ((event as any)?.error && (event as any).error.stack) ||
      (event as any).filename ||
      "";
    showErrorOverlay(msg, stack);
  } catch (err) {
    // fall back to console logging
    // eslint-disable-next-line no-console
    console.error("error event handler failed", err);
  }
});

window.addEventListener(
  "unhandledrejection",
  (event: PromiseRejectionEvent) => {
    try {
      const reason: any = (event as any)?.reason;
      const msg: string = (reason && (reason as any).message) || String(reason);
      const stack: string = (reason && (reason as any).stack) || "";
      showErrorOverlay(msg, stack);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("unhandledrejection handler failed", err);
    }
  },
);

// Show Vue runtime errors through overlay
app.config.errorHandler = (err: unknown, vm: any, info: string) => {
  try {
    const anyErr: any = err;
    const stack = (anyErr && anyErr.stack) || info || "";
    showErrorOverlay((anyErr && anyErr.message) || "Vue runtime error", stack);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Vue error handler failed", e);
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error("[Vue Error]", err, info);
  }
};

// A small global helper to copy text to clipboard (used by command copy buttons)
app.config.globalProperties.$copy = async (text: string) => {
  if (!navigator?.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to copy to clipboard", err);
    return false;
  }
};

const messages = {
  en: {
    app: {
      brand: "Kam",
      brandSuffix: "Wiki",
      subtitle: "Offline-first CLI toolkit",
      home: "Home",
      homeDescription:
        "Browse documentation for Kam commands, including usage and examples.",
      commands: "Commands",
      usage: "Usage",
      examples: "Examples",
      copy: "Copy",
      copied: "Copied",
      clear: "Clear",
      searchPlaceholder: "Search commands — e.g. build, init",
      filterPlaceholder: "Filter commands...",
      searchAndExplore: "Search and explore commands",
      headerLabel: "Kam documentation header",
      commandsNavigation: "Commands navigation",
      open: "Open",
      expand: "Expand",
      collapse: "Collapse",
      back: "Back",
      globalOptions: "Global Options",
      flag: "Flag",
      flags: "Options",
      description: "Description",
      language: "Language",
      switchToLight: "Switch to light theme",
      switchToDark: "Switch to dark theme",
      noResults: "No results",
      noResultsMatch: "No commands match your search.",
      commandNotFound: "Command not found",
      commandNotFoundWithName: "Command {name} not found.",
      commandNotFoundDetail:
        "Check the command list or search using the sidebar.",
      commandList: "command list",
      offline: "Offline",
      offlineDesc:
        "Content is cached for offline use and sourced from the project manifest.",
      footer:
        "Kam — offline-first CLI toolkit documentation. Content is local and sourced from the project manifest.",
    },
    globalFlags: {
      help: "Print help (see a summary with -h)",
      version: "Print version",
    },
    // Additional command-specific translations (used when the app reads them)
    commands: {
      init: {
        name: "init",
        summary:
          "Initialize a new Kam project from templates (supports meta and kernel templates)",
        usage: "kam init [-i|--interactive] [TEMPLATE] [OPTIONS]",
        description:
          "Create a new Kam module or project from predefined templates. Templates may include meta templates and kernel templates that bootstrap a module with opinionated configuration and layout.",
        examples: ["kam init kernel/basic", "kam init meta/sample-template"],
        flags: [
          { flag: "-i, --interactive", description: "Run in interactive mode" },
        ],
        flagDescriptions: {
          interactive: "Run the init interactively; ask for required values",
        },
      },
      build: {
        name: "build",
        summary: "Build and package a module into a deployable ZIP artifact",
        usage: "kam build [OPTIONS]",
        description:
          "Compiles and packages a module into a ZIP artifact suitable for distribution and deployment. The exact build process depends on the module configuration and included build scripts.",
      },
      version: {
        name: "version",
        summary: "Manage module versions and bump policies",
        usage: "kam version [bump|list|set|get] [OPTIONS]",
        description:
          "Tools for managing semantic versions and bumping policies for the module. Useful commands often include bumping a version, listing the history, or configuring automatic bump rules.",
      },
      cache: {
        name: "cache",
        summary: "Manage local template and artifact cache",
        usage: "kam cache [clear|list|info] [OPTIONS]",
        description:
          "Controls the local cache used by Kam for templates and artifacts. You can clean up disk usage, examine cached items, or refresh cached templates/artifacts.",
      },
      tmpl: {
        name: "tmpl",
        summary: "Manage templates: import, export, package, and list",
        usage: "kam tmpl [import|export|package|list] [OPTIONS]",
        description:
          "Template management utilities. This includes importing templates into your local cache, exporting or packaging templates as distributable artifacts, or listing available templates.",
      },
      validate: {
        name: "validate",
        summary: "Validate `kam.toml` configuration and templates",
        usage: "kam validate [FILES] [OPTIONS]",
        description:
          "Checks your project configuration (kam.toml) and templates for syntax, required fields, and other consistency validations.",
      },
      completions: {
        name: "completions",
        summary: "Generate shell completion scripts for common shells",
        usage: "kam completions [bash|zsh|fish|powershell]",
        description:
          "Generate shell completion scripts that help with tab-completion for `kam` commands on supported shells.",
      },
      secret: {
        name: "secret",
        summary: "Secret keyring management (used by sign/verify tasks)",
        usage: "kam secret [add|list|remove|info] [OPTIONS]",
        description:
          "Manage secrets (keys) stored locally for signing and cryptographic operations. These keys are used by the `sign` and `verify` commands in signing and verification workflows.",
      },
      sign: {
        name: "sign",
        summary: "Sign an artifact using a key from the keyring or a PEM file",
        usage: "kam sign [ARTIFACT] [OPTIONS]",
        description:
          "Creates a cryptographic signature for an artifact (e.g., the packaged ZIP) using a key from your secret keyring or a provided PEM/Key file.",
      },
      verify: {
        name: "verify",
        summary:
          "Verify an artifact signature (.sig) or a sigstore bundle (DSSE)",
        usage: "kam verify [ARTIFACT] [SIGNATURE] [OPTIONS]",
        description:
          "Verify that an artifact’s signature is valid and matches a trusted identity or key. It supports .sig signatures and sigstore DSSE bundles.",
      },
      check: {
        name: "check",
        summary: "Check project JSON/YAML/Markdown files (lint/format/parse)",
        usage: "kam check [FILES] [OPTIONS]",
        description:
          "Static checking utilities for files in the project, including linting, formatting, and parsing validations. Helps catch errors early in CI or local development.",
      },
      export: {
        name: "export",
        summary:
          "Export `kam.toml` to `module.prop`, `module.json`, `repo.json`, `track.json`, `config.json`, `update.json`",
        usage: "kam export [OUTPUT-TARGET] [OPTIONS]",
        description:
          "Export module metadata defined in kam.toml to one of the supported artifact formats. Useful when producing artifacts for different distribution systems or tooling.",
      },
      toml: {
        name: "toml",
        summary:
          "Inspect and edit `kam.toml` using dot-path keys (get/set/unset/list)",
        usage: "kam toml [get|set|unset|list] <dot-path> [VALUE]",
        description:
          "Utility to inspect and edit the kam.toml configuration file programmatically. Accepts dot-path keys to read or modify nested values.",
      },
      config: {
        name: "config",
        summary:
          "Manage per-project or global kam configuration (similar to git config)",
        usage: "kam config [get|set|unset] [--global|--local] <key> [value]",
        description:
          "Manage configuration values for Kam either per-project (local) or globally. Works similar to `git config` in semantics.",
      },
      help: {
        name: "help",
        summary: "Print this message or the help of the given subcommand(s)",
        usage: "kam help [COMMAND]",
        description:
          "Show help text for the general `kam` tool or for a specific subcommand. This is the canonical way to learn more about usage when working with the CLI.",
      },
    },
  },
  zh: {
    app: {
      brand: "Kam",
      brandSuffix: "文档",
      subtitle: "离线优先的 CLI 工具",
      home: "主页",
      homeDescription: "浏览 Kam CLI 文档，包括用法与示例。",
      commands: "命令",
      usage: "用法",
      examples: "示例",
      copy: "复制",
      copied: "已复制",
      clear: "清除",
      searchPlaceholder: "搜索命令 — 例如 build, init",
      filterPlaceholder: "筛选命令...",
      searchAndExplore: "使用上方搜索查找并浏览命令",
      headerLabel: "Kam 文档头",
      commandsNavigation: "命令导航",
      open: "打开",
      expand: "展开",
      collapse: "收起",
      back: "返回",
      globalOptions: "全局选项",
      flag: "选项",
      flags: "选项",
      description: "描述",
      language: "语言",
      switchToLight: "切换到浅色主题",
      switchToDark: "切换到深色主题",
      noResults: "没有结果",
      noResultsMatch: "没有命令匹配您的搜索。",
      commandNotFound: "未找到命令",
      commandNotFoundWithName: "未找到命令：{name}。",
      commandNotFoundDetail: "检查命令列表或使用侧边栏搜索。",
      commandList: "命令列表",
      offline: "离线",
      offlineDesc: "内容已缓存并可在本地访问",
      footer: "Kam — 离线优先的 CLI 工具文档。内容来自项目清单的本地副本。",
    },
    globalFlags: {
      help: "打印帮助信息（使用 -h 查看摘要）",
      version: "打印版本号",
    },
    // Command translations
    commands: {
      init: {
        name: "init",
        summary: "从模板初始化新的 Kam 项目（支持 meta 和 kernel 模板）",
        usage: "kam init [-i|--interactive] [TEMPLATE] [OPTIONS]",
        description:
          "从预定义模板创建新的 Kam 模块或项目。模板可能包含用于引导模块的元模板和内核模板，带有约定的配置和目录结构。",
        examples: ["kam init kernel/basic", "kam init meta/sample-template"],
        flags: [
          {
            flag: "-i, --interactive",
            description: "交互式运行，提示必要选项",
          },
        ],
        flagDescriptions: {
          interactive: "交互式运行，提示必要选项",
        },
      },
      build: {
        name: "build",
        summary: "将模块构建并打包为可部署的 ZIP 工件",
        usage: "kam build [OPTIONS]",
        description:
          "将模块编译并打包为适用于分发和部署的 ZIP 工件。具体构建过程取决于模块配置和包含的构建脚本。",
      },
      version: {
        name: "version",
        summary: "管理模块版本和版本提升策略",
        usage: "kam version [bump|list|set|get] [OPTIONS]",
        description:
          "用于管理语义化版本和提升策略的工具。常见操作包括提升版本、列出历史或配置自动提升规则。",
      },
      cache: {
        name: "cache",
        summary: "管理本地模板和工件缓存",
        usage: "kam cache [clear|list|info] [OPTIONS]",
        description:
          "控制 Kam 用于模板和工件的本地缓存。可以清理磁盘使用、检查缓存项或刷新缓存的模板/工件。",
      },
      tmpl: {
        name: "tmpl",
        summary: "管理模板：导入、导出、打包和列出",
        usage: "kam tmpl [import|export|package|list] [OPTIONS]",
        description:
          "模板管理工具，包括将模板导入本地缓存、导出/打包为可分发工件或列出可用模板。",
      },
      validate: {
        name: "validate",
        summary: "验证 `kam.toml` 配置和模板",
        usage: "kam validate [FILES] [OPTIONS]",
        description:
          "检查项目配置（kam.toml）和模板的语法、必需字段以及其他一致性验证。",
      },
      completions: {
        name: "completions",
        summary: "为常见 shell 生成补全脚本",
        usage: "kam completions [bash|zsh|fish|powershell]",
        description: "生成用于 `kam` 命令的 tab 补全脚本，支持常见的 shell。",
      },
      secret: {
        name: "secret",
        summary: "机密钥匙环管理（用于签名/验证任务）",
        usage: "kam secret [add|list|remove|info] [OPTIONS]",
        description:
          "管理本地存储的机密（密钥），用于签名和加密相关操作。此密钥用于签名与验证流程中的 `sign` 与 `verify` 命令。",
      },
      sign: {
        name: "sign",
        summary: "使用钥匙环中的密钥或 PEM 文件对工件进行签名",
        usage: "kam sign [ARTIFACT] [OPTIONS]",
        description:
          "为工件（例如打包的 ZIP）创建加密签名，使用来自密钥环的密钥或提供的 PEM/Key 文件。",
      },
      verify: {
        name: "verify",
        summary: "验证工件签名（.sig）或 sigstore bundle（DSSE）",
        usage: "kam verify [ARTIFACT] [SIGNATURE] [OPTIONS]",
        description:
          "验证工件签名是否有效并匹配受信任的身份或密钥。支持 .sig 签名和 sigstore DSSE bundle。",
      },
      check: {
        name: "check",
        summary: "检查项目 JSON/YAML/Markdown 文件（lint/格式/解析）",
        usage: "kam check [FILES] [OPTIONS]",
        description:
          "对项目中的文件进行静态检查，包括 lint、格式化和解析验证。在 CI 或本地开发中有助于及早发现错误。",
      },
      export: {
        name: "export",
        summary:
          "将 `kam.toml` 导出为 `module.prop`、`module.json`、`repo.json`、`track.json`、`config.json`、`update.json`",
        usage: "kam export [OUTPUT-TARGET] [OPTIONS]",
        description:
          "将 kam.toml 中定义的模块元数据导出为受支持的工件格式之一。这有助于为不同的分发系统或工具链生成工件。",
      },
      toml: {
        name: "toml",
        summary: "使用点路径键检查和编辑 `kam.toml`（get/set/unset/list）",
        usage: "kam toml [get|set|unset|list] <dot-path> [VALUE]",
        description:
          "程序化地检查和编辑 kam.toml 配置文件的工具。接受点路径键以读取或修改嵌套的值。",
      },
      config: {
        name: "config",
        summary: "管理每个项目或全局的 kam 配置（类似 git config）",
        usage: "kam config [get|set|unset] [--global|--local] <key> [value]",
        description:
          "管理 Kam 的配置值，可在项目范围（本地）或全局范围设置，语义类似 `git config`。",
      },
      help: {
        name: "help",
        summary: "打印此消息或给定子命令的帮助",
        usage: "kam help [COMMAND]",
        description:
          "显示一般 `kam` 工具或特定子命令的帮助文本。是学习 CLI 用法的主要方式。",
      },
    },
  },
};

// Try to load saved locale from localStorage
let initialLocale = "en";
try {
  const saved = localStorage.getItem("locale");
  if (saved === "en" || saved === "zh") {
    initialLocale = saved;
  } else {
    // Try to detect from browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh")) {
      initialLocale = "zh";
    }
  }
} catch (e) {
  // ignore localStorage errors
}

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: "en",
  messages,
});

app.use(i18n);
// expose a helper to switch locale from browser console if desired:
(app.config.globalProperties as any).$setLocale = (value: "en" | "zh") => {
  // We restrict locales to the supported keys so the runtime type is valid.
  // Cast to any to satisfy the assignment while keeping a narrow accepted type.
  (i18n.global.locale as any).value = value;
};

async function registerNuxtUIIfAvailable() {
  try {
    // Try to dynamically import `@nuxt/ui`. Many Nuxt modules expect a Nuxt runtime,
    // but the package may still export usable components or a plugin function that
    // can be used in a plain Vue 3 app.
    const nuxtUI: any = await import("@nuxt/ui");

    const candidate = nuxtUI.default ?? nuxtUI;

    // If the export is a plugin (function with install), register it directly
    if (typeof candidate === "function") {
      app.use(candidate);
      // eslint-disable-next-line no-console
      console.debug("[main] Registered @nuxt/ui plugin.");
      return;
    }

    // If it's an object plugin style with `install`, use it
    if (candidate && typeof candidate.install === "function") {
      app.use(candidate);
      // eslint-disable-next-line no-console
      console.debug("[main] Registered @nuxt/ui object plugin.");
      return;
    }

    // Otherwise, attempt to register some common component names as a convenience
    const componentNames = [
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

    componentNames.forEach((name) => {
      const comp = nuxtUI[name] ?? nuxtUI.default?.[name];
      if (comp) {
        app.component(name, comp);
      }
    });

    // eslint-disable-next-line no-console
    console.debug("[main] Nuxt UI components registered (partial).");
  } catch (error) {
    // Fail gracefully: the app can still run without `@nuxt/ui`. Log only in dev.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug(
        "[main] @nuxt/ui not loaded; continuing without it.",
        error,
      );
    }
  }
}

async function bootstrap() {
  // Try install Nuxt UI first (if available) to allow components to register before the app mounts.
  await registerNuxtUIIfAvailable();

  // Register router
  app.use(router);

  // Mount the app
  app.mount("#app");

  // Register the service worker to enable caching and improve availability (only if supported)
  // For local development you may want to keep this disabled; we check `import.meta.env.PROD`.
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      // eslint-disable-next-line no-console
      console.debug("[main] Service Worker registered at scope:", reg.scope);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[main] Service Worker registration failed:", err);
    }
  }
}

// Start the app
bootstrap();
