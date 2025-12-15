# kam CLI — Help reference

本文件由 `kam --help` 以及各子命令的帮助信息整理而成，供文档与 UI 数据源参考使用。
Keep this page as a snapshot of the CLI help text — when the CLI changes, re-run `kam --help` + `kam <command> --help` and update this file accordingly.

---

## Top-level help

```
kam — Kam is a CLI toolkit for scaffolding, building, packaging, and distributing Android modules and templates (ksu/APU/Magisk/AnyTemplate). It supports module initialization, packaging, template management, and repo metadata exports.

Usage: kam <COMMAND>

Commands:
  init         Initialize a new Kam project from templates (supports meta and kernel templates)
  build        Build and package a module into a deployable ZIP artifact
  version      Manage module versions and bump policies
  cache        Manage local template and artifact cache
  tmpl         Manage templates: import, export, package, and list
  validate     Validate `kam.toml` configuration and templates
  completions  Generate shell completion scripts for common shells
  secret       Secret keyring management (used by sign/verify tasks)
  sign         Sign an artifact using a key from the keyring or a PEM file
  verify       Verify an artifact signature (.sig) or a sigstore bundle (DSSE)
  check        Check project JSON/YAML/Markdown files (lint/format/parse)
  export       Export `kam.toml` to `module.prop`, `module.json`, `repo.json`, `track.json`, `config.json`, `update.json`
  toml         Inspect and edit `kam.toml` using dot-path keys (get/set/unset/list)
  config       Manage per-project or global kam configuration (similar to git config)
  about        Display about information for Kam and credits
  help         Print this message or the help of the given subcommand(s)

Options:
  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

---

## Subcommand help (selected)

### init
```
Initialize a new Kam project from templates (supports meta and kernel templates)

Usage: kam init [OPTIONS] [PATH]

Arguments:
  [PATH]

Options:
      --id <ID>
      --project-name <PROJECT_NAME>
      --version <VERSION>
      --author <AUTHOR>
      --update-json <UPDATE_JSON>
      --description <DESCRIPTION>
  -f, --force
  -i, --interactive
      --var <VAR>
  -t, --template <TEMPLATE>
      --tmpl
  -h, --help                         Print help
```

### build
```
Build and package a module into a deployable ZIP artifact

Usage: kam build [OPTIONS] [PATH]

Arguments:
  [PATH]  Path to the project (default: current directory) [default: .]

Options:
  -a, --all              Build all workspace members
  -o, --output <OUTPUT>  Output directory (default: dist)
  -b, --bump             Enable KAM_BUMP_ENABLED environment variable (set to 1)
  -r, --release          Enable KAM_RELEASE_ENABLED environment variable (set to 1)
  -s, --sign             Enable KAM_SIGN_ENABLE environment variable (set to 1)
  -i, --interactive      Run build interactively; ask for confirmation when performing potentially destructive actions
  -P, --pre-release      Enable KAM_PRE_RELEASE environment variable (set to 1)
  -q, --quiet            Suppress most output; show only warnings and errors
  -j, --jobs <JOBS>      Number of parallel jobs (default: number of CPU cores)
  -h, --help             Print help
```

### version
```
Manage module versions and bump policies

Usage: kam version [VERSION]

Arguments:
  [VERSION]

Options:
  -h, --help  Print help
```

### cache (top-level)
```
Manage local template and artifact cache

Usage: kam cache <COMMAND>

Commands:
  list    List cached templates
  clean   Clean all cached templates
  add     Add a template to cache from a local directory or archive
  remove  Remove a template from cache
  path    Show cache directory path
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

- cache/list:
```
List cached templates

Usage: kam cache list

Options:
  -h, --help  Print help
```

- cache/clean:
```
Clean all cached templates

Usage: kam cache clean

Options:
  -h, --help  Print help
```

- cache/add:
```
Add a template to cache from a local directory or archive

Usage: kam cache add <NAME> <PATH>

Arguments:
  <NAME>  Name of the template to register
  <PATH>  Path to the template source (directory or archive)

Options:
  -h, --help  Print help
```

- cache/remove:
```
Remove a template from cache

Usage: kam cache remove <NAME>

Arguments:
  <NAME>  Name of the template to remove

Options:
  -h, --help  Print help
```

- cache/path:
```
Show cache directory path

Usage: kam cache path

Options:
  -h, --help  Print help
```

### tmpl (top-level)
```
Manage templates: import, export, package, and list

Usage: kam tmpl <COMMAND>

Commands:
  list    List all available templates
  import  Import template(s) from file
  export  Export template(s) to file
  remove  Remove a template from cache
  path    Show template cache directory path
  pull    Download templates from a URL and import them
  update  Re-download based on recorded URL in config and import
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

- tmpl/list:
```
List all available templates

Usage: kam tmpl list

Options:
  -h, --help  Print help
```

- tmpl/import:
```
Import template(s) from file

Usage: kam tmpl import [OPTIONS] <PATH>

Arguments:
  <PATH>  Path to template archive (.tar.gz for single template, .zip for multiple templates)

Options:
  -n, --name <NAME>  Template name (optional, will use filename if not provided)
  -f, --force        Force overwrite if template already exists
  -h, --help         Print help
```

- tmpl/export:
```
Export template(s) to file

Usage: kam tmpl export [OPTIONS] --output <OUTPUT> [TEMPLATES]...

Arguments:
  [TEMPLATES]...  Template name(s) to export (can specify multiple)

Options:
  -o, --output <OUTPUT>  Output file path (.tar.gz for single template, .zip for multiple templates)
  -f, --force            Force overwrite if output file already exists
  -h, --help             Print help
```

- tmpl/pull:
```
Download templates from a URL and import them

Usage: kam tmpl pull [OPTIONS] [URL]

Arguments:
  [URL]  Download URL (defaults to GitHub latest release templates ZIP)

Options:
      --global  The `--global` flag is accepted for CLI consistency but has no effect
  -h, --help    Print help
```

- tmpl/update:
```
Re-download based on recorded URL in config and import

Usage: kam tmpl update [OPTIONS]

Options:
      --global  The `--global` flag is accepted for CLI consistency but has no effect
  -h, --help    Print help
```

### validate
```
Validate `kam.toml` configuration and templates

Usage: kam validate [PATH]

Arguments:
  [PATH]  Path to the project directory (default: current directory) [default: .]

Options:
  -h, --help  Print help
```

### completions
```
Generate shell completion scripts for common shells

Usage: kam completions [OPTIONS] <SHELL>

Arguments:
  <SHELL>  Shell type for completion (bash,zsh,fish,powershell,elvish) [possible values: bash, zsh, fish, power-shell, elvish]

Options:
  -o, --out <OUT>  Output file. If omitted, prints to STDOUT
  -h, --help       Print help
```

### secret (top-level)
```
Secret keyring management (used by sign/verify tasks)

Usage: kam secret <COMMAND>

Commands:
  list         List saved secrets
  add          Add a secret from a value or file
  get          Get a secret and print it to stdout (or --out file)
  remove       Remove a secret
  export       Export secret to a file (by default decrypted). Use --encrypted to export encrypted blob
  import       Import secret from a file. If file is an encrypted KAM blob, it will be stored as-is
  export-pub   Export public key from a stored private key secret
  import-cert  Import developer certificate chain from GitHub issue or file
  trust        Manage trusted Root CAs
  help         Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

- secret/add:
```
Add a secret from a value or file

Usage: kam secret add [OPTIONS] <NAME> [FILE]

Arguments:
  <NAME>  Name of the secret
  [FILE]  Also accept path as a second positional parameter so users can run `kam secret add name path`

Options:
  -f, --file <FILE>          Path to a file to read the secret from
  -v, --value <VALUE>        Provide value directly
      --force-file           Force storing to local file instead of system keyring
      --password <PASSWORD>  Pass the password on the CLI (not recommended); password will be prompted if not set
      --with-backup          Also create a local fallback file under ~/.kam/secrets
  -h, --help                 Print help
```

- secret/get:
```
Get a secret and print it to stdout (or --out file)

Usage: kam secret get [OPTIONS] <NAME>

Arguments:
  <NAME>  Name of the secret

Options:
  -o, --out <OUT>            Write to file instead of stdout
      --password <PASSWORD>  Pass the password on the CLI (not recommended). If not provided, will ask interactively
  -h, --help                 Print help
```

- secret/export:
```
Export secret to a file (by default decrypted). Use --encrypted to export encrypted blob

Usage: kam secret export [OPTIONS] <NAME> <PATH>

Arguments:
  <NAME>
  <PATH>

Options:
      --encrypted
  -h, --help       Print help
```

- secret/export-pub:
```
Export public key from a stored private key secret

Usage: kam secret export-pub [OPTIONS] [NAME]

Arguments:
  [NAME]  Name of the secret [default: main]

Options:
  -o, --out <OUT>  Output file path (if omitted, prints to stdout)
  -h, --help       Print help
```

- secret/import-cert:
```
Import developer certificate chain from GitHub issue or file

Usage: kam secret import-cert [OPTIONS] <NAME>

Arguments:
  <NAME>  Name to store certificate under

Options:
      --repo <REPO>              GitHub repository (format: owner/repo, e.g., "kernelsu/developers")
      --issue <ISSUE>            GitHub issue number containing the certificate
      --cert-chain <CERT_CHAIN>  Path to certificate chain PEM file
  -h, --help                     Print help
```

- secret/trust:
```
Manage trusted Root CAs

Usage: kam secret trust [OPTIONS]

Options:
      --add-root <ADD_ROOT>  Add Root CA from file or URL
      --ca-name <CA_NAME>    Name for the Root CA
      --list                 List trusted Root CAs
      --remove <REMOVE>      Remove Root CA by name
  -h, --help                 Print help
```

### sign
```
Sign an artifact using a key from the keyring or a PEM file

Usage: kam sign [OPTIONS] [SRC]

Arguments:
  [SRC]  The artifact to sign (zip). If omitted, use --dist or --all to sign multiple files

Options:
      --secret <SECRET>      Name of the secret in kam keyring that holds the private key [default: main]
      --out <OUT>            Output directory (default: dist) [default: dist]
      --dist <DIR>           Sign all artifacts in given directory (instead of specifying single src file)
      --all                  Sign all artifacts inside dist (alias of --dist <dir> with default dist)
      --cert <CERT>          Certificate PEM chain path to include in signature metadata
      --key-path <KEY_PATH>  Optional path to a private key PEM file to use instead of the keyring secret
  -h, --help                 Print help
```

### verify
```
Verify an artifact signature (.sig) or a sigstore bundle (DSSE)

Usage: kam verify [OPTIONS] [SRC]

Arguments:
  [SRC]  Path to the artifact to verify (required for .sig verification)

Options:
      --sig <SIG>                Path to signature file (base64 .sig). If omitted, defaults to <src>.sig
      --bundle <BUNDLE>          Path to .sigstore.json bundle containing DSSE envelope and certs
      --cert <CERT>              Optional certificate PEM to use for verification (overrides bundle cert)
      --root <ROOT>              Optional root CA PEM to verify a certificate chain (trusted anchor)
      --secret <SECRET>          Name of secret in kam keyring that holds the private key; used to derive public key for verification [default: main]
      --key <KEY>                Path to public key PEM for verification (overrides derived key from secret)
      --cert-name <CERT_NAME>    Name of cached developer certificate to use for verification
      --cert-chain <CERT_CHAIN>  Path to certificate chain PEM file for verification
      --skip-crl                 Skip CRL (Certificate Revocation List) check
  -v, --verbose                  Verbose output showing verification steps
  -h, --help                     Print help
```

### check
```
Check project JSON/YAML/Markdown files (lint/format/parse)

Usage: kam check [OPTIONS] [PATH]

Arguments:
  [PATH]  Path to the project directory (default: current directory) [default: .]

Options:
      --json  Output results as JSON
      --fix   Try to automatically fix/format files
  -h, --help  Print help
```

### export
```
Export `kam.toml` to `module.prop`, `module.json`, `repo.json`, `track.json`, `config.json`, `update.json`

Usage: kam export [FORMAT] [OUTPUT]

Arguments:
  [FORMAT]  Export format: prop, json, update, repo, track, config [possible values: prop, json, repo, track, config, update]
  [OUTPUT]  Output file path (default: write to a format-specific filename in the current directory)

Options:
  -h, --help  Print help
```

### toml
```
Inspect and edit `kam.toml` using dot-path keys (get/set/unset/list)

Usage: kam toml [OPTIONS] <COMMAND>

Commands:
  get    Get a value by dot-separated key path
  set    Set a value by key (usage: kam toml set prop.name=value | kam toml set prop.name value)
  unset  Unset/remove a key
  list   Dump the full toml
  help   Print this message or the help of the given subcommand(s)

Options:
      --file <FILE>  Operate on the project's kam.toml (default), or specify file using --file
  -h, --help         Print help
```

### config
```
Manage per-project or global kam configuration (similar to git config)

Usage: kam config [OPTIONS] <COMMAND>

Commands:
  get    Get a configuration value by key (dot-separated path)
  set    Set a configuration value by key
  unset  Unset (remove) a configuration value by key
  list   List all config values in the target file
  show   Show built-in configuration keys and their descriptions
  help   Print this message or the help of the given subcommand(s)

Options:
      --global  Use the global configuration file (~/.kam/config.toml)
      --local   Force use of the local configuration file (project `.kam/config.toml`)
  -h, --help    Print help
```

### about
```
Display about information for Kam and credits

Usage: kam about

Options:
  -h, --help  Print help
```

---

## Notes & actions

- The canonical command metadata used by the UI lives in `src/data/kam.ts`. After changing the CLI or collecting new help output, sync `KAM_COMMANDS` (usage, flags, examples, descriptions) to keep the web UI accurate.
- To regenerate this file manually:
  - Run `kam --help` and capture the output.
  - For each command you care about, run `kam <command> --help` and append the results.
  - Update `src/data/kam.ts` to reflect any new/changed flags or usage patterns.
- If you'd like, I can:
  - Add a small script to dump all `kam` help output automatically into this file,
  - Or wire a CI job to validate that `src/data/kam.ts` is in sync with the `kam` binary.

If you want, I can now:
1) Add this file to the repository (create `KamWEBUI/docs/cli-help.md`), and/or
2) Update the localized strings (`src/main.ts` / the i18n JSON) with translated summaries for newly documented flags and examples, and/or
3) Generate a simple script that exports the `kam` help text (raw) into `KamWEBUI/docs/cli-help.md` automatically, and/or
4) Export the CLI's `cli.*` i18n into WebUI JSON so the frontend and CLI share a single source-of-truth.

We already added a small exporter and skeleton helper you can use locally:

- Export CLI i18n into the WebUI data (writes `Kam/KamWEBUI/src/data/cli/en.json` and `.../zh.json`):
```bash
python3 Kam/scripts/export_cli_i18n.py
```

- Scan CLI definitions for missing i18n keys and optionally write skeleton TOML files for translators:
```bash
python3 Kam/scripts/generate_cli_i18n_skeleton.py --write
```

Note: CI includes an i18n check that:
- runs the exporter and ensures the generated JSON files are committed, and
- verifies that `kam --help` output is localized for `en` and `zh` for a few representative commands (e.g., `build`, `tmpl import`) to catch regressions early.

告诉我你的首选下一步（把它加入仓库 / 更新本地化 / 生成导出脚本 / 生成翻译骨架等）。
