import { describe, expect, it } from 'vitest'

import { CHAT_TOOLSETS, chatCreateParams, composeChatToWorkSeed, workCreateParams } from './chat-work-mode'

describe('chat-work-mode', () => {
  it('defaults to an empty Chat toolset set', () => {
    expect(CHAT_TOOLSETS).toEqual([])
  })

  it('chatCreateParams forces empty toolsets by default', () => {
    expect(chatCreateParams({ source: 'desktop' })).toEqual({ source: 'desktop', toolsets: [] })
  })

  it('chatCreateParams honours an explicit toolset set', () => {
    expect(chatCreateParams({ source: 'x' }, ['web', 'skills']).toolsets).toEqual(['web', 'skills'])
  })

  it('workCreateParams omits toolsets so the profile default applies', () => {
    const p = workCreateParams({ source: 'desktop', toolsets: ['web'] })
    expect(p).toEqual({ source: 'desktop' })
    expect('toolsets' in p).toBe(false)
  })

  it('composeChatToWorkSeed references the source id, excerpt and links', () => {
    const seed = composeChatToWorkSeed('local-abc', [
      { role: 'user', content: 'plan the VPS https://example.com/x' },
      { role: 'assistant', content: 'ok' }
    ])

    expect(seed).toContain('Continuing from Chat session `local-abc`')
    expect(seed).toContain('- user: plan the VPS')
    expect(seed).toContain('- https://example.com/x')
  })

  it('bounds the excerpt by message count and characters', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ role: 'user', content: `m${i} `.repeat(200) }))
    const seed = composeChatToWorkSeed('s', many, { maxMessages: 2, maxChars: 10 })
    expect(seed).toContain('- user: m8 ')
    expect(seed).not.toContain('- user: m0 ')
    const excerptLines = seed.split('\n').filter(l => l.startsWith('- user:'))
    expect(excerptLines).toHaveLength(2)
    expect(excerptLines.every(l => l.length <= '- user: '.length + 10)).toBe(true)
  })
})
