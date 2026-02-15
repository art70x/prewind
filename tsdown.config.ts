import { defineConfig } from 'tsdown'

export default defineConfig({
  exports: true,
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: true,
  minify: true,
  treeshake: true,
  platform: 'browser',
})
