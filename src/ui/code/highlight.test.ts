import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../../course/theme'
import { highlight } from './highlight'

const PANEL = readFileSync('src/ui/game.css', 'utf8').match(/--panel:\s*(#[0-9a-f]{6})/i)![1]

describe('code highlighting', () => {
  it.each([
    ['rb', '# vouchers? Nobody planned for them'],
    ['ts', '// vouchers? Nobody planned for them'],
    ['py', '# vouchers? Nobody planned for them'],
  ] as const)('a %s comment reads at AA contrast on the dark panel', async (lang, comment) => {
    const [[token]] = await highlight(comment, lang, 'dark')
    expect(contrastRatio(token.color!, PANEL)).toBeGreaterThanOrEqual(4.5)
  })
})
