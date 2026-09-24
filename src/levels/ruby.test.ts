import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '.'

// Todo el Ruby que ve el jugador tiene que ser Ruby válido. Si no hay ruby instalado, se omite.
const hasRuby = spawnSync('ruby', ['-v']).status === 0

describe.skipIf(!hasRuby)('el código Ruby de cada nivel es sintácticamente válido', () => {
  it.each(LEVELS.flatMap((l) => Object.entries(l.codeFiles).map(([key, file]) => [`${l.id} · ${key}`, file.text] as const)))('%s', (_name, text) => {
    // El comentario mágico fija UTF-8 aunque el entorno no tenga locale.
    const result = spawnSync('ruby', ['-wc'], { input: `# encoding: utf-8\n${text}`, encoding: 'utf8' })
    // Los bloques de wiring muestran cómo se arma el objeto; que la variable no se use después es intencional.
    const warnings = result.stderr.split('\n').filter((l) => l.trim() && !l.includes('assigned but unused variable'))
    expect(warnings).toEqual([])
    expect(result.status).toBe(0)
  })
})
