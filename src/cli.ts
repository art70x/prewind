#!/usr/bin/env node
import { cancel, confirm, intro, note, outro, spinner } from '@clack/prompts'
import { program } from 'commander'
import { performance } from 'node:perf_hooks'
import process from 'node:process'
import pc from 'picocolors'
import { processFiles, type ProcessResult } from './utils/processor.js'

const VERSION = '2.1.0'

/**
 * Resolve mode and enforce only one mode at a time
 */
function resolveMode(options: { write?: boolean; out?: string; dryRun?: boolean }) {
  const modes = [options.write, options.out, options.dryRun].filter(Boolean)
  if (modes.length > 1) {
    console.error(pc.red('Error: Choose only one mode: --write, --out, or --dry-run'))
    process.exit(1)
  }
  if (options.write) return 'write'
  if (options.out) return 'out'
  return 'dry-run'
}

program
  .name('prewind')
  .alias('pw')
  .version(VERSION)
  .description(
    'Expand Tailwind shorthand like hover(bg-blue-500 text-blue-50) → hover:bg-blue-500 hover:text-blue-50.',
  )
  .argument('<patterns...>', 'File paths or glob patterns to process')
  .option('--dry-run', 'Preview changes without writing (default)')
  .option('-w, --write', 'Overwrite files in place')
  .option('-o, --out <dir>', 'Output directory or file for transformed files')
  .option('-v, --verbose', 'Show detailed file processing logs')
  .option('--ignore <patterns...>', 'Glob patterns to ignore')
  .configureHelp({ sortOptions: true })
  .addHelpText(
    'after',
    `
Examples:
  $ pw "src/**/*.jsx"
  $ pw src --dry-run
  $ pw src --write
  $ pw src --out dist
  $ pw src --write --verbose
`,
  )
  .action(async (patterns: string[], options) => {
    intro(pc.bold(`✨ Prewind v${VERSION}`))

    const mode = resolveMode(options)
    const s = spinner()
    s.start('Scanning and processing files...')

    const start = performance.now()

    try {
      const result: ProcessResult = await processFiles(patterns, {
        ...options,
        mode,
      })

      s.stop(pc.green('Processing complete'))

      // Confirm destructive write
      if (mode === 'write' && result.filesChanged > 0) {
        const proceed = await confirm({
          message: `Overwrite ${result.filesChanged} modified files?`,
        })
        if (!proceed) {
          cancel('Operation cancelled')
          process.exit(0)
        }
        await result.commit?.()
      } else if (mode === 'out' && result.filesChanged > 0) {
        await result.commit?.()
      }

      // Summary
      const duration = Math.round(performance.now() - start)
      const summary = `
Files scanned : ${result.filesScanned}
Files changed : ${result.filesChanged}
Unchanged     : ${result.unchanged}
Replacements  : ${result.replacements}
Mode          : ${mode}
Time          : ${duration}ms
      `.trim()

      note(summary, 'Summary')

      if (result.filesChanged === 0) {
        outro(pc.dim('No shorthand found. Everything is clean.'))
      } else {
        outro(
          pc.green(`Expanded ${result.replacements} variants across ${result.filesChanged} files.`),
        )
      }
    } catch (error) {
      s.stop(pc.red('Failed'))
      if (options.verbose) {
        console.error(error)
      } else {
        cancel(String(error) || 'Unknown error')
      }
      process.exit(1)
    }
  })

program.parseAsync(process.argv)
