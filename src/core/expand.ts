/**
 * Expands grouped Tailwind-like variant syntax.
 *
 * Supported:
 * hover(bg-blue-500 text-white)
 * hover:(bg-blue-500 text-white)
 * dark:hover(bg-blue-400)
 * dark:(hover(bg-blue-400 text-white))
 *
 * Nested groups are fully supported.
 */

export function expandVariants(input: string, prefix = ''): string[] {
  const tokens: string[] = []
  let index = 0

  while (index < input.length) {
    // Skip whitespace
    if (/\s/.test(input[index])) {
      index++
      continue
    }

    const start = index

    // Read token (stops before space, colon, or parentheses)
    while (index < input.length && /[^\s():]/.test(input[index])) index++
    let token = input.slice(start, index)

    if (!token) continue

    // Handle variant chains like dark:hover:
    while (input[index] === ':') {
      index++ // skip :
      const chainStart = index
      while (index < input.length && /[^\s():]/.test(input[index])) index++
      const next = input.slice(chainStart, index)
      token += `:${next}`
    }

    // Case 1: group with optional colon syntax
    if (input[index] === '(' || (input[index] === ':' && input[index + 1] === '(')) {
      if (input[index] === ':') index++ // skip colon before "("

      const { content, nextIndex } = extractGroup(input, index)

      const newPrefix = prefix ? `${prefix}:${token}` : token
      const nested = expandVariants(content, newPrefix)
      tokens.push(...nested)

      index = nextIndex
      continue
    }

    // Regular class
    const final = prefix ? `${prefix}:${token}` : token
    tokens.push(final)
  }

  return tokens
}

function extractGroup(input: string, startIndex: number): { content: string; nextIndex: number } {
  let depth = 0
  let index = startIndex
  let contentStart = -1

  for (; index < input.length; index++) {
    if (input[index] === '(') {
      if (depth === 0) contentStart = index + 1
      depth++
    } else if (input[index] === ')') {
      depth--
      if (depth === 0) {
        return {
          content: input.slice(contentStart, index),
          nextIndex: index + 1,
        }
      }
    }
  }

  // Unmatched parentheses → treat rest as content
  return {
    content: input.slice(startIndex + 1),
    nextIndex: input.length,
  }
}
