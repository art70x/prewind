import { defineConfig } from 'tsdown'

export default defineConfig({
  exports: false,
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: {
    tsgo: true,
  },
  minify: true,
  treeshake: true,
  platform: 'browser',
})
