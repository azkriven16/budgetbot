// Load .env.local for AI eval tests — no extra packages needed
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

try {
  const content = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const raw = trimmed.slice(eqIdx + 1).trim()
    const value = raw.replace(/^["'](.*)["']$/, '$1')
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  // .env.local absent — rely on environment variables already present
}
