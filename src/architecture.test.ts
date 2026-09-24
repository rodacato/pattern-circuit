// Reglas de dependencia entre capas. Si un test de aquí falla, la solución casi nunca es relajar la regla.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

type Layer = 'engine' | 'levels' | 'game' | 'render' | 'ui' | 'debug' | 'root'

const RULES: Record<Layer, { layers: Layer[]; packages: string[] }> = {
  engine: { layers: [], packages: ['zod'] },
  levels: { layers: ['engine'], packages: [] },
  game: { layers: ['engine'], packages: ['zod'] },
  render: { layers: ['engine', 'game'], packages: ['pixi.js'] },
  ui: { layers: ['engine', 'game', 'render', 'levels'], packages: ['react', 'react-dom', 'shiki'] },
  debug: { layers: ['engine', 'levels'], packages: ['react'] },
  root: { layers: ['ui', 'debug'], packages: ['react', 'react-dom'] },
}

// Los tests pueden además cargar niveles reales y usar vitest/node.
const TEST_EXTRA = { layers: ['levels'] as Layer[], packages: ['vitest', 'node:fs', 'node:path'] }

const SRC = resolve(import.meta.dirname)
const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.(ts|tsx)$/.test(f))
  .map((f) => join(SRC, f))

const layerOf = (file: string): Layer => {
  const first = relative(SRC, file).split(/[\\/]/)[0]
  return (first in RULES ? first : 'root') as Layer
}

const importsOf = (file: string) =>
  [...readFileSync(file, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|^import\s+['"]([^'"]+)['"]/gm)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  )

const packageOf = (spec: string) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])

describe('arquitectura', () => {
  it.each(files.map((f) => [relative(SRC, f), f]))('%s respeta sus dependencias', (_name, file) => {
    const layer = layerOf(file)
    const isTest = /\.test\.tsx?$|testing\.ts$/.test(file)
    const allowedLayers = new Set<Layer>([layer, ...RULES[layer].layers, ...(isTest ? TEST_EXTRA.layers : [])])
    const allowedPackages = new Set([...RULES[layer].packages, ...(isTest ? TEST_EXTRA.packages : [])])

    const violations = importsOf(file).flatMap((spec) => {
      if (spec.startsWith('.')) {
        const target = resolve(dirname(file), spec)
        if (/\.(rb|css)(\?raw)?$/.test(spec)) return []
        const targetLayer = layerOf(target)
        return allowedLayers.has(targetLayer) ? [] : [`${spec} (capa ${targetLayer})`]
      }
      return allowedPackages.has(packageOf(spec)) ? [] : [`${spec} (paquete)`]
    })
    expect(violations, `${layer} no puede importar esto`).toEqual([])
  })

  it('fuera del motor solo se importa su API pública (engine/index.ts; los tests también engine/testing)', () => {
    const isPublic = (file: string, spec: string) => /\.test\.tsx?$/.test(file) && /\/engine\/testing$/.test(spec)
    const deep = files
      .filter((f) => layerOf(f) !== 'engine')
      .flatMap((f) =>
        importsOf(f)
          .filter((s) => s.startsWith('.') && /\/engine\/./.test(s) && !isPublic(f, s))
          .map((s) => `${relative(SRC, f)} → ${s}`),
      )
    expect(deep).toEqual([])
  })
})
