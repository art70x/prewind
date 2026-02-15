#!/usr/bin/env node
import { program } from 'commander'
import { processFiles } from './utils/processor.js'
import { intro, outro, note, spinner, cancel } from '@clack/prompts'

program
  .name('prewind')
  .alias('pw')
  .version('v2.0.0')
  .description(
    'Expand Tailwind shorthand like hover(bg-blue-500 text-blue-50) → hover:bg-blue-500 hover:text-blue-50.',
  )
  .argument('<patterns...>', 'File paths or glob patterns to process')
  .option('-w, --write', 'Overwrite files in place')
  .option('-o, --out <dir>', 'Output directory for transformed files')
  .configureHelp({ sortOptions: true })
  .action(async (patterns, options) => {
    intro('✨ Prewind – Tailwind Shorthand Expander')

    const s = spinner()
    s.start('Scanning files...')

    try {
      await processFiles(patterns, options)
      s.stop('Files processed')

      note(
        `Patterns: ${patterns.length}\nMode: ${
          options.write ? 'Overwrite' : (options.out ? 'Output directory' : 'Dry run')
        }`,
        'Summary',
      )

      outro('✅ Done. Clean and expanded.')
    } catch (error) {
      s.stop('Failed')
      cancel(String(error))
      process.exit(1)
    }
  })

program.parseAsync(process.argv)
