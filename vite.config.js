// vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: '/project2/', // GitHub pages
  build: {
    outDir: 'dist',    // default output folder for GitHub Pages
  },
  server: {
    port: 5173,        // optional: local dev server port
    open: true
  }
})
