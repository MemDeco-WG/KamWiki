/**
 * Simple Kam CLI commands datastore
 *
 * This file holds the canonical set of `kam` commands and a small helper API
 * used by the frontend to render the command list, perform searches, and
 * fetch details for individual commands.
 *
 * The content is derived from the prompt (the list of commands and short
 * descriptions). If you want to expand each command's documentation (usage,
 * examples, flags, and subcommands), update the `commands` array below.
 */

export type KamFlag = {
  flag: string;
  description?: string;
};

export type KamCommand = {
  /**
   * The command name (e.g. 'build', 'init').
   */
  name: string;

  /**
   * One-line summary describing the command's purpose.
   */
  summary: string;

  /**
   * Optional long-form description with details, constraints or caveats.
   */
  description?: string;

  /**
   * Short usage string or common invocation (e.g. 'kam build [OPTIONS]').
   * This is intentionally minimal to avoid inventing details beyond the prompt.
   */
  usage?: string;

  /**
   * Flags/options that are commonly used for the command.
   */
  flags?: KamFlag[];

  /**
   * Example invocations for the command (not exhaustive).
   */
  examples?: string[];
};

/**
 * Global flags that apply to `kam` itself (not command-specific)
 */
export const KAM_GLOBAL_FLAGS: KamFlag[] = [
  { flag: "-h, --help", description: "Print help (see a summary with -h)" },
  { flag: "-V, --version", description: "Print version" },
];

/**
 * The authoritative list of supported `kam` commands and short docs.
 *
 * The project README and UI will pull documentation from here. This file
 * intentionally keeps the details conservative and derived from the prompt.
 */
export const KAM_COMMANDS: KamCommand[] = [
  {
    name: "init",
    summary:
      "Initialize a new Kam project from templates (supports meta and kernel templates)",
    usage: "kam init [OPTIONS] [PATH]",
    description:
      "Create a new Kam module or project from predefined templates. Templates may include meta templates and kernel templates that bootstrap a module with opinionated configuration and layout.",
    flags: [
      {
        flag: "-i, --interactive",
        description: "Run the init interactively; prompt for required values",
      },
      {
        flag: "-f, --force",
        description: "Force creation and overwrite existing files",
      },
      {
        flag: "-t, --template <TEMPLATE>",
        description: "Specify template to use (alias: --tmpl)",
      },
      { flag: "--id <ID>", description: "Override generated module id" },
      {
        flag: "--project-name <PROJECT_NAME>",
        description: "Set the project display name",
      },
      {
        flag: "--version <VERSION>",
        description: "Set initial module version",
      },
      { flag: "--author <AUTHOR>", description: "Set author/maintainer name" },
      {
        flag: "--update-json <UPDATE_JSON>",
        description: "Provide update.json metadata",
      },
      {
        flag: "--description <DESCRIPTION>",
        description: "Short module description",
      },
      {
        flag: "--var <VAR>",
        description:
          "Provide a template variable (format: key=value). Can be repeated",
      },
      {
        flag: "--tmpl",
        description:
          "Legacy alias for --template (preserved for compatibility)",
      },
      { flag: "-h, --help", description: "Print help for init" },
    ],
    examples: [
      "kam init --template kernel/basic",
      'kam init --project-name "My Module" --author "Alice" ./my-module',
      "kam init --var maintainer=alice --var license=MIT kernel/basic",
    ],
  },

  {
    name: "build",
    summary: "Build and package a module into a deployable ZIP artifact",
    usage: "kam build [OPTIONS] [PATH]",
    description:
      "Compiles and packages a module into a ZIP artifact suitable for distribution and deployment. The exact build process depends on the module configuration and included build scripts.",
    flags: [
      { flag: "-a, --all", description: "Build all workspace members" },
      {
        flag: "-o, --output <OUTPUT>",
        description: "Output directory (default: dist)",
      },
      {
        flag: "-b, --bump",
        description: "Enable version bump behaviour (KAM_BUMP_ENABLED=1)",
      },
      {
        flag: "-r, --release",
        description: "Enable release build behavior (KAM_RELEASE_ENABLED=1)",
      },
      {
        flag: "-s, --sign",
        description: "Sign artifacts after building (KAM_SIGN_ENABLE=1)",
      },
      {
        flag: "-i, --interactive",
        description: "Run build interactively; ask for confirmations",
      },
      {
        flag: "-P, --pre-release",
        description: "Mark this as a pre-release build (KAM_PRE_RELEASE=1)",
      },
      {
        flag: "-q, --quiet",
        description:
          "Suppress most output; only warnings and errors are printed",
      },
      {
        flag: "-j, --jobs <JOBS>",
        description: "Number of parallel jobs (default: CPU cores)",
      },
      { flag: "-h, --help", description: "Print help for build" },
    ],
    examples: [
      "kam build",
      "kam build -o out/ -r -s --jobs 4",
      "kam build ./path/to/project",
    ],
  },

  {
    name: "version",
    summary: "Manage module versions and bump policies",
    usage: "kam version [VERSION]",
    description:
      "Manage or inspect the module's version. Provide a version to set it, or run without arguments to display the current version. Some projects may provide additional subcommands for advanced bump/list operations.",
    examples: ["kam version", "kam version 1.2.0"],
    flags: [{ flag: "-h, --help", description: "Print help for version" }],
  },

  {
    name: "cache",
    summary: "Manage local template and artifact cache",
    usage: "kam cache <COMMAND> [OPTIONS]",
    description:
      "Controls the local cache used by Kam for templates and artifacts. Subcommands include `list`, `clean`, `add`, `remove`, and `path` for inspecting or manipulating template cache entries.",
    examples: [
      "kam cache list",
      "kam cache clean",
      "kam cache add mytmpl /path/to/template",
    ],
  },

  {
    name: "tmpl",
    summary: "Manage templates: import, export, package, and list",
    usage: "kam tmpl <COMMAND> [OPTIONS] [ARGS]",
    description:
      "Template management utilities. This includes importing templates into your local cache, exporting or packaging templates as distributable artifacts, listing available templates, and fetching templates from remote sources (pull/update).",
    flags: [
      {
        flag: "-n, --name <NAME>",
        description: "Specify a name when importing a template",
      },
      {
        flag: "-f, --force",
        description: "Force overwrite when importing or exporting",
      },
      {
        flag: "-o, --output <OUTPUT>",
        description: "Output path for export commands",
      },
      {
        flag: "--global",
        description:
          "Some tmpl subcommands accept --global for consistency (may be no-op)",
      },
      {
        flag: "-h, --help",
        description: "Print help for tmpl or a subcommand",
      },
    ],
    examples: [
      "kam tmpl list",
      "kam tmpl import templates.tar.gz -n mytmpl",
      "kam tmpl export -o templates.zip kernel/basic",
    ],
  },

  {
    name: "validate",
    summary: "Validate `kam.toml` configuration and templates",
    usage: "kam validate [PATH]",
    description:
      "Checks your project configuration (kam.toml) and templates for syntax, required fields, and other consistency validations. Defaults to the current directory if no PATH is provided.",
    examples: ["kam validate", "kam validate ./my-module"],
    flags: [{ flag: "-h, --help", description: "Print help for validate" }],
  },

  {
    name: "completions",
    summary: "Generate shell completion scripts for common shells",
    usage: "kam completions [OPTIONS] <SHELL>",
    description:
      "Generate shell completion scripts that help with tab-completion for `kam` commands on supported shells (bash, zsh, fish, powershell, elvish). If --out is omitted, the completion script is printed to STDOUT.",
    flags: [
      {
        flag: "-o, --out <OUT>",
        description: "Write completion script to file (else prints to stdout)",
      },
      {
        flag: "--install",
        description:
          "Install the completion script into the standard shell completion directory (may require root)",
      },
      { flag: "-h, --help", description: "Print help for completions" },
    ],
    examples: [
      "kam completions zsh --out ~/.zsh/completion/_kam",
      "kam completions zsh --install",
      "kam completions bash",
    ],
  },

  {
    name: "secret",
    summary: "Secret keyring management (used by sign/verify tasks)",
    usage: "kam secret <COMMAND> [OPTIONS] [ARGS]",
    description:
      "Manage secrets (keys) stored locally for signing and cryptographic operations. Subcommands include `list`, `add`, `get`, `remove`, `export`, `import`, `export-pub`, `import-cert`, and `trust` for working with keys, certs, and trusted Root CAs.",
    flags: [
      {
        flag: "-f, --file <FILE>",
        description: "Read secret data from a file (for add/import)",
      },
      {
        flag: "-v, --value <VALUE>",
        description:
          "Provide secret value directly on the command line (use with care)",
      },
      {
        flag: "-o, --out <OUT>",
        description:
          "Write output to a file instead of stdout (used by get/export-pub)",
      },
      {
        flag: "--encrypted",
        description: "Export secret as encrypted blob (for export)",
      },
      {
        flag: "--name <NAME>",
        description: "Name to use when importing certificates or secrets",
      },
      {
        flag: "-h, --help",
        description: "Print help for secret or subcommands",
      },
    ],
    examples: [
      "kam secret list",
      "kam secret add mykey --file ./private.pem",
      "kam secret get mykey --out ./key.pem",
      "kam secret export mykey ./mykey.pem --encrypted",
    ],
  },

  {
    name: "sign",
    summary: "Sign an artifact using a key from the keyring or a PEM file",
    usage: "kam sign [OPTIONS] [SRC]",
    description:
      "Creates a cryptographic signature for an artifact (e.g., the packaged ZIP) using a key from your secret keyring or a provided PEM/Key file. Can sign a single file or multiple artifacts in a dist directory.",
    flags: [
      {
        flag: "--secret <SECRET>",
        description:
          "Secret name in keyring with the private key (default: main)",
      },
      {
        flag: "--out <OUT>",
        description: "Output directory for signatures (default: dist)",
      },
      {
        flag: "--dist <DIR>",
        description: "Sign all artifacts in the given directory",
      },
      {
        flag: "--all",
        description: "Sign all artifacts inside dist (alias for --dist <dir>)",
      },
      {
        flag: "--cert <CERT>",
        description: "Include certificate PEM chain in signature metadata",
      },
      {
        flag: "--key-path <KEY_PATH>",
        description: "Use a private key PEM file instead of a keyring secret",
      },
      { flag: "-h, --help", description: "Print help for sign" },
    ],
    examples: [
      "kam sign module.zip",
      "kam sign --dist dist --out signed-dist",
      "kam sign --key-path ./private.pem module.zip",
    ],
  },

  {
    name: "verify",
    summary: "Verify an artifact signature (.sig) or a sigstore bundle (DSSE)",
    usage: "kam verify [OPTIONS] [SRC]",
    description:
      "Verify that an artifact’s signature is valid and matches a trusted identity or key. Supports .sig signatures and sigstore DSSE bundles and offers several options to specify verification materials.",
    flags: [
      {
        flag: "--sig <SIG>",
        description: "Path to a signature file (defaults to <src>.sig)",
      },
      {
        flag: "--bundle <BUNDLE>",
        description:
          "Path to a sigstore JSON bundle containing DSSE envelope and certs",
      },
      {
        flag: "--cert <CERT>",
        description: "Optional certificate PEM to use for verification",
      },
      {
        flag: "--root <ROOT>",
        description:
          "Trust anchor root CA PEM for verifying certificate chains",
      },
      {
        flag: "--secret <SECRET>",
        description:
          "Secret name to derive a public key for verification (default: main)",
      },
      {
        flag: "--key <KEY>",
        description: "Path to public key PEM to use for verification",
      },
      {
        flag: "--cert-name <CERT_NAME>",
        description: "Use a cached developer certificate by name",
      },
      {
        flag: "--cert-chain <CERT_CHAIN>",
        description: "Path to certificate chain PEM file",
      },
      {
        flag: "--skip-crl",
        description: "Skip CRL (certificate revocation list) checks",
      },
      { flag: "-v, --verbose", description: "Show verbose verification steps" },
      { flag: "-h, --help", description: "Print help for verify" },
    ],
    examples: [
      "kam verify module.zip --sig module.zip.sig",
      "kam verify module.zip --bundle module.sigstore.json",
      "kam verify module.zip --key ./pub.pem",
    ],
  },

  {
    name: "check",
    summary: "Check project JSON/YAML/Markdown files (lint/format/parse)",
    usage: "kam check [OPTIONS] [PATH]",
    description:
      "Static checking utilities for files in the project, including linting, formatting, and parsing validations. Useful in CI and local development.",
    flags: [
      { flag: "--json", description: "Output results as JSON" },
      {
        flag: "--fix",
        description: "Attempt to automatically fix/format files",
      },
      { flag: "-h, --help", description: "Print help for check" },
    ],
    examples: ["kam check", "kam check --fix", "kam check --json"],
  },

  {
    name: "export",
    summary:
      "Export `kam.toml` to `module.prop`, `module.json`, `repo.json`, `track.json`, `config.json`, or `update.json`",
    usage: "kam export [FORMAT] [OUTPUT]",
    description:
      "Export module metadata defined in kam.toml to one of the supported artifact formats. FORMAT values include: prop, json, repo, track, config, update. OUTPUT is optional and defaults to a sensible filename in the current directory.",
    flags: [{ flag: "-h, --help", description: "Print help for export" }],
    examples: ["kam export json module.json", "kam export prop"],
  },

  {
    name: "toml",
    summary:
      "Inspect and edit `kam.toml` using dot-path keys (get/set/unset/list)",
    usage: "kam toml [OPTIONS] <COMMAND> [ARGS]",
    description:
      "Utility to inspect and edit the kam.toml configuration file programmatically. Supports `get`, `set`, `unset`, `list` subcommands and accepts a `--file` option to operate on a specific file.",
    flags: [
      {
        flag: "--file <FILE>",
        description:
          "Operate on a specific kam.toml file instead of the project file",
      },
      {
        flag: "-h, --help",
        description: "Print help for toml or its subcommands",
      },
    ],
    examples: [
      "kam toml get prop.name",
      'kam toml set prop.name "Value"',
      "kam toml set prop.name=value",
      "kam toml list",
    ],
  },

  {
    name: "config",
    summary:
      "Manage per-project or global kam configuration (similar to git config)",
    usage: "kam config [OPTIONS] <COMMAND> [ARGS]",
    description:
      "Manage configuration values for Kam either per-project (local) or globally. Subcommands include `get`, `set`, `unset`, `list`, and `show`. Use `--global` to operate on the global config or `--local` to force the local file.",
    flags: [
      {
        flag: "--global",
        description: "Use the global configuration file (~/.kam/config.toml)",
      },
      {
        flag: "--local",
        description: "Force use of the local project configuration file",
      },
      {
        flag: "-h, --help",
        description: "Print help for config or its subcommands",
      },
    ],
    examples: [
      "kam config get default.author",
      'kam config set --global default.author "Alice"',
      "kam config show",
    ],
  },

  {
    name: "about",
    summary: "Display about information for Kam and credits",
    usage: "kam about",
    description:
      "Show information about Kam, project credits, and licensing details.",
  },

  {
    name: "help",
    summary: "Print this message or the help of the given subcommand(s)",
    usage: "kam help [COMMAND]",
    description:
      "Show help text for the general `kam` tool or for a specific subcommand. This is the canonical way to learn more about usage when working with the CLI.",
    examples: ["kam help build", "kam build --help"],
  },
];

/**
 * Helper: return all commands
 */
export function getAllCommands(): KamCommand[] {
  return [...KAM_COMMANDS];
}

/**
 * Helper: find command details by name (case-insensitive)
 */
export function getCommandByName(name: string): KamCommand | undefined {
  const key = (name || "").trim().toLowerCase();
  return KAM_COMMANDS.find((c) => c.name.toLowerCase() === key);
}

/**
 * Helper: search commands by name/summary/description (case-insensitive)
 */
export function searchCommands(query: string): KamCommand[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return getAllCommands();
  return KAM_COMMANDS.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  });
}

/**
 * Fallback helper to fetch command names (useful for suggestions)
 */
export function getCommandNames(): string[] {
  return KAM_COMMANDS.map((c) => c.name);
}

export default KAM_COMMANDS;
