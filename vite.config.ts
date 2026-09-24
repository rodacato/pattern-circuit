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
})
