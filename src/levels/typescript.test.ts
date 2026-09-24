import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '.'

// Todo el TypeScript que ve el jugador tiene que ser TypeScript válido (sintaxis; las dependencias
// externas como CardTerminal son de mentira, así que no se comprueban tipos).
const files = LEVELS.flatMap((l) => Object.entries(l.codeFiles.ts).map(([key, file]) => [`${l.id} · ${key}`, file.text] as const))

describe('el código TypeScript de cada nivel es sintácticamente válido', () => {
  it.each(files)('%s', (_name, text) => {
    const out = ts.transpileModule(text, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022 } })
    expect((out.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([])
  })

  it('cada nivel trae su versión en TypeScript', () => {
    expect(LEVELS.filter((l) => !Object.keys(l.codeFiles.ts).length).map((l) => l.id)).toEqual([])
  })
})
