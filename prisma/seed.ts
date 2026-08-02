import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Create a demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Corp',
    },
  })

  // 2. Create users (Admin, Analyst, Viewer)
  // Password hashing will be implemented in the auth flow, using a simple placeholder for seed
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@acme.com',
      passwordHash: 'hashed_password_here', // To be replaced with actual hash
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  })

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@acme.com',
      passwordHash: 'hashed_password_here', 
      role: 'ANALYST',
      workspaceId: workspace.id,
    },
  })

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@acme.com',
      passwordHash: 'hashed_password_here',
      role: 'VIEWER',
      workspaceId: workspace.id,
    },
  })

  // 3. Create Themes
  const themeBug = await prisma.theme.create({
    data: {
      name: 'Bugs',
      description: 'Reported bugs and glitches',
      color: '#ff0000',
      workspaceId: workspace.id,
    },
  })

  // 4. Create Feedback Items
  const feedbacks = [
    {
      content: 'The new dashboard is gorgeous and finally fast. Huge improvement.',
      channel: 'App store review',
      sentiment: 'POS',
      sentimentScore: 0.8,
      status: 'REVIEWED',
      workspaceId: workspace.id,
    },
    {
      content: 'Onboarding took forever — I couldn’t figure out how to invite my team.',
      channel: 'Support ticket',
      sentiment: 'NEG',
      sentimentScore: -0.7,
      status: 'NEW',
      workspaceId: workspace.id,
    },
  ]

  for (const f of feedbacks) {
    await prisma.feedback.create({
      data: {
        content: f.content,
        channel: f.channel,
        sentiment: f.sentiment as any,
        sentimentScore: f.sentimentScore,
        status: f.status as any,
        workspaceId: f.workspaceId,
      },
    })
  }

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
