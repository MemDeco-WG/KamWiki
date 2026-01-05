# 开发工作流（Workflow）

Kam 定义了一个从本地开发到真机测试的完整工作流。

## 1. Host 端：kam CLI

Host 端（你的开发机）是 `kam` CLI 的主要运行环境。它负责：

- **项目脚手架**：`kam init`
- **构建与打包**：`kam build`
- **本地仿真与测试**：`kam sim`
- **模板管理**：`kam tmpl`
- **配置与元数据**：`kam toml`, `kam config`, `kam export`

## 2. 模块端：kamfw 启动流程

模块被安装到设备后，其生命周期由 `kamfw` 框架管理。

### 核心启动源：`.kamfwrc`

`kamfw` 的核心是 `lib/kamfw/.kamfwrc` 文件。它是所有模块脚本的**单一事实来源**，提供：

- **基础环境变量**
- **统一的输出函数** (`print`, `ui_print`)
- **统一的错误处理函数** (`abort`)
- **工具加载库** (`import`)

### 启动顺序（强制）

所有模块的入口脚本（如 `customize.sh`, `service.sh`）都必须遵循严格的启动顺序：

1.  确定模块根目录 `MODDIR`。
2.  **立即 `source` `.kamfwrc` 文件**，加载基础环境。
3.  调用 `import` 加载其他功能库（如 `logging.sh`, `magisk.sh` 等）。
4.  执行业务逻辑。

> 这种设计确保了所有脚本都运行在同一个“语境”下，避免了重复造轮子和行为不一致的问题。
