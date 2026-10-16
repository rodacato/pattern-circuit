// Dependency rules between layers. If a test here fails, the fix is almost never to relax the rule.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

type Layer = 'engine' | 'i18n' | 'course-kit' | 'course' | 'levels' | 'game' | 'render' | 'ui' | 'debug' | 'root'

const RULES: Record<Layer, { layers: Layer[]; packages: string[] }> = {
  engine: { layers: [], packages: ['zod'] },
  i18n: { layers: [], packages: [] },
  'course-kit': { layers: [], packages: ['zod'] },
  course: { layers: ['course-kit', 'engine', 'game', 'i18n', 'levels'], packages: [] },
  levels: { layers: ['engine', 'i18n'], packages: [] },
  game: { layers: ['engine', 'i18n'], packages: ['zod'] },
  render: { layers: ['engine', 'game', 'i18n'], packages: ['pixi.js'] },
  ui: { layers: ['engine', 'game', 'render', 'levels', 'i18n', 'course-kit', 'course'], packages: ['react', 'react-dom', 'shiki'] },
  debug: { layers: ['engine', 'levels'], packages: ['react'] },
  root: { layers: ['ui', 'debug', 'course'], packages: ['react', 'react-dom'] },
}

// Tests may also load real levels and use vitest/node.
const TEST_EXTRA = { layers: ['levels', 'engine'] as Layer[], packages: ['vitest', 'node:fs', 'node:path', 'node:url', 'node:vm', 'node:child_process', '@testing-library/react', 'typescript'] }

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

describe('architecture', () => {
  it.each(files.map((f) => [relative(SRC, f), f]))('%s respects its dependencies', (_name, file) => {
    const layer = layerOf(file)
    const isTest = /\.test\.tsx?$|testing\.ts$/.test(file)
    const allowedLayers = new Set<Layer>([layer, ...RULES[layer].layers, ...(isTest ? TEST_EXTRA.layers : [])])
    const allowedPackages = new Set([...RULES[layer].packages, ...(isTest ? TEST_EXTRA.packages : [])])

    const violations = importsOf(file).flatMap((spec) => {
      if (spec.startsWith('.')) {
        const target = resolve(dirname(file), spec)
        if (/\.(rb|css)(\?raw)?$/.test(spec)) return []
        const targetLayer = layerOf(target)
        return allowedLayers.has(targetLayer) ? [] : [`${spec} (layer ${targetLayer})`]
      }
      return allowedPackages.has(packageOf(spec)) ? [] : [`${spec} (package)`]
    })
    expect(violations, `${layer} cannot import this`).toEqual([])
  })

  it('outside the engine only its public API is imported (engine/index.ts; tests also engine/testing)', () => {
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
