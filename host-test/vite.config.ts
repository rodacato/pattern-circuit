import { defineConfig } from 'vite'

// The test host runs on its own origin (port 5180), different from the course's, as a real host would.
export default defineConfig({
  root: 'host-test',
  server: { port: 5180, strictPort: true, fs: { allow: ['..'] } },
})
