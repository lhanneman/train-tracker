import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'], // Reduced logging to avoid noise
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Add connection configuration to handle pooling better
  transactionOptions: {
    isolationLevel: 'ReadCommitted',
    maxWait: 5000,
    timeout: 15000
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add cleanup to prevent connection issues
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})