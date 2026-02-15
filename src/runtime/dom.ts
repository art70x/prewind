import { expandVariants } from '../main.js'

export function transformElement(element: Element): void {
  const classAttribute = element.getAttribute('class')
  if (!classAttribute) return

  const expanded = expandVariants(classAttribute.trim())
  element.setAttribute('class', expanded.join(' '))
}

/**
 * Transform all elements with a `class` attribute under the root.
 * Default root is `document`.
 */
export function transformDOM(root: ParentNode = document): void {
  const elements = root.querySelectorAll('[class]')
  for (const element of elements) {
    transformElement(element)
  }
}
