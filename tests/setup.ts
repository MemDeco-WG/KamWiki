/**
 * 测试设置文件
 * 配置测试环境和全局设置
 */

import { vi, beforeEach } from 'vitest'
import { config } from '@vue/test-utils'

// ============================================================================
// 全局测试配置
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// Vue Test Utils 全局配置
// ============================================================================

config.global.stubs = {
  'router-link': true,
  'router-view': true
}

// ============================================================================
// 浏览器 API Mock
// ============================================================================

/**
 * Mock window.matchMedia
 * 用于响应式设计和媒体查询测试
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

/**
 * Mock IntersectionObserver
 * 用于元素可见性和滚动测试
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any
