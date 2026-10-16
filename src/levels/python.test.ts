import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '.'

// All the Python the player sees has to be valid Python (warnings count as errors). If python is not installed, it is skipped.
const hasPython = spawnSync('python3', ['-V']).status === 0

describe.skipIf(!hasPython)('the Python code of each level is syntactically valid', () => {
  it.each(LEVELS.flatMap((l) => Object.entries(l.codeFiles.py).map(([key, file]) => [`${l.id} · ${key}`, file.text] as const)))('%s', (_name, text) => {
    const result = spawnSync('python3', ['-I', '-W', 'error', '-c', 'import sys; compile(sys.stdin.read(), "snippet", "exec")'], { input: text, encoding: 'utf8' })
    expect(result.stderr.trim()).toBe('')
    expect(result.status).toBe(0)
  })
})

describe('Python in the levels', () => {
  it('every level ships its Python version', () => {
    expect(LEVELS.filter((l) => !Object.keys(l.codeFiles.py).length).map((l) => l.id)).toEqual([])
  })
})
