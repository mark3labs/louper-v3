import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['path', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    sveltekit(),
  ],
  build: {
    rollupOptions: {
      external: ['bun:sqlite'],
    },
  },
  server: {
    fs: {
      // Allow serving files from the project root
      strict: false,
    },
  },
  optimizeDeps: {
    exclude: ['svelte-tags-input'],
  },
})
