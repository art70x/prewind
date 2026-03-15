import fs from 'node:fs/promises'
import path from 'node:path'

import fg from 'fast-glob'

import { transform } from '../main.js'
import { ensureDirectory } from './fs-utilities.js'

export type ProcessMode = 'write' | 'out' | 'dry-run'

export interface ProcessOptions {
  mode: ProcessMode
  out?: string
  ignore?: string[]
  verbose?: boolean
  concurrency?: number
}

export interface ProcessResult {
  filesScanned: number
  filesChanged: number
  unchanged: number
  replacements: number
  commit?: () => Promise<void>
}

/**
 * Count replacements (naive heuristic based on string length difference)
 * @param before - original file content
 * @param after - transformed content
 */
function countReplacements(before: string, after: string): number {
  return before === after ? 0 : Math.abs(after.length - before.length)
}

/**
 * Process files matching given patterns and transform them using Prewind
 * @param patterns - Glob patterns or file paths to process
 * @param options - Processing options
 * @returns ProcessResult including metrics and optional commit function
 */
export async function processFiles(
  patterns: string[],
  options: ProcessOptions,
): Promise<ProcessResult> {
  // Resolve files
  const files = await fg(patterns, {
    absolute: true,
    onlyFiles: true,
    ignore: options.ignore ?? [],
  })

  if (files.length === 0) throw new Error('No files matched the given pattern(s).')
  if (options.mode === 'out' && !options.out)
    throw new Error('--out requires a directory or file path.')

  const pendingWrites: Array<() => Promise<void>> = []
  let filesChanged = 0
  let unchanged = 0
  let replacements = 0
  const concurrency = options.concurrency ?? 8
  const queue = [...files].toSorted() // ESLint-safe deterministic order

  /**
   * Worker function for concurrent processing
   */
  async function worker() {
    while (queue.length > 0) {
      const file = queue.pop()
      if (!file) return

      const relativePath = path.relative(process.cwd(), file)
      const raw = await fs.readFile(file, 'utf8')
      const transformed = transform(raw)

      // ---- SAFE TARGET ----
      let target: string
      if (options.mode === 'out') {
        if (!options.out) throw new Error('--out requires a directory or file path.')
        target =
          files.length === 1 && path.extname(options.out)
            ? options.out
            : path.join(options.out, relativePath)
      } else {
        target = file
      }

      // Verbose logging for all modes
      if (options.verbose) {
        console.log(`${raw === transformed ? 'Unchanged' : 'Changed'}: ${relativePath} → ${target}`)
      }

      if (raw === transformed) {
        unchanged++
        continue
      }

      filesChanged++
      replacements += countReplacements(raw, transformed)

      if (options.mode === 'write') {
        pendingWrites.push(() => fs.writeFile(file, transformed, 'utf8'))
      } else if (options.mode === 'out') {
        pendingWrites.push(async () => {
          await ensureDirectory(path.dirname(target))
          await fs.writeFile(target, transformed, 'utf8')
        })
      }
    }
  }

  // Run workers concurrently
  await Promise.all(Array.from({ length: concurrency }, worker))

  /**
   * Commit function to execute queued writes
   */
  async function commit() {
    for (const write of pendingWrites) {
      await write()
    }
  }

  return {
    filesScanned: files.length,
    filesChanged,
    unchanged,
    replacements,
    commit: options.mode === 'dry-run' ? undefined : commit,
  }
}
