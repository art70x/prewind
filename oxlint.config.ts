import { defineConfig } from 'oxlint'

export default defineConfig({
  ignorePatterns: ['dist'],
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc'],
  env: {
    browser: true,
  },
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
})
