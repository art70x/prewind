import { defineConfig } from 'oxfmt'

export default defineConfig({
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  sortImports: {
    type: 'natural',
    order: 'asc',
  },
})
