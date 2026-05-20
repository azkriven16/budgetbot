import { defineConfig } from 'prisma/config'
import { existsSync, readFileSync } from 'fs'

// Prisma evaluates this before loading .env, so we parse it manually
for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=["']?(.+?)["']?\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
    break
  }
}

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
})
