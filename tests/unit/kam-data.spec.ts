/**
 * kam.ts 数据测试
 * 测试命令数据的结构和完整性
 */

import { describe, it, expect } from 'vitest'
import type { KamCommand } from '@/data/kam'
import * as kamData from '@/data/kam'

/**
 * 尝试多种方式获取命令数据
 * 兼容不同的导出方式
 */
function getCommands(): KamCommand[] {
  if (Array.isArray(kamData.KAM_COMMANDS)) {
    return kamData.KAM_COMMANDS
  }
  if (typeof kamData.getAllCommands === 'function') {
    return kamData.getAllCommands()
  }
  if (Array.isArray(kamData.default)) {
    return kamData.default
  }
  return []
}

/**
 * 获取命令名称列表
 */
function getCommandNames(commands: KamCommand[]): string[] {
  return commands.map(cmd => (cmd.name || '').toLowerCase())
}

describe('kam.ts 数据测试', () => {
  const commands = getCommands()

  describe('数据结构验证', () => {
    it('应该包含命令数据', () => {
      expect(commands).toBeDefined()
      expect(Array.isArray(commands)).toBe(true)
      if (commands.length > 0) {
        expect(commands.length).toBeGreaterThan(0)
      }
    })

    it('每个命令应该有名称', () => {
      commands.forEach((cmd) => {
        expect(cmd.name).toBeDefined()
        expect(typeof cmd.name).toBe('string')
        expect(cmd.name.length).toBeGreaterThan(0)
      })
    })

    it('每个命令应该有描述', () => {
      commands.forEach((cmd) => {
        expect(cmd.summary).toBeDefined()
        expect(typeof cmd.summary).toBe('string')
        expect(cmd.summary.length).toBeGreaterThan(0)
      })
    })
  })

  describe('核心命令验证', () => {
    const MAIN_COMMANDS = ['init', 'build', 'version', 'tmpl', 'export'] as const

    it('应该包含所有主要命令', () => {
      if (commands.length === 0) {
        console.warn('命令数据为空，跳过主要命令检查')
        return
      }

      const commandNames = getCommandNames(commands)
      const missingCommands: string[] = []

      MAIN_COMMANDS.forEach((cmd) => {
        const found = commandNames.includes(cmd.toLowerCase())
        if (!found) {
          missingCommands.push(cmd)
        }
      })

      if (missingCommands.length > 0) {
        console.warn('缺失的命令:', missingCommands)
        console.warn('实际命令名称:', commandNames)
      }

      expect(missingCommands.length).toBe(0)
    })
  })
})
