/**
 * tests/unit/import-components.spec.ts
 *
 * Component import inspection tests
 *
 * Purpose:
 * - Ensure important SFCs (pages and root App) can be imported without throwing
 *   in the test environment (Vitest + Vite transform).
 * - Report diagnostic information (export keys, default export typeof) to help
 *   debug runtime transform/mocking issues.
 *
 * Notes:
 * - We try several module id formats (alias, absolute, file://, /@fs) because
 *   the transform/resolver may emit different module ids depending on context.
 * - The test intentionally does not mount the components; it focuses on import
 *   safety (mounting may exercise other runtime behavior such as style
 *   injection which is validated separately).
 */

import { describe, it, expect } from "vitest";

const ROOT = "/home/lightjunction/GITHUB/Kam/KamWEBUI";

const CANDIDATES = [
  // alias-based imports (preferred)
  "@/pages/Home.vue",
  "@/pages/Command.vue",
  "@/App.vue",

  // absolute project-file imports (Vite sometimes resolves to these)
  `${ROOT}/src/pages/Home.vue`,
  `${ROOT}/src/pages/Command.vue`,

  // file:// URL variants
  `file://${ROOT}/src/pages/Home.vue`,
  `file://${ROOT}/src/pages/Command.vue`,

  // Vite '/@fs' resolution prefix variant
  `/@fs${ROOT}/src/pages/Home.vue`,
  `/@fs${ROOT}/src/pages/Command.vue`,
];

/**
 * Try to dynamically import a module path and return a diagnostic result.
 */
async function tryImport(path: string) {
  try {
    // @ts-ignore - dynamic Vite-style query/alias imports are resolved at runtime
    const mod = await import(path);
    return { path, ok: true, mod };
  } catch (err: any) {
    // Capture both message and stack (if available) to aid diagnostics
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && err.stack ? err.stack : undefined;
    return { path, ok: false, error: message, stack };
  }
}

describe("component import inspection", () => {
  it("should import key components without throwing and expose a sensible default", async () => {
    const failures: any[] = [];

    for (const p of CANDIDATES) {
      const res = await tryImport(p);

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.warn(
          `[import-components] import failed: ${p} -> ${res.error}${(res as any).stack ? "\n" + (res as any).stack : ""}`,
        );
        failures.push({ path: p, error: res.error, stack: (res as any).stack });
        continue;
      }

      const m = res.mod;
      const keys = Object.keys(m || {});
      // SFCs typically place the component on the default export; some transforms
      // may also return the component at the module root (rare). Prefer default.
      const def = (m && (m as any).default) ?? m;
      const defType = typeof def;

      // Diagnostic log for easier debugging in CI output.
      // eslint-disable-next-line no-console
      console.log(
        `[import-components] "${p}" -> default typeof: ${defType}; keys: ${keys.join(", ")}`,
      );

      if (!def || (defType !== "object" && defType !== "function")) {
        failures.push({
          path: p,
          reason: `unexpected default export type (${defType})`,
          keys,
        });
      }
    }

    if (failures.length) {
      // eslint-disable-next-line no-console
      console.error("[import-components] failures:", failures);
      throw new Error(
        `Component import failures detected: ${JSON.stringify(failures, null, 2)}`,
      );
    }

    expect(true).toBe(true);
  });
});
