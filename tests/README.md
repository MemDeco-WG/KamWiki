# KamWEBUI 测试文档

本目录包含 Kam WebUI 前端项目的所有测试文件。

## 📁 目录结构

```
tests/
├── README.md              # 本文件
├── setup.ts              # 测试环境设置和全局配置
├── unit/                 # 单元测试
│   ├── Home.spec.ts     # Home 组件测试
│   ├── Command.spec.ts  # Command 组件测试
│   └── kam-data.spec.ts # 数据结构和完整性测试
└── integration/          # 集成测试（待添加）
```

## 🚀 快速开始

### 安装依赖

```bash
cd KamWEBUI
npm install
# 或使用 Bun（推荐，速度更快）
bun install
```

### 运行测试

```bash
# 运行所有测试（监听模式）
npm test

# 运行所有测试（单次执行，适合 CI）
npm run test:run

# 运行测试 UI（可视化界面）
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

### 运行特定测试

```bash
# 运行单个测试文件
npm test -- tests/unit/kam-data.spec.ts

# 运行匹配特定名称的测试
npm test -- -t "应该包含命令数据"
```

## 📝 测试类型

### 单元测试

#### Home.spec.ts
测试主页组件的渲染和导航功能：
- ✅ 组件正确渲染
- ✅ 命令列表显示
- ✅ 路由导航功能

#### Command.spec.ts
测试命令详情页的渲染和显示：
- ✅ 组件正确渲染
- ✅ 命令名称显示
- ✅ 命令描述显示
- ✅ 用法示例显示
- ✅ 支持不同命令的渲染

#### kam-data.spec.ts
测试命令数据的结构和完整性：
- ✅ 数据结构验证
- ✅ 命令名称和描述完整性
- ✅ 核心命令存在性验证

### 集成测试

集成测试将在 `tests/integration/` 目录下添加，用于测试多个组件协同工作。

## ✍️ 编写新测试

### 步骤

1. 在 `tests/unit/` 或 `tests/integration/` 目录下创建新的测试文件
2. 使用 Vitest 的 `describe` 和 `it` 组织测试
3. 使用 `@vue/test-utils` 的 `mount` 函数挂载 Vue 组件
4. 使用 `expect` 进行断言

### 示例

```typescript
import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  describe('组件渲染', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(MyComponent)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.isVisible()).toBe(true)
    })
  })
})
```

### 测试组织建议

- 使用 `describe` 块组织相关测试
- 为每个测试用例编写清晰的描述
- 提取重复的测试设置代码到辅助函数
- 使用类型注解提高代码可读性

## ⚙️ 测试配置

测试配置在 `vitest.config.ts` 中：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 环境 | `jsdom` | 模拟浏览器环境 |
| 全局设置 | `tests/setup.ts` | 测试前的全局配置 |
| 路径别名 | `@` → `src/` | 简化导入路径 |
| 覆盖率 | `v8` | 使用 V8 覆盖率提供者 |

## 💡 测试最佳实践

### 1. 组件测试
- ✅ 测试组件的输入、输出和用户交互
- ✅ 验证组件在不同 props 下的行为
- ✅ 测试组件的生命周期钩子

### 2. 数据测试
- ✅ 验证数据结构的正确性
- ✅ 检查必需字段的存在
- ✅ 验证数据类型和格式

### 3. 路由测试
- ✅ 测试路由导航和参数传递
- ✅ 验证路由守卫和导航守卫
- ✅ 测试动态路由匹配

### 4. 异步测试
- ✅ 使用 `await` 和 `nextTick` 处理异步操作
- ✅ 使用 `waitFor` 等待异步更新
- ✅ 正确处理 Promise 和 async/await

### 5. Mock 和 Stub
- ✅ 使用 `vi.fn()` 创建函数 mock
- ✅ 使用 `vi.mock()` 模拟模块
- ✅ 使用 `vi.spyOn()` 监听函数调用

## 依赖

测试使用以下依赖（在 `package.json` 的 `devDependencies` 中）：

- **vitest**: 测试框架
- **@vue/test-utils**: Vue 组件测试工具
- **jsdom**: DOM 环境模拟
- **@vitest/ui**: 测试 UI 界面
- **@vitest/coverage-v8**: 代码覆盖率工具

## 持续集成

测试会在 CI/CD 流程中自动运行。确保所有测试通过后再提交代码。

## 故障排除

### 测试无法找到模块

确保 `vitest.config.ts` 中的路径别名配置正确。

### 组件渲染失败

检查组件是否正确导入，以及是否需要提供必要的 props 或 slots。

### 路由测试失败

确保在测试中正确设置和使用了 Vue Router。
