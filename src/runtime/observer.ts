import { transformElement } from './dom.js'

export function observeDOM(): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        transformElement(mutation.target as Element)
      }

      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue

          if (node.hasAttribute('class')) {
            transformElement(node)
          }

          const children = node.querySelectorAll('[class]')
          for (const child of children) {
            transformElement(child)
          }
        }
      }
    }
  })

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  })

  return observer
}
