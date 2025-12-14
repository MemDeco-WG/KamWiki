/**
 * tests/unit/style-inspect.spec.ts
 *
 * Style inspection tests to help debug SFC style transform issues.
 *
 * Background:
 * Some test environments / transforms may turn Vue SFC <style> blocks into modules
 * whose default export is not a function (e.g. an object or string). The Vue SFC
 * runtime expects a callable style injector in many dev/test setups and calling a
 * non-function can produce errors such as:
 *
 *   TypeError: (0 , default) is not a function
 *
 * These tests attempt to import the style query modules produced by Vite for the
 * SFCs we ship and assert on their "callability" (or at least give a clear
 * diagnostic of what shape they have).
 */

import { describe, it, expect } from "vitest";

/**
 * Try to import a path and return the loaded module.
 * We use dynamic import with ts-ignore because Vite-style query imports (e.g.
 * '?vue&type=style') are resolved at runtime by the Vite transform.
 */
async function importModule(path: string): Promise<any> {
  try {
    // @ts-ignore - Vite query imports are resolved at runtime in test environment
    return await import(path);
  } catch (err) {
    throw new Error(
      `Failed to import module "${path}": ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Normalize and find a callable injector in a style module if present.
 */
function findCallable(mod: any): (() => void) | undefined {
  if (!mod) return undefined;
  // module itself might be a function
  if (typeof mod === "function") return mod;
  // ESM default export
  if (typeof mod.default === "function") return mod.default;
  // Some transforms export an __inject__ named helper
  if (typeof mod.__inject__ === "function") return mod.__inject__;
  if (typeof mod.inject === "function") return mod.inject;
  // If the module is an object containing a 'code' or 'source' string, it's not callable
  return undefined;
}

describe("SFC style inspection", () => {
  it("Home.vue style module should expose a callable injector (diagnostic)", async () => {
    const path = "@/pages/Home.vue?vue&type=style&index=0&lang.css";
    const mod = await importModule(path);
    const callable = findCallable(mod);

    if (!callable) {
      const keys = Object.keys(mod || {}).join(", ");
      const typeDefault = typeof (mod && mod.default);
      throw new Error(
        `Style module "${path}" does not expose a callable injector.\n` +
          ` - typeof default export: ${typeDefault}\n` +
          ` - module keys: [${keys}]\n` +
          ` - Inspector: import result: ${JSON.stringify(
            Object.fromEntries(Object.entries(mod || {}).slice(0, 10)),
          )}`,
      );
    }

    // Attempt to call it (some implementations run injection on call; we tolerate errors)
    try {
      callable();
    } catch (err) {
      // Don't fail if call throws — the important bit is the presence of a callable.
    }

    expect(typeof callable).toBe("function");
  });

  it("Command.vue style module should expose a callable injector (diagnostic)", async () => {
    const path = "@/pages/Command.vue?vue&type=style&index=0&lang.css";
    const mod = await importModule(path);
    const callable = findCallable(mod);

    if (!callable) {
      const keys = Object.keys(mod || {}).join(", ");
      const typeDefault = typeof (mod && mod.default);
      throw new Error(
        `Style module "${path}" does not expose a callable injector.\n` +
          ` - typeof default export: ${typeDefault}\n` +
          ` - module keys: [${keys}]\n` +
          ` - Inspector: import result: ${JSON.stringify(
            Object.fromEntries(Object.entries(mod || {}).slice(0, 10)),
          )}`,
      );
    }

    try {
      callable();
    } catch {
      // ignore runtime call errors
    }

    expect(typeof callable).toBe("function");
  });

  it("Report what importing global CSS produces (assets/main.css)", async () => {
    const path = "@/assets/main.css";
    try {
      const mod = await importModule(path);
      const defaultExport = mod?.default ?? mod;
      // Log diagnostic info to stdout for easier debugging in CI logs.
      // eslint-disable-next-line no-console
      console.log(
        `[style-inspect] "${path}" -> typeof default: ${typeof defaultExport}; keys: ${Object.keys(mod || {}).join(", ")}`,
      );
      // We don't assert a strict contract for global CSS, but ensure the import doesn't throw.
      expect(true).toBe(true);
    } catch (err) {
      throw new Error(
        `Importing "${path}" failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  });

  it("Inspect script blocks for pages (diagnostic)", async () => {
    const scriptPaths = [
      "@/pages/Home.vue?vue&type=script&setup=true&lang.ts",
      "@/pages/Command.vue?vue&type=script&setup=true&lang.ts",
    ];
    for (const p of scriptPaths) {
      try {
        // @ts-ignore - dynamic query imports resolved by Vite transform in test environment
        const m = await import(p);
        // eslint-disable-next-line no-console
        console.log(
          `[script-inspect] "${p}" -> keys: ${Object.keys(m || {}).join(", ")}; default typeof: ${typeof (m && (m as any).default)}`,
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(
          `[script-inspect] "${p}" import failed: ${e && (e as any).message ? (e as any).message : String(e)}`,
        );
      }
    }
    // This test is purely diagnostic and should not fail CI.
    expect(true).toBe(true);
  });

  it("Probe various style import id formats (diagnostic)", async () => {
    // Use the repository root that matches the test environment for absolute path variants.
    const root = "/home/lightjunction/GITHUB/Kam/KamWEBUI";

    const variants = [
      "@/pages/Home.vue?vue&type=style&index=0&lang.css",
      "@/pages/Command.vue?vue&type=style&index=0&lang.css",
      `${root}/src/pages/Home.vue?vue&type=style&index=0&lang.css`,
      `${root}/src/pages/Command.vue?vue&type=style&index=0&lang.css`,
      `file://${root}/src/pages/Home.vue?vue&type=style&index=0&lang.css`,
      `file://${root}/src/pages/Command.vue?vue&type=style&index=0&lang.css`,
      `/@fs${root}/src/pages/Home.vue?vue&type=style&index=0&lang.css`,
      `/@fs${root}/src/pages/Command.vue?vue&type=style&index=0&lang.css`,
    ];

    for (const p of variants) {
      try {
        // @ts-ignore - runtime-resolved module queries
        const m = await import(p);
        // eslint-disable-next-line no-console
        console.log(
          `[style-probe] "${p}" -> typeof default: ${typeof (m && (m as any).default)}; keys: ${Object.keys(m || {}).join(", ")}`,
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(
          `[style-probe] "${p}" import failed: ${e && (e as any).message ? (e as any).message : String(e)}`,
        );
      }
    }

    // Diagnostic only — do not fail the suite.
    expect(true).toBe(true);
  });
});
