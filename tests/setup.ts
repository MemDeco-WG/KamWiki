/**
 * 测试设置文件
 * 配置测试环境和全局设置
 */

import { vi, beforeEach } from "vitest";
import { config } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

// ============================================================================
// 全局测试配置
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// Vue Test Utils 全局配置
// ============================================================================

config.global.stubs = {
  "router-link": true,
  "router-view": true,
};

// Register a minimal Vue I18n instance so components using `useI18n()` work during tests.
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  messages: {
    en: {
      app: {
        brand: "Kam",
        brandSuffix: "Wiki",
        subtitle: "Commands",
        home: "Home",
        homeDescription: "",
        commands: "Commands",
        usage: "Usage",
        examples: "Examples",
        copy: "Copy",
        copied: "Copied",
        clear: "Clear",
        searchPlaceholder: "Search",
        filterPlaceholder: "Filter",
        searchAndExplore: "Search and explore",
        headerLabel: "Header",
        commandsNavigation: "Commands",
        open: "Open",
        expand: "Expand",
        collapse: "Collapse",
        back: "Back",
        globalOptions: "Global options",
        flag: "Flag",
        flags: "Flags",
        description: "Description",
        language: "Language",
        switchToLight: "Switch to light",
        switchToDark: "Switch to dark",
        noResults: "No results",
        noResultsMatch: "No results match",
        commandNotFound: "Command not found",
        commandNotFoundWithName: "Command not found: {name}",
        commandNotFoundDetail: "No details available",
        commandList: "Command list",
        offline: "Offline",
        offlineDesc: "Offline description",
        footer: "Footer",
      },
      globalFlags: {
        help: "Help",
        version: "Version",
      },
      commands: {},
    },
  },
});

config.global.plugins = [...(config.global.plugins || []), i18n];

const VueErrorHandlerPlugin = {
  install(app: any) {
    // Vue runtime error handler: surface Vue errors during tests and fail loudly.
    app.config.errorHandler = (err: any, vm?: any, info?: string) => {
      // eslint-disable-next-line no-console
      console.error("[test][vue error]", err, info);
      // Re-throw so the test runner fails and you get a visible stack trace.
      throw err instanceof Error ? err : new Error(String(err));
    };
  },
};

config.global.plugins.push(VueErrorHandlerPlugin);
config.global.plugins.push(i18n);

// ============================================================================
// 浏览器 API Mock
// ============================================================================

/**
 * Mock window.matchMedia
 * 用于响应式设计和媒体查询测试
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock IntersectionObserver
 * 用于元素可见性和滚动测试
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Surface async errors so tests fail loudly.
// - window-level handlers capture unhandledrejection and runtime errors in JSDOM
// - process-level handlers capture Node async errors (useful for CI)
window.addEventListener("unhandledrejection", (event: any) => {
  // eslint-disable-next-line no-console
  console.error("[test] unhandledrejection:", event.reason);
  // Re-throw so the test runner surfaces the error
  throw event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));
});

window.addEventListener("error", (event: any) => {
  // eslint-disable-next-line no-console
  console.error("[test] window error:", event.error || event.message);
  throw event.error || new Error(String(event.message || "Unknown error"));
});

// Node-level handlers (in case tests trigger Node async errors)
process.on("unhandledRejection", (reason: any) => {
  // eslint-disable-next-line no-console
  console.error("[test] process unhandledRejection:", reason);
  throw reason instanceof Error ? reason : new Error(String(reason));
});

process.on("uncaughtException", (err: any) => {
  // eslint-disable-next-line no-console
  console.error("[test] process uncaughtException:", err);
  throw err;
});
