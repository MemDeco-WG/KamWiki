# 质量门槛（Quality Gates）

Kam 项目遵循严格的质量门槛，以确保代码的健壮性、可维护性和一致性。所有贡献（无论是来自 Agent 还是社区 PR）都必须通过这些门槛的审计。

## 权威规范来源

完整的质量门槛定义、P0/P1/P2 问题级别以及处理流程，请参考主仓库中的权威规范文档：

- **[SPEC: Quality Gates v1](/.collab/specs/SPEC__quality-gates__v1.md)**
- **[DEC: 编码哲学与强制工程规范](/.collab/decisions/DEC__coding-philosophy__20251231-1400.md)**

> 注意：当 Wiki 内容与上述规范文档冲突时，以规范文档为准。

## 必跑 Gate（Rust：fmt / clippy）

在提交 PR/合并变更前，至少跑完：

```bash
cargo fmt --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
```

- 以上命令必须通过（将 warning 视为 error）。
- 若 `clippy` 未通过，按质量门槛视为 **P0 阻塞**。
- **禁止通过 `#[allow(clippy::...)]` 作弊**来压制告警；必须修正根因并让 `-D warnings` 全绿。

## P0 红线摘要（触发即拒收）

以下是部分核心 P0 红线的摘要，用于快速自检：

1.  **禁止隐式回退 / 静默失败 (Anti-Fallback Mandate)**
    - 代码在遇到错误时必须明确失败（`exit != 0`），禁止返回“看起来正确”的默认值或吞掉错误继续执行。

2.  **禁止重复造轮子 (Anti-Duplication)**
    - 同一类基础逻辑（如输出、错误处理、环境检查）必须抽象为单一函数并复用，禁止在多处复制粘贴实现。

3.  **统一输出契约**
    - 所有面向用户的输出都必须通过 `.kamfwrc` 提供的 `print`/`ui_print` 函数，禁止直接使用 `echo`。

## 审计与验收

- **Q01 (代码质量检察员)** 负责审计所有提交，并可就 P0 问题越权直报。
- **Lead** 根据 Q01 的报告和必跑验证结果进行最终裁决。
