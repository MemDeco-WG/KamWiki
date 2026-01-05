# 快速上手（Quick Start）

本页内容与主仓库 `README.zh-CN.md` 的「快速上手」章节保持一致（以主仓库为准）。

## 1. 安装 kam CLI

Kam 使用 Rust 构建，推荐通过 Cargo 进行安装：

```bash
cargo install kam
```

安装完成后，通过以下命令验证是否成功：

```bash
kam --version
kam --help
```

## 2. 创建你的第一个模块

使用 `kam init` 命令创建一个名为 `hello-world` 的新模块项目：

```bash
kam init hello-world -t kam_template
cd hello-world
```

## 3. 运行本地仿真

Kam 提供本地仿真功能，允许你在无需真实设备或模拟器的情况下测试模块的核心逻辑。

```bash
# 在项目根目录下运行
kam sim run service
```

> 说明：若 `kam sim` 在你的版本中不可用，请以 `kam --help` 的实际输出为准，并在 Issues 中反馈。

## 下一步

- 阅读：`docs/workflow.zh-CN.md`（开发工作流）
- 阅读：`docs/quality-gates.zh-CN.md`（质量门槛）
- 阅读：`docs/known-issues.zh-CN.md`（已知问题）
