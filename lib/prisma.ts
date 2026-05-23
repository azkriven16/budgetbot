import '@/lib/env'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createClient = () => {
  // Replace sslmode=require with verify-full to silence pg-connection-string deprecation warning.
  // The warning fires when pg parses the URL — rewriting the param locks in the current behavior explicitly.
  const connectionString = (process.env.DATABASE_URL ?? '').replace(
    'sslmode=require',
    'sslmode=verify-full',
  )
  const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: true } })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient>
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
