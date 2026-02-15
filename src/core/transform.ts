import { expandVariants } from '../main'

export function transform(content: string): string {
  return content.replaceAll(
    /(class|className)=["']([\s\S]*?)["']/g,
    (_, attribute: string, classValue: string) => {
      const expanded = expandVariants(classValue.trim())
      return `${attribute}="${expanded.join(' ')}"`
    },
  )
}
