import fs from 'node:fs/promises'
import path from 'node:path'

export async function ensureDirectory(directory: string) {
  await fs.mkdir(path.resolve(directory), { recursive: true })
}
