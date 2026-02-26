import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { transform, expandVariants } from '../src/main.js'

const htmlTemplate = `
<div class="grid place-items-center bg-blue-50 dark(bg-blue-950)">
  <button class="px-3 py-2 bg-blue-600 text-blue-100 hover(bg-blue-500 text-blue-50) dark(border-blue-300 hover(bg-blue-400 text-blue-950))"> Button </button>
</div>
`

describe('expandVariants()', () => {
  it('expands simple variant group', () => {
    const result = expandVariants('hover(bg-blue-500 text-white)')
    expect(result).toEqual([
      'hover:bg-blue-500',
      'hover:text-white',
    ])
  })

  it('expands nested variant groups', () => {
    const result = expandVariants('dark(hover(bg-blue-400 text-black))')
    expect(result).toEqual([
      'dark:hover:bg-blue-400',
      'dark:hover:text-black',
    ])
  })

  it('handles deep nesting (3 levels)', () => {
    const result = expandVariants(
      'dark(group(hover(bg-blue-500)))'
    )
    expect(result).toEqual([
      'dark:group:hover:bg-blue-500',
    ])
  })

  it('handles multiple variant groups in one string', () => {
    const result = expandVariants(
      'hover(bg-blue-500) focus(text-white)'
    )
    expect(result).toEqual([
      'hover:bg-blue-500',
      'focus:text-white',
    ])
  })

  it('preserves normal classes with variant groups', () => {
    const result = expandVariants(
      'px-4 py-2 hover(bg-blue-500)'
    )
    expect(result).toEqual([
      'px-4',
      'py-2',
      'hover:bg-blue-500',
    ])
  })

  it('handles extra whitespace inside groups', () => {
    const result = expandVariants(
      'hover(   bg-blue-500   text-white   )'
    )
    expect(result).toEqual([
      'hover:bg-blue-500',
      'hover:text-white',
    ])
  })

  it('returns empty array for empty string', () => {
    expect(expandVariants('')).toEqual([])
  })

  it('handles empty variant group safely', () => {
    expect(expandVariants('hover()')).toEqual([])
  })

  it('does not crash on malformed input', () => {
    expect(() => expandVariants('hover(')).not.toThrow()
  })
})

describe('transform()', () => {
  it('expands grouped variants inside HTML', () => {
    const transformed = transform(htmlTemplate)

    const dom = new JSDOM(transformed)
    const button = dom.window.document.querySelector('button')

    expect(button).not.toBeNull()

    const classes = [...button!.classList]

    expect(classes).toContain('hover:bg-blue-500')
    expect(classes).toContain('hover:text-blue-50')
    expect(classes).toContain('dark:border-blue-300')
    expect(classes).toContain('dark:hover:bg-blue-400')
    expect(classes).toContain('dark:hover:text-blue-950')
  })

  it('does not modify unrelated classes', () => {
    const testHtml = '<p class="text-red-500">Hello</p>'
    const transformed = transform(testHtml)

    const dom = new JSDOM(transformed)
    const p = dom.window.document.querySelector('p')

    expect(p!.classList.contains('text-red-500')).toBe(true)
  })

  it('handles multiple class attributes', () => {
    const multiClassHtml = `
      <div class="hover(bg-blue-500)"></div>
      <span class="dark:text-white hover:text-black"></span>
    `
    const transformed = transform(multiClassHtml)

    const dom = new JSDOM(transformed)

    const div = dom.window.document.querySelector('div')
    const span = dom.window.document.querySelector('span')

    expect(div!.classList.contains('hover:bg-blue-500')).toBe(true)
    expect(span!.classList.contains('dark:text-white')).toBe(true)
    expect(span!.classList.contains('hover:text-black')).toBe(true)
  })

  it('handles HTML without class attributes', () => {
    const html = '<div><p>Hello</p></div>'
    const transformed = transform(html)
    expect(transformed).toBe(html)
  })

  it('does not duplicate already expanded classes', () => {
    const html = `<div class="hover:text-blue-500 hover(text-blue-500)"></div>`
    const transformed = transform(html)

    const dom = new JSDOM(transformed)
    const div = dom.window.document.querySelector('div')

    const occurrences = [...div!.classList].filter(
      c => c === 'hover:text-blue-500'
    )

    expect(occurrences.length).toBe(1)
  })
})
