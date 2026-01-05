# 已知问题（Known Issues）

本页记录当前版本中已知的主要问题，特别是 P0/P1 级别的红线问题。在这些问题被修复之前，请参考此处提供的状态和临时规避方式。

## 1. `kam init . --tmpl` 渲染崩溃（P0 Gate）

- **问题描述**

  在主项目仓库根目录执行 `kam init . --tmpl --force` 命令会失败，导致进程中止。该命令用于从模板创建一个新的模板项目，是项目工程质量的 P0 级门槛（gate）。

- **已观测到的报错**

  ```text
  ✗ Template render error: Failed to render template '/tmp/.../extracted/README.md': Failed to parse '__tera_one_off' (template_id: tmpl_template)
  ```

  初步判断问题与 `tera` 模板引擎在渲染某些文件（特别是 `.github/workflows/*.yml` 或 `README.md`）时发生解析错误有关。

- **状态与影响**

  - **状态**：**修复进行中**
  - **影响**：
    - 开发者无法使用 `kam init --tmpl` 来创建新的模板项目。
    - 任何依赖此命令的 CI/CD 流程会失败。
    - 这是 `AGENTS.md` 中定义的 **P0 gate**，在修复前，所有交付都必须明确标注此项失败。

- **临时规避方式**

  目前没有直接的命令行规避方式。如果需要创建新模板，建议手动复制并修改一个现有模板（如 `tmpl/kam_template`）。
