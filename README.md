# 🌀 Prewind

> Write less, expand more.

[![NPM Downloads](https://img.shields.io/npm/dm/prewind?style=flat&colorA=030812&colorB=2461db)](https://www.npmjs.com/package/prewind)
[![NPM Version](https://img.shields.io/npm/v/prewind?style=flat&colorA=030812&colorB=2461db)](https://www.npmjs.com/package/prewind)
[![GitHub Stars](https://img.shields.io/github/stars/art70x/prewind?style=flat&colorA=030812&colorB=2461db)](https://github.com/art70x/prewind/stargazers)
[![License](https://img.shields.io/github/license/art70x/prewind?style=flat&colorA=030812&colorB=2461db)](https://github.com/art70x/prewind/blob/main/LICENSE)

A lightweight **preprocessor** that expands Tailwind-style shorthand into full variant syntax. Write expressive classes like:

```html
<div
  class="hover(bg-blue-500 text-blue-50) dark(border-blue-300 hover(bg-blue-400 text-blue-950))"
></div>
```

and automatically transform them into:

```html
<div
  class="hover:bg-blue-500 hover:text-blue-50 dark:border-blue-300 dark:hover:bg-blue-400 dark:hover:text-blue-950"
></div>
```

---

## ✨ Features

- Expand Tailwind shorthand groups automatically
- Supports **nested variants** (`hover()`, `dark()`, `group-hover()`, `peer-focus()`, `not()`, etc.)
- Fast, zero-runtime — designed for build-time processing
- CLI-friendly — runs before Prettier or dev servers
- Fully **verbose logging** with `-v`/`--verbose` option
- Colored console output with `picocolors`
- Works in **Node, CLI, and browser environments**

---

## 📦 Installation

```bash
pnpm add -D prewind
# or
npm install -D prewind
# or
yarn add -D prewind
```

Global install (optional):

```bash
pnpm add -g prewind
```

---

## ⚙️ CLI Options

| Flag                  | Description                                         |
| --------------------- | --------------------------------------------------- |
| `<patterns...>`       | File path(s) or glob pattern(s) to process          |
| `-w, --write`         | Overwrite files in place                            |
| `-o, --out <dir>`     | Output transformed files into a directory or file   |
| `-v, --verbose`       | Show detailed file processing logs (colored output) |
| `--dry-run`           | Preview changes without writing (default)           |
| `--ignore <patterns>` | Glob patterns to ignore                             |
| `-h, --help`          | Show CLI help                                       |

---

## 🚀 CLI Usage

### Dry-run / Preview (default)

```bash
prewind src/test.html
prewind "src/**/*.html" --dry-run
```

Outputs transformed files to console without modifying them.

### Write files in place

```bash
prewind -w src/test.html
prewind src/**/*.html --write
```

Prompts confirmation before overwriting files.

### Output to a directory

```bash
prewind src/**/*.html -o dist
prewind src/test.html -o out.html
```

### Verbose Mode (colored)

```bash
prewind src/**/*.html --dry-run -v
prewind src/**/*.html --write -v
prewind src/**/*.html -o dist -v
```

Prints `Changed`/`Unchanged` for each file, showing input → output paths in **colored console**.

---

## 🌐 Browser Usage

Prewind also works in the browser via ESM modules.

### Using ES Modules

```html
<script type="module">
  import { transform } from 'https://cdn.jsdelivr.net/npm/prewind/dist/main.js'

  const html = `
    <div
      class="hover(bg-blue-500 text-blue-50) dark(border-blue-300 hover(bg-blue-400 text-blue-950))"
    ></div>
  `

  console.log(transform(html))
</script>
```

### Transforming DOM Elements

```html
<div id="btn" class="hover(bg-blue-500 text-white)"></div>

<script type="module">
  import { transformDOM } from 'https://cdn.jsdelivr.net/npm/prewind/dist/main.js'

  const el = document.getElementById('btn')
  transformDOM(el)
  // <div id="btn" class="hover:bg-blue-500 hover:text-white"></div>
</script>
```

### Watching DOM Changes

```html
<div id="app"></div>

<script type="module">
  import { observeDOM } from 'https://cdn.jsdelivr.net/npm/prewind/dist/main.js'

  const app = document.getElementById('app')
  observeDOM(app)

  const btn = document.createElement('button')
  btn.className = 'hover(bg-red-500 text-white)'
  app.appendChild(btn)

  // observeDOM auto-transforms new elements
</script>
```

---

### Using in Frameworks

```ts
import { transform } from 'prewind'

const jsx = `<div class="hover(bg-blue-500 text-white)"></div>`
console.log(transform(jsx))
// <div class="hover:bg-blue-500 hover:text-white"></div>
```

Works in **React, Vue, Svelte, or any frontend framework**. Integrate as a build-time step with **Vite/Webpack/Rollup**.

---

## 🧠 Why Prewind?

Writing full Tailwind variants is verbose:

```html
<div
  class="hover:bg-blue-500 hover:text-blue-50 dark:hover:bg-blue-400 dark:hover:text-blue-950"
></div>
```

Prewind lets you express them **structurally**:

```html
<div class="hover(bg-blue-500 text-blue-50) dark(hover(bg-blue-400 text-blue-950))"></div>
```

No conflicts with Prettier or Tailwind JIT — works **before formatters or dev servers**.

---

## 🛠️ Development

```bash
pnpm install
pnpm run try tests/test.html      # Run CLI locally
pnpm run build                     # Build CLI + browser
pnpm link --global                 # Test global CLI
prewind src/**/*.html              # Run globally
```

---

## 🧭 Roadmap

- [x] v2.1: Verbose logging, colored CLI, safe `--out` handling
- [ ] Config file support (`prewind.config.json`)
- [ ] Add `--dry` and `--silent` modes

---

## 🧑‍💻 Author

**art70x** — MIT License © 2025
[GitHub Repository →](https://github.com/art70x/prewind)

---

> 🌀 _Prewind — write less, expand more_
