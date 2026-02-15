import fg from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spinner, note, log } from '@clack/prompts'
import { ensureDirectory } from '../utils/fs-utilities.js'
import { transform } from '../main.js'

export async function processFiles(
  patterns: string[],
  options: { write?: boolean; out?: string; debug?: boolean },
) {
  const start = performance.now()

  const files = await fg(patterns, {
    absolute: true,
    onlyFiles: true,
  })

  if (files.length === 0) {
    throw new Error('No files matched the given pattern(s).')
  }

  if (options.write && options.out) {
    throw new Error('Cannot use --write and --out together.')
  }

  if (options.out && files.length > 1 && path.extname(options.out)) {
    throw new Error('When processing multiple files, --out must be a directory.')
  }

  log.info(`Found ${files.length} file(s).`)

  let changedCount = 0
  let unchangedCount = 0

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file)

    const s = spinner()
    s.start(`Processing ${relativePath}`)

    try {
      const raw = await fs.readFile(file, 'utf8')
      const transformed = transform(raw)

      if (raw === transformed) {
        unchangedCount++
        s.stop(`No changes — ${relativePath}`)
        continue
      }

      if (options.write) {
        await fs.writeFile(file, transformed, 'utf8')
        s.stop(`Updated ${relativePath}`)
      } else if (options.out) {
        const outPath =
          files.length === 1 ? path.resolve(options.out) : path.join(options.out, relativePath)

        await ensureDirectory(path.dirname(outPath))
        await fs.writeFile(outPath, transformed, 'utf8')
        s.stop(`Wrote ${path.relative(process.cwd(), outPath)}`)
      } else {
        s.stop(`Preview ${relativePath}`)
        console.log('\n' + transformed + '\n')
      }

      changedCount++
    } catch (error) {
      s.stop(`Failed ${relativePath}`)
      throw error
    }
  }

  const duration = ((performance.now() - start) / 1000).toFixed(2)

  let mode: string
  if (options.write) {
    mode = 'Overwrite'
  } else if (options.out) {
    mode = files.length === 1 ? `Output → ${options.out}` : `Output dir → ${options.out}`
  } else {
    mode = 'Dry run'
  }

  note(
    `Files scanned : ${files.length}
Files changed : ${changedCount}
Unchanged     : ${unchangedCount}
Mode          : ${mode}
Time          : ${duration}s`,
    'Summary',
  )
}
