import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' → läuft unter jedem GitHub-Pages-Pfad (z. B. /koch-app/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
