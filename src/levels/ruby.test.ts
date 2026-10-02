import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '.'

// All the Ruby the player sees has to be valid Ruby. If ruby is not installed, it is skipped.
const hasRuby = spawnSync('ruby', ['-v']).status === 0

describe.skipIf(!hasRuby)('the Ruby code of each level is syntactically valid', () => {
  it.each(LEVELS.flatMap((l) => Object.entries(l.codeFiles.rb).map(([key, file]) => [`${l.id} · ${key}`, file.text] as const)))('%s', (_name, text) => {
    // The magic comment pins UTF-8 even if the environment has no locale.
    const result = spawnSync('ruby', ['-wc'], { input: `# encoding: utf-8\n${text}`, encoding: 'utf8' })
    // Wiring blocks show how the object is assembled; the variable going unused afterwards is intentional.
    const warnings = result.stderr.split('\n').filter((l) => l.trim() && !l.includes('assigned but unused variable'))
    expect(warnings).toEqual([])
    expect(result.status).toBe(0)
  })
})
