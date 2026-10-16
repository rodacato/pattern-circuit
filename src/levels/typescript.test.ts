import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '.'

// All the TypeScript the player sees has to be valid TypeScript (syntax; external dependencies
// such as CardTerminal are fakes, so types are not checked).
const files = LEVELS.flatMap((l) => Object.entries(l.codeFiles.ts).map(([key, file]) => [`${l.id} · ${key}`, file.text] as const))

describe('the TypeScript code of each level is syntactically valid', () => {
  it.each(files)('%s', (_name, text) => {
    const out = ts.transpileModule(text, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022 } })
    expect((out.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([])
  })

  it('every level ships its TypeScript version', () => {
    expect(LEVELS.filter((l) => !Object.keys(l.codeFiles.ts).length).map((l) => l.id)).toEqual([])
  })
})
