import { describe, it, expect } from 'vitest'
import { transform, expandVariants } from '../src/main.js'

const htmlTemplate = `
<div class="grid place-items-center bg-blue-50 dark(bg-blue-950)">
  <button class="px-3 py-2 bg-blue-600 text-blue-100 hover(bg-blue-500 text-blue-50) dark(border-blue-300 hover(bg-blue-400 text-blue-950))"> Button </button>
  </div>
`

describe('main.ts exports', () => {
  it('expandVariants should expand simple classes', () => {
    const result = expandVariants('hover(bg-blue-500 text-white)')
    expect(result).toEqual(['hover:bg-blue-500', 'hover:text-white'])
  })

  it('expandVariants should expand nested variants', () => {
    const result = expandVariants('dark(hover(bg-blue-400 text-black))')
    expect(result).toEqual(['dark:hover:bg-blue-400', 'dark:hover:text-black'])
  })

  it('transform should expand all class attributes in HTML', () => {
    const transformed = transform(htmlTemplate)

    expect(transformed).toContain('class="grid place-items-center bg-blue-50 dark:bg-blue-950"')

    expect(transformed).toContain(
      'class="px-3 py-2 bg-blue-600 text-blue-100 hover:bg-blue-500 hover:text-blue-50 dark:border-blue-300 dark:hover:bg-blue-400 dark:hover:text-blue-950"',
    )
  })

  it('transform should not modify unrelated HTML', () => {
    const testHtml = '<p class="text-red-500">Hello</p>'
    const transformed = transform(testHtml)
    expect(transformed).toContain('class="text-red-500"')
  })

  it('transform should handle multiple class attributes', () => {
    const multiClassHtml = `
      <div class="hover(bg-blue-500)"></div>
      <span class="dark:text-white hover:text-black"></span>
    `
    const transformed = transform(multiClassHtml)
    expect(transformed).toContain('hover:bg-blue-500')
    expect(transformed).toContain('dark:text-white')
    expect(transformed).toContain('hover:text-black')
  })
})
