import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
  }),
  log: ['error'],
  transactionOptions: {
    isolationLevel: 'ReadCommitted',
    maxWait: 5_000,
    timeout: 15_000,
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
