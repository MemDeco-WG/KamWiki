/**
 * Command 组件单元测试
 * 测试命令详情页的渲染和功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Command from '@/pages/Command.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'

// 创建测试用的路由实例
const router: Router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/pages/Home.vue') },
    { path: '/command/:name', component: Command }
  ]
})

/**
 * 创建 Command 组件的测试包装器
 */
function createCommandWrapper(commandName: string = 'init'): VueWrapper {
  return mount(Command, {
    global: {
      plugins: [router]
    },
    props: {
      commandName
    }
  })
}

describe('Command.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = createCommandWrapper()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.isVisible()).toBe(true)
    })

    it('应该显示命令名称', () => {
      const wrapper = createCommandWrapper('init')
      const commandName = wrapper.find('[data-testid="command-name"]')
      expect(commandName.exists()).toBe(true)
    })

    it('应该显示命令描述', () => {
      const wrapper = createCommandWrapper('init')
      const commandDesc = wrapper.find('[data-testid="command-description"]')
      expect(commandDesc.exists()).toBe(true)
    })

    it('应该显示命令用法示例', () => {
      const wrapper = createCommandWrapper('init')
      const usage = wrapper.find('[data-testid="command-usage"]')
      expect(usage.exists()).toBe(true)
    })
  })

  describe('不同命令的渲染', () => {
    const testCommands = ['init', 'build', 'version']

    testCommands.forEach((cmd) => {
      it(`应该正确渲染 ${cmd} 命令`, () => {
        const wrapper = createCommandWrapper(cmd)
        expect(wrapper.exists()).toBe(true)
      })
    })
  })
})
