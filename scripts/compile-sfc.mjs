#!/usr/bin/env node
/**
 * scripts/compile-sfc.mjs
 *
 * Small helper script to parse and compile Vue Single File Components (SFCs)
 * using @vue/compiler-sfc for quick inspection during debugging.
 *
 * Usage:
 *   node ./scripts/compile-sfc.mjs                 # inspects a few default SFCs
 *   node ./scripts/compile-sfc.mjs path/to/Comp.vue ...
 *
 * Output:
 *   - Reports presence of script/script-setup/template/style blocks
 *   - Prints short snippets of compiled script/template for easier debugging
 *   - Logs style block attributes and a trimmed snippet of style content
 *
 * This is intentionally a standalone script that prints diagnostics to stdout.
 */

import { readFile } from "fs/promises";
import path from "path";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";

function short(s, n = 240) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…(truncated)" : s;
}

async function inspectFile(relPath) {
  const file = path.resolve(process.cwd(), relPath);
  console.log("\n".repeat(1) + "== Inspecting:", file);
  let source;
  try {
    source = await readFile(file, "utf8");
  } catch (err) {
    console.error(`> Failed to read file: ${file}`);
    console.error(err && err.message ? err.message : err);
    return;
  }

  try {
    const { descriptor } = parse(source, { filename: file });

    console.log("> Script block:", Boolean(descriptor.script));
    console.log("> Script setup:", Boolean(descriptor.scriptSetup));
    console.log("> Template block:", Boolean(descriptor.template));
    console.log("> Styles count:", descriptor.styles.length);
    console.log("> Custom blocks count:", descriptor.customBlocks.length);

    descriptor.styles.forEach((s, i) => {
      console.log(`\n  style[${i}] attrs: ${JSON.stringify(s.attrs)}`);
      console.log(
        `  - scoped: ${s.scoped}, module: ${s.module}, lang: ${s.lang || "css"}`,
      );
      console.log(
        `  - content snippet: ${short(s.content.replace(/\s+/g, " "), 180)}`,
      );
    });

    // Compile script (script setup preferred)
    if (descriptor.scriptSetup || descriptor.script) {
      const id =
        path.basename(file).replace(/\W/g, "_") +
        "_" +
        Math.floor(Math.random() * 10000);
      const compiled = compileScript(descriptor, { id });
      console.log("\n> Compiled script bindings:", compiled.bindings);
      console.log("> Compiled script content snippet:\n");
      console.log(short(compiled.content, 1200));
    }

    // Compile template to JS
    if (descriptor.template && descriptor.template.content.trim()) {
      const id =
        path.basename(file).replace(/\W/g, "_") +
        "_" +
        Math.floor(Math.random() * 10000);
      const out = compileTemplate({
        source: descriptor.template.content,
        filename: file,
        id,
      });
      console.log("\n> Compiled template code snippet:\n");
      console.log(short(out.code, 1200));
      if (out.tips && out.tips.length) {
        console.log("\n> Template tips:", out.tips.join("\n"));
      }
      if (out.errors && out.errors.length) {
        console.log("\n> Template errors:", out.errors.join("\n"));
      }
    }

    // Small summary
    console.log("\n> Summary:");
    console.log(`  - script: ${Boolean(descriptor.script)}`);
    console.log(`  - scriptSetup: ${Boolean(descriptor.scriptSetup)}`);
    console.log(`  - template: ${Boolean(descriptor.template)}`);
    console.log(`  - styles: ${descriptor.styles.length}`);
    console.log("== Done\n");
  } catch (err) {
    console.error(
      "> Failed to parse/compile SFC:",
      err && err.stack ? err.stack : err,
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const targets = args.length
    ? args
    : ["src/pages/Home.vue", "src/pages/Command.vue", "src/App.vue"];

  for (const t of targets) {
    await inspectFile(t);
  }
}

if (
  import.meta.url ===
    `file://${process.cwd()}/${path.relative(process.cwd(), process.argv[1])}` ||
  process.argv[1].endsWith("compile-sfc.mjs")
) {
  // Run as script
  main().catch((err) => {
    console.error("Fatal error:", err && err.stack ? err.stack : err);
    process.exit(1);
  });
}
