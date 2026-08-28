import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
})
