import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { classifyFeedback } from "@/lib/ai"
import { storeEmbedding } from "@/lib/search"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") return new Response("Unauthorized", { status: 401 })

  try {
    const unclassified = await prisma.feedback.findMany({
      where: {
        workspaceId: user.workspaceId,
        sentiment: null
      },
      take: 20 // Process in batches to avoid rate limits
    })

    if (unclassified.length === 0) {
      return new Response(JSON.stringify({ message: "No unclassified feedback found" }), { status: 200 })
    }

    let processed = 0

    const existingThemesData = await prisma.theme.findMany({ where: { workspaceId: user.workspaceId }, select: { name: true } })
    const existingThemes = existingThemesData.map((t: any) => t.name)

    for (const item of unclassified) {
      const classification = await classifyFeedback(item.content, existingThemes)
      if (classification) {
        await prisma.feedback.update({
          where: { id: item.id },
          data: {
            sentiment: classification.sentiment,
            sentimentScore: classification.sentimentScore,
          }
        })

        if (classification.themes.length > 0) {
          for (const themeName of classification.themes) {
            let theme = await prisma.theme.findFirst({
              where: { name: { equals: themeName, mode: 'insensitive' }, workspaceId: user.workspaceId }
            })
            if (!theme) {
              theme = await prisma.theme.create({
                data: { name: themeName, workspaceId: user.workspaceId, color: "#" + Math.floor(Math.random()*16777215).toString(16) }
              })
              existingThemes.push(themeName) // add to memory
            }
            await prisma.feedbackTheme.create({
              data: { feedbackId: item.id, themeId: theme.id, confidence: 1.0 }
            })
          }
        }
        await storeEmbedding(item.id, item.content)
        processed++
      }
    }

    return new Response(JSON.stringify({ message: `Processed ${processed} items`, processed }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
