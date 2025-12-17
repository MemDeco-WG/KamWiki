import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/main.css";
import { createI18n } from "vue-i18n";
import cliEn from "./data/cli/en.json";
import cliZh from "./data/cli/zh.json";

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
    check: {
      no_issues_found: "No issues found.",
      some_issues_found: "Some issues found.",
      noIssuesFound: "No issues found.",
      someIssuesFound: "Some issues found.",
    },
    app: {
      brand: "Kam",
      brandSuffix: "Wiki",
      subtitle: "CLI toolkit",
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
      offlineDesc: "Content is sourced from the project manifest.",
      footer:
        "Kam — CLI toolkit documentation. Content is local and sourced from the project manifest.",
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
          {
            flag: "--id <ID>",
            description: "Project ID (default: folder basename)",
          },
          {
            flag: "--project-name <PROJECT_NAME>",
            description: "Project name (default: Example Module Name)",
          },
          {
            flag: "--version <VERSION>",
            description: "Project version (default: 1.0.0)",
          },
          {
            flag: "-y, --yes",
            description:
              'Assume "yes" to all confirmation prompts (skip confirmation)',
          },
          { flag: "--author <AUTHOR>", description: "Author name" },
          {
            flag: "--update-json <UPDATE_JSON>",
            description: "Update JSON URL (default: generated from git)",
          },
          {
            flag: "--description <DESCRIPTION>",
            description: "Project description",
          },
          {
            flag: "-f, --force",
            description: "Force overwrite existing files",
          },
          { flag: "-i, --interactive", description: "Run in interactive mode" },
          {
            flag: "--var <VAR>",
            description:
              "Template variable in key=value format (can be repeated)",
          },
          {
            flag: "-t, --template <TEMPLATE>",
            description: "Template to use (builtin ID or local path)",
          },
          { flag: "--tmpl", description: "Create a template project" },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          id: "Project ID (default: folder basename)",
          projectName: "Project name (default: Example Module Name)",
          version: "Project version (default: 1.0.0)",
          yes: "Assume 'yes' to all confirmation prompts (use -y to skip)",
          author: "Author name",
          updateJson: "Update JSON URL (default: generated from git)",
          description: "Project description",
          force: "Force overwrite existing files",
          interactive: "Run the init interactively; ask for required values",
          var: "Template variable in key=value format (can be repeated)",
          template: "Template to use (builtin ID or local path)",
          tmpl: "Create a template project",
          help: "Print help (see a summary with '-h')",
        },
      },
      build: {
        name: "build",
        summary:
          "Builds a module or workspace member and creates artifacts in the output directory",
        usage: "kam build [OPTIONS] [PATH] [PATH]",
        description:
          "Builds a module or workspace member and creates artifacts in the output directory.",
        examples: [
          "kam build",
          "kam build --release --output dist",
          "kam build -a --sign",
        ],
        flags: [
          { flag: "-a, --all", description: "Build all workspace members" },
          {
            flag: "-o, --output <OUTPUT>",
            description: "Output directory (default: dist)",
          },
          {
            flag: "-b, --bump",
            description: "Enable version bump process (KAM_BUMP_ENABLED)",
          },
          {
            flag: "-y, --yes",
            description:
              'Assume "yes" to all confirmation prompts (skip confirmation)',
          },
          {
            flag: "-r, --release",
            description: "Enable release build mode (KAM_RELEASE_ENABLED)",
          },
          {
            flag: "-s, --sign",
            description: "Enable signing after build (KAM_SIGN_ENABLE)",
          },
          {
            flag: "-i, --interactive",
            description:
              "Run build interactively; confirm potentially destructive actions",
          },
          {
            flag: "-P, --pre-release",
            description: "Enable pre-release mode (KAM_PRE_RELEASE)",
          },
          {
            flag: "-q, --quiet",
            description:
              "Suppress non-essential output; show warnings and errors only",
          },
          {
            flag: "-j, --jobs <JOBS>",
            description:
              "Number of parallel jobs (default: number of CPU cores)",
          },
        ],
        flagDescriptions: {
          all: "Build all workspace members",
          output: "Output directory (default: dist)",
          bump: "Enable version bump process (KAM_BUMP_ENABLED)",
          yes: 'Assume "yes" to all confirmation prompts (use -y to skip)',
          release: "Enable release build mode (KAM_RELEASE_ENABLED)",
          sign: "Enable signing after build (KAM_SIGN_ENABLE)",
          interactive:
            "Run build interactively; confirm potentially destructive actions",
          preRelease: "Enable pre-release mode (KAM_PRE_RELEASE)",
          quiet: "Suppress non-essential output; show warnings and errors only",
          jobs: "Number of parallel jobs (default: number of CPU cores)",
        },
      },
      version: {
        name: "version",
        summary: "Manage module versions and bump policies",
        usage: "kam version [bump|list|set|get] [OPTIONS]",
        description:
          "Tools for managing semantic versions and bumping policies for the module. Useful commands often include bumping a version, listing the history, or configuring automatic bump rules.",
        flags: [
          {
            flag: "-y, --yes",
            description:
              'Assume "yes" to all confirmation prompts (skip confirmation)',
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          yes: "Assume 'yes' to all confirmation prompts (use -y to skip)",
          help: "Print help (see a summary with '-h')",
        },
      },
      cache: {
        name: "cache",
        summary: "Manage local template and artifact cache",
        usage: "kam cache [OPTIONS] <COMMAND>",
        description:
          "Controls the local cache used by Kam for templates and artifacts. You can clean up disk usage, examine cached items, or refresh cached templates/artifacts.",
        subcommands: {
          list: "List cached templates",
          clean: "Clean all cached templates",
          add: "Add a template to cache from a local directory or archive",
          remove: "Remove a template from cache",
          path: "Show cache directory path",
        },
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      tmpl: {
        name: "tmpl",
        summary:
          "Manage templates: import, export, package, pull, update and list",
        usage: "kam tmpl [OPTIONS] <COMMAND>",
        description:
          "Template management utilities: import templates into local cache, export or package templates, list available templates, pull or update templates from URLs, and show template cache path.",
        subcommands: {
          list: "List all available templates",
          import: "Import template(s) from file",
          export: "Export template(s) to file",
          remove: "Remove a template from cache",
          path: "Show template cache directory path",
          pull: "Download templates from a URL and import them",
          update: "Re-download based on recorded URL in config and import",
        },
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      validate: {
        name: "validate",
        summary: "Validate `kam.toml` configuration and templates",
        usage: "kam validate [OPTIONS] [PATH] [PATH]",
        description:
          "Checks your project configuration (kam.toml) and templates for syntax, required fields, and other consistency validations.",
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      completions: {
        name: "completions",
        summary: "Generate shell completion scripts for common shells",
        usage: "kam completions [OPTIONS] <SHELL> [SHELL]",
        description:
          "Generate shell completion scripts that help with tab-completion for `kam` commands on supported shells.",
        flags: [
          {
            flag: "-o, --out <OUT>",
            description:
              "Output file for the completion script; if omitted, prints to STDOUT",
          },
          {
            flag: "--install",
            description:
              "Install the completion script into the shell's completion directory (may require root)",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          out: "Output file for the completion script; if omitted, prints to STDOUT",
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      secret: {
        name: "secret",
        summary: "Secret keyring management (used by sign/verify tasks)",
        usage: "kam secret [OPTIONS] <COMMAND>",
        description:
          "Manage stored secrets: add, get, list, remove, export, import and trust CA management.",
        subcommands: {
          list: "List saved secrets",
          add: "Add a secret from a value or file",
          get: "Get a secret and print it to stdout (or write to file)",
          remove: "Remove a secret",
          export:
            "Export secret to a file (default: decrypted; use --encrypted to export encrypted blob)",
          import: "Import secret from a file",
          "export-pub": "Export public key from a stored private key secret",
          "import-cert":
            "Import developer certificate chain from GitHub issue or file",
          trust: "Manage trusted Root CAs",
        },
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      sign: {
        name: "sign",
        summary: "Sign an artifact using a key from the keyring or a PEM file",
        usage: "kam sign [OPTIONS] [SRC] [SRC]",
        description:
          "Creates a cryptographic signature for an artifact (e.g., the packaged ZIP) using a key from your secret keyring or a provided PEM/Key file.",
        examples: [
          "kam sign dist/module.zip",
          "kam sign --secret mykey dist/module.zip",
          "kam sign --key-path /path/to/key.pem dist/module.zip",
        ],
        flags: [
          {
            flag: "--secret <SECRET>",
            description:
              "Name of the keyring secret holding the private key (default: main)",
          },
          {
            flag: "--out <OUT>",
            description: "Output directory (default: dist)",
          },
          {
            flag: "--dist <DIR>",
            description:
              "Sign all artifacts in given directory (alternative to src)",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "--all",
            description:
              "Sign all artifacts inside dist (alias of --dist with default dist)",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "--cert <CERT>",
            description:
              "Certificate PEM chain path to include in signature metadata",
          },
          {
            flag: "--key-path <KEY_PATH>",
            description:
              "Optional path to private key PEM file to use instead of keyring secret",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          secret:
            "Name of the keyring secret holding the private key (default: main)",
          out: "Output directory (default: dist)",
          dist: "Sign all artifacts in given directory (alternative to src)",
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          all: "Sign all artifacts inside dist (alias of --dist with default dist)",
          yes: "Assume 'yes' to all confirmation prompts",
          cert: "Certificate PEM chain path to include in signature metadata",
          keyPath:
            "Optional path to private key PEM file to use instead of keyring secret",
        },
      },
      verify: {
        name: "verify",
        summary:
          "Verify digital signatures or sigstore bundles; supports a variety of verification options.",
        usage: "kam verify [OPTIONS] [SRC]",
        description:
          "Verify digital signatures or sigstore bundles (DSSE). Supports a variety of verification options for .sig files, sigstore bundles, certificate-based verification, and key-based verification.",
        examples: [
          "kam verify dist/module.zip dist/module.zip.sig",
          "kam verify --bundle dist/module.sigstore.json dist/module.zip",
          "kam verify --cert /path/to/cert.pem dist/module.zip",
        ],
        flags: [
          {
            flag: "--sig <SIG>",
            description:
              "Path to signature file (base64 .sig). If omitted, defaults to <src>.sig",
          },
          {
            flag: "--bundle <BUNDLE>",
            description:
              "Path to .sigstore.json bundle containing DSSE envelope and certs",
          },
          {
            flag: "--cert <CERT>",
            description:
              "Optional certificate PEM to use for verification (overrides bundle cert)",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "--root <ROOT>",
            description:
              "Optional root CA PEM to verify a certificate chain (trusted anchor)",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "--secret <SECRET>",
            description:
              "Name of secret in kam keyring that holds the private key; used to derive public key for verification [default: main]",
          },
          {
            flag: "--key <KEY>",
            description:
              "Path to public key PEM for verification (overrides derived key from secret)",
          },
          {
            flag: "--cert-name <CERT_NAME>",
            description:
              "Name of cached developer certificate to use for verification",
          },
          {
            flag: "--cert-chain <CERT_CHAIN>",
            description: "Path to certificate chain PEM file for verification",
          },
          {
            flag: "--skip-crl",
            description: "Skip CRL (Certificate Revocation List) check",
          },
          {
            flag: "-v, --verbose",
            description: "Verbose output showing verification steps",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          sig: "Path to signature file (base64 .sig); default <src>.sig",
          bundle: ".sigstore.json bundle containing DSSE envelope and certs",
          cert: "Optional certificate PEM to use for verification (overrides bundle cert)",
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          root: "Optional root CA PEM to verify a certificate chain (trusted anchor)",
          yes: "Assume 'yes' to all confirmation prompts",
          secret:
            "Name of secret in kam keyring used to derive public key (default: main)",
          key: "Path to public key PEM for verification (overrides derived key from secret)",
          certName:
            "Name of cached developer certificate to use for verification",
          certChain: "Path to certificate chain PEM file for verification",
          skipCrl: "Skip CRL (Certificate Revocation List) check",
          verbose: "Verbose output showing verification steps",
        },
      },
      check: {
        name: "check",
        summary: "Check project JSON/YAML/Markdown files (lint/format/parse)",
        usage: "kam check [OPTIONS] [PATH] [PATH]",
        description:
          "Static checking utilities for files in the project, including linting, formatting, and parsing validations. Helps catch errors early in CI or local development.",
        flags: [
          { flag: "--json", description: "Output results as JSON" },
          {
            flag: "--fix",
            description: "Try to automatically fix/format files when possible",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          json: "Output results as JSON",
          fix: "Try to automatically fix/format files when possible",
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      export: {
        name: "export",
        summary:
          "Export `kam.toml` to common formats (module.prop, module.json, repo.json, track.json, config.json, update.json)",
        usage: "kam export [OUTPUT-TARGET] [OPTIONS]",
        description:
          "Export module metadata defined in kam.toml to one of the supported artifact formats. Useful when producing artifacts for different distribution systems or tooling.",
        examples: [
          "kam export json > module.json",
          "kam export prop > module.prop",
          "kam export repo repo.json",
        ],
        flags: [
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      toml: {
        name: "toml",
        summary:
          "Inspect and edit `kam.toml` using dot-path keys (get/set/unset/list)",
        usage: "kam toml [OPTIONS] <COMMAND>",
        description:
          "Utility to inspect and edit the kam.toml configuration file programmatically. Accepts dot-path keys to read or modify nested values.",
        subcommands: {
          get: "Get a value by dot-separated key path",
          set: "Set a value by key (usage: kam toml set prop.name=value | kam toml set prop.name value)",
          unset: "Unset/remove a key",
          list: "Dump the full toml",
        },
        flags: [
          {
            flag: "--file <FILE>",
            description: "Operate on this file instead of project's kam.toml",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          file: "Operate on this file instead of project's kam.toml",
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org)",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      config: {
        name: "config",
        summary:
          "Manage per-project or global kam configuration (similar to git config)",
        usage: "kam config [OPTIONS] <COMMAND>",
        description:
          "Manage configuration values for Kam either per-project (local) or globally. Works similar to `git config` in semantics.",
        examples: [
          "kam config set --global root.manager Magisk",
          "kam config get root.manager",
          "kam config list",
        ],
        subcommands: {
          get: "Get a configuration value by key (dot-separated path)",
          set: "Set a configuration value by key",
          unset: "Unset (remove) a configuration value by key",
          list: "List all config values in the target file",
          show: "Show built-in configuration keys and their descriptions",
        },
        flags: [
          {
            flag: "--global",
            description:
              "Use the global configuration file (~/.kam/config.toml)",
          },
          {
            flag: "--local",
            description:
              "Force use of the local configuration file (project `.kam/config.toml`)",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "URL for the modules registry API (default: https://modules.kernelsu.org). Overrides the built-in modules endpoint",
          },
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          global: "Use the global configuration file (~/.kam/config.toml)",
          local:
            "Force use of the local configuration file (project `.kam/config.toml`)",
          modulesUrl:
            "URL for the modules registry API (default: https://modules.kernelsu.org)",
          yes: "Assume 'yes' to all confirmation prompts",
        },
      },
      install: {
        name: "install",
        summary:
          "Install a module package to a connected device using the configured root manager",
        usage: "kam install [OPTIONS] [PATH] [PATH]",
        description:
          "Install a built module (.zip) to a connected device using Magisk/KernelSU/APatchSU. Configure the preferred manager with `kam config set root.manager <Manager>`.",
        examples: [
          "kam build && kam install dist/module.zip",
          "kam install --manager Magisk /path/to/module.zip",
        ],
        flags: [
          {
            flag: "--manager <MANAGER>",
            description: "Preferred root manager (Magisk, KernelSU, APatchSU)",
          },
          {
            flag: "--dry-run",
            description:
              "Print the derived install command instead of executing it",
          },
          { flag: "-q, --quiet", description: "Suppress non-essential output" },
        ],
        flagDescriptions: {
          manager: "Preferred root manager (Magisk, KernelSU, APatchSU)",
          dryRun: "Print the derived install command instead of executing it",
          quiet: "Suppress non-essential output",
        },
      },
      repo: {
        name: "repo",
        summary: "Interact with module repository (search/download)",
        usage: "kam repo [OPTIONS] [-- [TARGETS]...]",
        description:
          "Search and download modules from a configured repository. Supports pacman-style sync (-S) and search (-s) flags.",
        examples: [
          "kam repo -S some.module",
          "kam repo -s search-term",
          "kam repo -Ss keyword",
        ],
        flags: [
          {
            flag: "-S, --sync",
            description:
              "Pacman-style sync (download) flag (equivalent to pacman -S)",
          },
          {
            flag: "-s, --search",
            description:
              "Pacman-style search modifier (use with -S as '-Ss' to search or '-s' alone to search)",
          },
          {
            flag: "-y, --yes",
            description: 'Assume "yes" to all confirmation prompts',
          },
          { flag: "-h, --help", description: "Print help" },
        ],
        flagDescriptions: {
          sync: "Pacman-style sync (download) flag (equivalent to pacman -S)",
          search: "Pacman-style search modifier",
        },
      },
      about: {
        name: "about",
        summary: "Display about information for Kam and credits",
        usage: "kam about [OPTIONS]",
        description: "Display about information for Kam and credits",
        flags: [
          {
            flag: "-y, --yes",
            description: "Assume 'yes' to all confirmation prompts",
          },
          {
            flag: "-h, --help",
            description: "Print help (see a summary with '-h')",
          },
        ],
        flagDescriptions: {
          yes: "Assume 'yes' to all confirmation prompts",
        },
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
    check: {
      no_issues_found: "未发现问题。",
      some_issues_found: "发现问题。",
      noIssuesFound: "未发现问题。",
      someIssuesFound: "发现问题。",
    },
    app: {
      brand: "Kam",
      brandSuffix: "文档",
      subtitle: "CLI 工具",
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
      offlineDesc: "内容来自项目清单。",
      footer: "Kam — CLI 工具文档。内容来自项目清单的本地副本。",
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
          { flag: "--id <ID>", description: "项目 ID（默认：文件夹基名）" },
          {
            flag: "--project-name <PROJECT_NAME>",
            description: "项目名称（默认：Example Module Name）",
          },
          {
            flag: "--version <VERSION>",
            description: "项目版本（默认：1.0.0）",
          },
          {
            flag: "-y, --yes",
            description: "对所有确认提示假定“是”；使用 -y 跳过确认",
          },
          { flag: "--author <AUTHOR>", description: "作者姓名" },
          {
            flag: "--update-json <UPDATE_JSON>",
            description: "更新 JSON URL（默认：由 git 生成）",
          },
          { flag: "--description <DESCRIPTION>", description: "项目描述" },
          { flag: "-f, --force", description: "强制覆盖现有文件" },
          {
            flag: "-i, --interactive",
            description: "交互式运行，提示必要选项",
          },
          {
            flag: "--var <VAR>",
            description: "模板变量，键值对格式（key=value，可重复）",
          },
          {
            flag: "-t, --template <TEMPLATE>",
            description: "使用的模板（内置 ID 或本地路径）",
          },
          { flag: "--tmpl", description: "创建模板项目" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          id: "项目 ID（默认：文件夹基名）",
          projectName: "项目名称（默认：Example Module Name）",
          version: "项目版本（默认：1.0.0）",
          yes: "对所有确认提示假定“是”；使用 -y 跳过确认",
          author: "作者姓名",
          updateJson: "更新 JSON URL（默认：由 git 生成）",
          description: "项目描述",
          force: "强制覆盖现有文件",
          interactive: "交互式运行，提示必要选项",
          var: "模板变量，键值对格式（key=value，可重复）",
          template: "使用的模板（内置 ID 或本地路径）",
          tmpl: "创建模板项目",
          help: "打印帮助（使用 '-h' 查看摘要）",
        },
      },
      build: {
        name: "build",
        summary: "构建模块或工作区成员并在输出目录中生成工件",
        usage: "kam build [OPTIONS] [PATH] [PATH]",
        description: "构建模块或工作区成员并在输出目录中生成工件。",
        examples: [
          "kam build",
          "kam build --release --output dist",
          "kam build -a --sign",
        ],
        flags: [
          { flag: "-a, --all", description: "构建所有工作区成员" },
          {
            flag: "-o, --output <OUTPUT>",
            description: "输出目录（默认：dist）",
          },
          {
            flag: "-b, --bump",
            description: "启用版本提升流程 (KAM_BUMP_ENABLED)",
          },
          {
            flag: "-y, --yes",
            description: "对所有确认提示假定“是”；使用 -y 跳过确认",
          },
          {
            flag: "-r, --release",
            description: "启用发行版构建模式 (KAM_RELEASE_ENABLED)",
          },
          {
            flag: "-s, --sign",
            description: "构建后启用签名 (KAM_SIGN_ENABLE)",
          },
          {
            flag: "-i, --interactive",
            description: "以交互方式运行构建；确认潜在的破坏性操作",
          },
          {
            flag: "-P, --pre-release",
            description: "启用预发布模式 (KAM_PRE_RELEASE)",
          },
          {
            flag: "-q, --quiet",
            description: "抑制非必要输出；仅显示警告和错误",
          },
          {
            flag: "-j, --jobs <JOBS>",
            description: "并行作业数（默认：CPU 内核数）",
          },
        ],
        flagDescriptions: {
          all: "构建所有工作区成员",
          output: "输出目录（默认：dist）",
          bump: "启用版本提升流程 (KAM_BUMP_ENABLED)",
          yes: "对所有确认提示假定“是”",
          release: "启用发行版构建模式 (KAM_RELEASE_ENABLED)",
          sign: "构建后启用签名 (KAM_SIGN_ENABLE)",
          interactive: "以交互方式运行构建；确认潜在的破坏性操作",
          preRelease: "启用预发布模式 (KAM_PRE_RELEASE)",
          quiet: "抑制非必要输出；仅显示警告和错误",
          jobs: "并行作业数（默认：CPU 内核数）",
        },
      },
      version: {
        name: "version",
        summary: "管理模块版本和版本提升策略",
        usage: "kam version [bump|list|set|get] [OPTIONS]",
        description:
          "用于管理语义化版本和提升策略的工具。常见操作包括提升版本、列出历史或配置自动提升规则。",
        flags: [
          {
            flag: "-y, --yes",
            description: "对所有确认提示假定“是”；使用 -y 跳过确认",
          },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          yes: "对所有确认提示假定“是”",
          help: "打印帮助（使用 '-h' 查看摘要）",
        },
      },
      cache: {
        name: "cache",
        summary: "管理本地模板和工件缓存",
        usage: "kam cache [OPTIONS] <COMMAND>",
        description:
          "控制 Kam 用于模板和工件的本地缓存。可以清理磁盘使用、检查缓存项或刷新缓存的模板/工件。",
        subcommands: {
          list: "列出缓存的模板",
          clean: "清理所有缓存的模板",
          add: "从本地目录或归档添加模板到缓存",
          remove: "从缓存中移除模板",
          path: "显示缓存目录路径",
        },
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          yes: "对所有确认提示假定“是”",
        },
      },
      tmpl: {
        name: "tmpl",
        summary: "管理模板：导入、导出、打包、拉取、更新和列出",
        usage: "kam tmpl [OPTIONS] <COMMAND>",
        description:
          "模板管理工具：将模板导入本地缓存、导出/打包模板、列出可用模板、从 URL 拉取或更新模板，以及显示模板缓存路径。",
        subcommands: {
          list: "列出所有可用模板",
          import: "从文件导入模板",
          export: "导出模板到文件",
          remove: "从缓存中移除模板",
          path: "显示模板缓存目录路径",
          pull: "从 URL 下载模板并导入",
          update: "根据配置中记录的 URL 重新下载并导入",
        },
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          yes: "对所有确认提示假定“是”",
        },
      },
      validate: {
        name: "validate",
        summary: "验证 `kam.toml` 配置和模板",
        usage: "kam validate [OPTIONS] [PATH] [PATH]",
        description:
          "检查项目配置（kam.toml）和模板的语法、必需字段以及其他一致性验证。",
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          yes: "对所有确认提示假定“是”",
        },
      },
      completions: {
        name: "completions",
        summary: "为常见 shell 生成补全脚本",
        usage: "kam completions [OPTIONS] <SHELL> [SHELL]",
        description: "生成用于 `kam` 命令的 tab 补全脚本，支持常见的 shell。",
        flags: [
          {
            flag: "-o, --out <OUT>",
            description: "输出文件；省略时打印到标准输出（STDOUT）",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          out: "输出文件；省略时打印到标准输出（STDOUT）",
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          yes: "对所有确认提示假定“是”",
        },
      },
      secret: {
        name: "secret",
        summary: "机密钥匙环管理（用于签名/验证任务）",
        usage: "kam secret [OPTIONS] <COMMAND>",
        description:
          "管理存储的机密：添加、获取、列出、移除、导出、导入以及受信任的根证书（CA）管理。",
        subcommands: {
          list: "列出已保存的机密",
          add: "从值或文件添加机密",
          get: "获取机密并打印到标准输出（或写入文件）",
          remove: "移除机密",
          export:
            "导出机密到文件（默认：解密导出；使用 --encrypted 导出加密 blob）",
          import: "从文件导入机密",
          "export-pub": "从存储的私钥机密导出公钥",
          "import-cert": "从 GitHub issue 或文件导入开发者证书链",
          trust: "管理受信任的根证书（CA）",
        },
        flags: [
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          yes: "对所有确认提示假定“是”",
        },
      },
      sign: {
        name: "sign",
        summary: "使用钥匙环中的密钥或 PEM 文件对工件进行签名",
        usage: "kam sign [OPTIONS] [SRC] [SRC]",
        description:
          "为工件（例如打包的 ZIP）创建加密签名，使用来自密钥环的密钥或提供的 PEM/Key 文件。",
        examples: [
          "kam sign dist/module.zip",
          "kam sign --secret mykey dist/module.zip",
          "kam sign --key-path /path/to/key.pem dist/module.zip",
        ],
        flags: [
          {
            flag: "--secret <SECRET>",
            description: "密钥环中保存私钥的秘钥名称（默认：main）",
          },
          { flag: "--out <OUT>", description: "输出目录（默认：dist）" },
          {
            flag: "--dist <DIR>",
            description: "对指定目录中的所有工件签名（作为 src 的替代）",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          {
            flag: "--all",
            description:
              "签名 dist 中的所有工件（等同于 --dist 并使用默认 dist）",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          {
            flag: "--cert <CERT>",
            description: "包含在签名元数据中的证书 PEM 链路径",
          },
          {
            flag: "--key-path <KEY_PATH>",
            description: "可选的私钥 PEM 文件路径，用于替代密钥环中的密钥",
          },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          secret: "密钥环中保存私钥的秘钥名称（默认：main）",
          out: "输出目录（默认：dist）",
          dist: "对指定目录中的所有工件签名（作为 src 的替代）",
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org）",
          all: "签名 dist 中的所有工件（等同于 --dist 并使用默认 dist）",
          yes: "对所有确认提示假定“是”",
          cert: "包含在签名元数据中的证书 PEM 链路径",
          keyPath: "可选的私钥 PEM 文件路径，用于替代密钥环中的密钥",
        },
      },
      verify: {
        name: "verify",
        summary: "验证数字签名或 sigstore 包（支持多种验证选项）",
        usage: "kam verify [OPTIONS] [SRC]",
        description:
          "验证数字签名或 sigstore bundle（DSSE）。支持针对 .sig 文件、sigstore 包、基于证书或基于密钥的多种验证选项。",
        examples: [
          "kam verify dist/module.zip dist/module.zip.sig",
          "kam verify --bundle dist/module.sigstore.json dist/module.zip",
          "kam verify --cert /path/to/cert.pem dist/module.zip",
        ],
        flags: [
          {
            flag: "--sig <SIG>",
            description: "签名文件路径（base64 .sig）。若省略，默认 <src>.sig",
          },
          {
            flag: "--bundle <BUNDLE>",
            description: ".sigstore.json 包路径，包含 DSSE 信封和证书",
          },
          {
            flag: "--cert <CERT>",
            description: "用于验证的可选证书 PEM（覆盖包中的证书）",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认：https://modules.kernelsu.org），覆盖内置端点",
          },
          {
            flag: "--root <ROOT>",
            description: "可选的根 CA PEM，用于验证证书链（受信任锚点）",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          {
            flag: "--secret <SECRET>",
            description:
              "kam 密钥环中保存私钥的密钥名；用于派生用于验证的公钥（默认：main）",
          },
          {
            flag: "--key <KEY>",
            description: "用于验证的公钥 PEM 路径（覆盖从密钥派生）",
          },
          {
            flag: "--cert-name <CERT_NAME>",
            description: "用于验证的缓存开发者证书名称",
          },
          {
            flag: "--cert-chain <CERT_CHAIN>",
            description: "用于验证的证书链 PEM 文件路径",
          },
          { flag: "--skip-crl", description: "跳过证书吊销列表（CRL）检查" },
          { flag: "-v, --verbose", description: "显示详细的验证步骤输出" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          sig: "签名文件路径（base64 .sig）；默认 <src>.sig",
          bundle: ".sigstore.json 包路径，包含 DSSE 信封和证书",
          cert: "用于验证的可选证书 PEM（覆盖包中的证书）",
          modulesUrl:
            "模块注册 API 的 URL（默认：https://modules.kernelsu.org）",
          root: "可选的根 CA PEM，用于验证证书链",
          yes: "对所有确认提示假定“是”",
          secret: "kam 密钥环中保存私钥的密钥名（默认：main）",
          key: "用于验证的公钥 PEM 路径（覆盖从密钥派生）",
          certName: "用于验证的缓存开发者证书名称",
          certChain: "用于验证的证书链 PEM 文件路径",
          skipCrl: "跳过证书吊销列表（CRL）检查",
          verbose: "显示详细的验证步骤输出",
        },
      },
      check: {
        name: "check",
        summary: "检查项目 JSON/YAML/Markdown 文件（lint/格式/解析）",
        usage: "kam check [OPTIONS] [PATH] [PATH]",
        description:
          "对项目中的文件进行静态检查，包括 lint、格式化和解析验证。在 CI 或本地开发中有助于及早发现错误。",
        flags: [
          { flag: "--json", description: "以 JSON 格式输出结果" },
          { flag: "--fix", description: "尽可能尝试自动修复/格式化文件" },
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          json: "以 JSON 格式输出结果",
          fix: "尽可能尝试自动修复/格式化文件",
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          yes: "对所有确认提示假定“是”",
        },
      },
      export: {
        name: "export",
        summary:
          "将 `kam.toml` 导出为常见格式（module.prop、module.json、repo.json、track.json、config.json、update.json）",
        usage: "kam export [OUTPUT-TARGET] [OPTIONS]",
        description:
          "将 kam.toml 中定义的模块元数据导出为受支持的工件格式之一。这有助于为不同的分发系统或工具链生成工件。",
        flags: [
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          yes: "对所有确认提示假定“是”",
        },
      },
      toml: {
        name: "toml",
        summary: "使用点路径键检查和编辑 `kam.toml`（get/set/unset/list）",
        usage: "kam toml [OPTIONS] <COMMAND>",
        description:
          "程序化地检查和编辑 kam.toml 配置文件的工具。接受点路径键以读取或修改嵌套的值。",
        subcommands: {
          get: "按点路径键获取值",
          set: "按键设置值（示例：kam toml set prop.name=value 或 kam toml set prop.name value）",
          unset: "取消/移除键",
          list: "导出完整的 toml",
        },
        flags: [
          {
            flag: "--file <FILE>",
            description: "指定文件而不是使用项目的 kam.toml",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          file: "指定文件而不是使用项目的 kam.toml",
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org）",
          yes: "对所有确认提示假定“是”",
        },
      },
      config: {
        name: "config",
        summary: "管理每个项目或全局的 kam 配置（类似 git config）",
        usage: "kam config [OPTIONS] <COMMAND>",
        description:
          "管理 Kam 的配置值，可在项目范围（本地）或全局范围设置，语义类似 `git config`。",
        subcommands: {
          get: "按键（点分路径）获取配置值",
          set: "按键设置配置值",
          unset: "取消（移除）配置键",
          list: "列出目标文件中的所有配置值",
          show: "显示内置配置键及其描述",
        },
        flags: [
          {
            flag: "--global",
            description: "使用全局配置文件（~/.kam/config.toml）",
          },
          {
            flag: "--local",
            description: "强制使用本地配置文件（项目 `.kam/config.toml`）",
          },
          {
            flag: "--modules-url <URL>",
            description:
              "模块注册 API 的 URL（默认: https://modules.kernelsu.org），覆盖内置模块端点",
          },
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          global: "使用全局配置文件（~/.kam/config.toml）",
          local: "强制使用本地配置文件（项目 `.kam/config.toml`）",
          modulesUrl:
            "模块注册 API 的 URL（默认: https://modules.kernelsu.org）",
          yes: "对所有确认提示假定“是”",
        },
      },
      install: {
        name: "install",
        summary: "将模块包安装到连接的设备（使用配置的 root 管理器）",
        usage: "kam install [OPTIONS] [PATH] [PATH]",
        description:
          "将已构建的模块 (.zip) 安装到连接的设备，使用 Magisk/KernelSU/APatchSU。使用 `kam config set root.manager <Manager>` 配置首选管理器。",
        examples: [
          "kam build && kam install dist/module.zip",
          "kam install --manager Magisk /path/to/module.zip",
        ],
        flags: [
          {
            flag: "--manager <MANAGER>",
            description: "首选 root 管理器（Magisk、KernelSU、APatchSU）",
          },
          {
            flag: "--dry-run",
            description: "打印将执行的安装命令而不实际执行",
          },
          { flag: "-q, --quiet", description: "抑制非必要输出" },
        ],
        flagDescriptions: {
          manager: "首选 root 管理器（Magisk、KernelSU、APatchSU）",
          dryRun: "打印将执行的安装命令而不实际执行",
          quiet: "抑制非必要输出",
        },
      },
      repo: {
        name: "repo",
        summary: "与模块仓库交互（搜索/下载）",
        usage: "kam repo [OPTIONS] [-- [TARGETS]...]",
        description:
          "与配置的模块仓库交互，可搜索和下载模块。支持类似 pacman 的同步 (-S) 与搜索 (-s) 标志。",
        flags: [
          {
            flag: "-S, --sync",
            description: "Pacman 式的同步（下载）标志 (等同于 pacman -S)",
          },
          {
            flag: "-s, --search",
            description: "Pacman 式的搜索修饰符（与 -S 一起可用，如 '-Ss'）",
          },
        ],
        flagDescriptions: {
          sync: "Pacman 式的同步（下载）标志 (等同于 pacman -S)",
          search: "Pacman 式的搜索修饰符",
        },
      },
      about: {
        name: "about",
        summary: "显示关于 Kam 的信息与致谢",
        usage: "kam about [OPTIONS]",
        description: "显示 Kam 的关于信息与致谢。",
        flags: [
          { flag: "-y, --yes", description: "对所有确认提示假定“是”" },
          { flag: "-h, --help", description: "打印帮助（使用 '-h' 查看摘要）" },
        ],
        flagDescriptions: {
          yes: "对所有确认提示假定“是”",
        },
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

// Merge generated CLI i18n into the messages object if available.
// The files are generated by `scripts/export_cli_i18n.py` and written to
// `src/data/cli/en.json` and `src/data/cli/zh.json`. If the files are absent
// or malformed we fall back to the embedded messages (best-effort merge only).
try {
  // Merge EN
  if (cliEn && typeof (cliEn as any) === "object") {
    // Merge global flags (simple key->string mapping)
    if (cliEn.flags && typeof cliEn.flags === "object") {
      messages.en.globalFlags = {
        ...(messages.en.globalFlags || {}),
        ...cliEn.flags,
      };
    }

    // Merge per-command summaries/descriptions and flag descriptions safely
    if (cliEn.commands && typeof (cliEn.commands as any) === "object") {
      const cmds = messages.en.commands as any;
      for (const [cmdName, cmdData] of Object.entries(cliEn.commands as any)) {
        // Ensure the command exists with the expected shape to satisfy TypeScript's type checks
        if (!cmds[cmdName]) {
          cmds[cmdName] = {
            name: cmdName,
            summary: (cmdData && (cmdData as any).summary) || "",
            usage: "",
            description: (cmdData && (cmdData as any).description) || "",
            examples: [],
            flags: [],
            flagDescriptions: {},
          };
        } else {
          if ((cmdData as any).summary)
            cmds[cmdName].summary = (cmdData as any).summary;
          if ((cmdData as any).description)
            cmds[cmdName].description = (cmdData as any).description;
        }

        // Merge any flag descriptions present in the exported CLI JSON into `flagDescriptions`
        if (
          (cmdData as any).flags &&
          typeof (cmdData as any).flags === "object"
        ) {
          cmds[cmdName].flagDescriptions = {
            ...(cmds[cmdName].flagDescriptions || {}),
            ...(cmdData as any).flags,
          };
        }

        // Preserve subcommands in a permissive slot to allow the UI to access them if desired
        if (
          (cmdData as any).subcommands &&
          typeof (cmdData as any).subcommands === "object"
        ) {
          cmds[cmdName].subcommands = {
            ...(cmds[cmdName].subcommands || {}),
            ...(cmdData as any).subcommands,
          };
        }
      }
    }
  }
} catch (e) {
  if (import.meta.env.DEV)
    console.warn("Failed to merge generated CLI i18n for en:", e);
}

// Merge ZH (same strategy as EN)
try {
  if (cliZh && typeof (cliZh as any) === "object") {
    if (cliZh.flags && typeof cliZh.flags === "object") {
      messages.zh.globalFlags = {
        ...(messages.zh.globalFlags || {}),
        ...cliZh.flags,
      };
    }

    if (cliZh.commands && typeof (cliZh.commands as any) === "object") {
      const cmdsZh = messages.zh.commands as any;
      for (const [cmdName, cmdData] of Object.entries(cliZh.commands as any)) {
        if (!cmdsZh[cmdName]) {
          cmdsZh[cmdName] = {
            name: cmdName,
            summary: (cmdData && (cmdData as any).summary) || "",
            usage: "",
            description: (cmdData && (cmdData as any).description) || "",
            examples: [],
            flags: [],
            flagDescriptions: {},
          };
        } else {
          if ((cmdData as any).summary)
            cmdsZh[cmdName].summary = (cmdData as any).summary;
          if ((cmdData as any).description)
            cmdsZh[cmdName].description = (cmdData as any).description;
        }

        if (
          (cmdData as any).flags &&
          typeof (cmdData as any).flags === "object"
        ) {
          cmdsZh[cmdName].flagDescriptions = {
            ...(cmdsZh[cmdName].flagDescriptions || {}),
            ...(cmdData as any).flags,
          };
        }

        if (
          (cmdData as any).subcommands &&
          typeof (cmdData as any).subcommands === "object"
        ) {
          cmdsZh[cmdName].subcommands = {
            ...(cmdsZh[cmdName].subcommands || {}),
            ...(cmdData as any).subcommands,
          };
        }
      }
    }
  }
} catch (e) {
  if (import.meta.env.DEV)
    console.warn("Failed to merge generated CLI i18n for zh:", e);
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
    // Avoid bundling @nuxt/ui during production builds (it pulls in node-only deps
    // like lightningcss / @tailwindcss/oxide which break Vite production build).
    // Only attempt dynamic import during development (local dev server).
    if (import.meta.env.PROD) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(
          "[main] Skipping @nuxt/ui import during production build.",
        );
      }
      return;
    }

    // Try to dynamically import `@nuxt/ui`. Many Nuxt modules expect a Nuxt runtime,
    // but the package may still export usable components or a plugin function that
    // can be used in a plain Vue 3 app.
    const nuxtUI: any = await import(/* @vite-ignore */ "@nuxt/ui");

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
      // Register the service worker using an absolute URL that respects Vite's
      // `base` config (available as import.meta.env.BASE_URL at build time).
      // Create an absolute URL using location.origin so registration works
      // correctly for repository pages (e.g. GitHub Pages).
      const base = import.meta.env.BASE_URL || "/";
      const swUrl = new URL("sw.js", location.origin + base);
      const reg = await navigator.serviceWorker.register(swUrl.href);
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
