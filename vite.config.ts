import { defineConfig } from 'vite-plus'

import tsdownConfig from './tsdown.config.js'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  test: {},
  fmt: {
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    printWidth: 100,
    sortImports: {
      type: 'natural',
      order: 'asc',
    },
    sortPackageJson: true,
    ignorePatterns: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc'],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    env: {
      browser: true,
    },
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    options: { typeAware: true, typeCheck: true },
  },
  pack: tsdownConfig,
})
