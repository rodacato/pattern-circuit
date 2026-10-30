/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  // Relative paths: the build works on GitHub Pages under /<repo>/ without any further configuration.
  base: './',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  optimizeDeps: {
    include: ['shiki/core', 'shiki/engine/javascript', 'shiki/langs/ruby.mjs', 'shiki/langs/typescript.mjs', 'shiki/themes/tokyo-night.mjs', 'shiki/themes/github-light.mjs'],
  },
  build: {
    // Shiki's Ruby grammar (~1.9 MB, loaded on demand) exceeds the default warning.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    // Agent worktrees live inside the checkout and carry their own copy of the suite.
    exclude: [...configDefaults.exclude, '.claude/**'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // Excluded: level content (covered by its own tests), the Pixi drawing (humble object: what
      // can be computed lives in layout.ts and motion.ts, which are measured) and the entry points.
      exclude: [
        'src/levels/*/**',
        'src/i18n/locales/**',
        'src/render/{NeonStage,PulseLayer,SocketLayer,draw,fx,theme}.ts',
        'src/render/skins/**',
        'src/debug/**',
        'src/main.tsx',
        'src/ui/GameApp.tsx',
        'src/ui/code/**',
        '**/*.test.{ts,tsx}',
        'src/engine/testing.ts',
      ],
      thresholds: { lines: 85, functions: 85, branches: 75, statements: 85 },
    },
  },
})
