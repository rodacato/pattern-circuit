/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: el build funciona en GitHub Pages bajo /<repo>/ sin configurar nada más.
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['shiki/core', 'shiki/engine/javascript', 'shiki/langs/ruby.mjs', 'shiki/themes/tokyo-night.mjs'],
  },
  build: {
    // La gramática de Ruby de Shiki (~1.9 MB, se carga bajo demanda) supera el aviso por defecto.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // Fuera: contenido de niveles (lo cubren sus propios tests), el dibujo Pixi (humble object: lo que
      // se puede calcular vive en layout.ts y motion.ts, que sí se miden) y los puntos de entrada.
      exclude: [
        'src/levels/L*/**',
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
