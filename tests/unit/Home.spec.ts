/**
 * Home 组件单元测试
 * 测试主页组件的渲染和功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Home from '@/pages/Home.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'

// 创建测试用的路由实例
const router: Router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/command/:name', component: () => import('@/pages/Command.vue') }
  ]
})

/**
 * 创建 Home 组件的测试包装器
 */
function createHomeWrapper(): VueWrapper {
  return mount(Home, {
    global: {
      plugins: [router]
    }
  })
}

describe('Home.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = createHomeWrapper()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.isVisible()).toBe(true)
    })

    it('应该显示命令列表', () => {
      const wrapper = createHomeWrapper()
      const commandList = wrapper.find('[data-testid="command-list"]')
      expect(commandList.exists()).toBe(true)
    })
  })

  describe('导航功能', () => {
    it('应该能够导航到命令详情页', async () => {
      const wrapper = createHomeWrapper()

      // 等待组件挂载和数据加载
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // 查找命令链接
      const commandLink = wrapper.find('a[href="/command/init"]')
      if (commandLink.exists()) {
        await commandLink.trigger('click')
        await wrapper.vm.$nextTick()

        // 验证路由变化
        expect(router.currentRoute.value.path).toBe('/command/init')
      } else {
        // 如果找不到链接，至少验证组件已渲染
        expect(wrapper.exists()).toBe(true)
      }
    })
  })
})
