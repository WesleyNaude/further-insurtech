import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: { environment: 'jsdom', globals: true },
  resolve: { alias: { '@': path.resolve(dirname, './src') } },
})
