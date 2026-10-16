/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths: the build works on GitHub Pages under /<repo>/ without any further configuration.
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['shiki/core', 'shiki/engine/javascript', 'shiki/langs/ruby.mjs', 'shiki/langs/typescript.mjs', 'shiki/themes/tokyo-night.mjs'],
  },
  build: {
    // Shiki's Ruby grammar (~1.9 MB, loaded on demand) exceeds the default warning.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // Excluded: level content (covered by its own tests), the Pixi drawing (humble object: what
      // can be computed lives in layout.ts and motion.ts, which are measured) and the entry points.
      exclude: [
        'src/levels/*/**',
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
