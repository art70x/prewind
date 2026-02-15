import { defineConfig } from 'tsdown'

export default defineConfig({
  exports: true,
  entry: ['src/cli.ts'],
  outDir: 'dist/bin',
  format: ['esm'],
  sourcemap: false,
  clean: false,
  dts: false,
  minify: true,
  treeshake: true,
  platform: 'node',
})
