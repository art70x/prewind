import { defineConfig } from 'vite-plus/pack'

export default defineConfig({
  deps: {
    // tsdown <0.23 compatibility: resolve external dependency subpaths.
    // Remove to preserve subpath imports as written (the new default).
    // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
    resolveDepSubpath: true,
  },
  exports: false,
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: {
    generator: 'tsgo',
  },
  minify: true,
  treeshake: true,
  platform: 'browser',
})
