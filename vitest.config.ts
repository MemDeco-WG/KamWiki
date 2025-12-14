/**
 * Vitest 配置文件
 * 用于 Vue 3 + TypeScript 项目的测试配置
 */

import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "*.config.*", "dist/", "coverage/"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "~": resolve(__dirname, "./src"),
      "~~": resolve(__dirname),
      "@@": resolve(__dirname),
    },
  },
  optimizeDeps: {
    include: ["@vueuse/core", "vue"],
  },
  define: {
    __vite_ssr_exportName__: "(name, fn) => fn",
  },
});
