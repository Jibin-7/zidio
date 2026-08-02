import { NextResponse } from "next-auth/next"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const feedbackSchema = z.object({
  content: z.string().min(1),
  channel: z.string().min(1),
  customerLabel: z.string().optional(),
})

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 20
  const skip = (page - 1) * limit
  
  const search = searchParams.get("search")
  const channel = searchParams.get("channel")
  const status = searchParams.get("status")

  const where: any = {
    workspaceId: user.workspaceId
  }

  if (search) {
    where.content = { contains: search, mode: 'insensitive' }
  }
  if (channel) {
    where.channel = channel
  }
  if (status) {
    where.status = status
  }

  const feedbacks = await prisma.feedback.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take: limit,
  })

  const total = await prisma.feedback.count({ where })

  return new Response(JSON.stringify({ feedbacks, total, page, totalPages: Math.ceil(total / limit) }), {
    headers: { "Content-Type": "application/json" }
  })
}

import { classifyFeedback } from "@/lib/ai"
import { storeEmbedding } from "@/lib/search"
import { triggerAutoTriage } from "@/lib/webhook"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  if (user.role === "VIEWER") return new Response("Forbidden", { status: 403 })

  try {
    const body = await req.json()
    const data = feedbackSchema.parse(body)

    // AI Classification
    const existingThemesData = await prisma.theme.findMany({ where: { workspaceId: user.workspaceId }, select: { name: true } })
    const existingThemes = existingThemesData.map(t => t.name)
    const classification = await classifyFeedback(data.content, existingThemes)

    const feedback = await prisma.feedback.create({
      data: {
        content: data.content,
        channel: data.channel,
        customerLabel: data.customerLabel,
        workspaceId: user.workspaceId,
        status: "NEW",
        sentiment: classification?.sentiment,
        sentimentScore: classification?.sentimentScore,
      }
    })

    // Assign themes
    if (classification && classification.themes.length > 0) {
      for (const themeName of classification.themes) {
        // Find or create theme
        let theme = await prisma.theme.findFirst({
          where: { name: { equals: themeName, mode: 'insensitive' }, workspaceId: user.workspaceId }
        })
        if (!theme) {
          theme = await prisma.theme.create({
            data: { name: themeName, workspaceId: user.workspaceId, color: "#" + Math.floor(Math.random()*16777215).toString(16) }
          })
        }
        // Link theme
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: theme.id,
            confidence: 0.9,
          }
        })
      }
    }

    await storeEmbedding(feedback.id, feedback.content)
    
    // Async fire-and-forget webhook
    triggerAutoTriage(feedback)

    return new Response(JSON.stringify(feedback), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 })
    }
    return new Response("Internal Server Error", { status: 500 })
  }
}
