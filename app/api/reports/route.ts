import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { GoogleGenAI } from "@google/genai"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role === "VIEWER") return new Response("Unauthorized", { status: 401 })

  try {
    const { periodStart, periodEnd } = await req.json()
    if (!periodStart || !periodEnd) return new Response("Missing dates", { status: 400 })

    const startDate = new Date(periodStart)
    const endDate = new Date(periodEnd)
    endDate.setUTCHours(23, 59, 59, 999)

    // 1. Pre-compute stats
    const where = {
      workspaceId: user.workspaceId,
      createdAt: { gte: startDate, lte: endDate }
    }

    const totalCount = await prisma.feedback.count({ where })
    
    if (totalCount === 0) {
      return new Response(JSON.stringify({ error: "No feedback found in this period to generate a report." }), { status: 400 })
    }

    const posCount = await prisma.feedback.count({ where: { ...where, sentiment: "POS" } })
    const negCount = await prisma.feedback.count({ where: { ...where, sentiment: "NEG" } })

    const themes = await prisma.theme.findMany({
      where: { workspaceId: user.workspaceId },
      include: {
        _count: {
          select: { feedbacks: { where: { feedback: { createdAt: { gte: startDate, lte: endDate } } } } }
        }
      }
    })
    const sortedThemes = themes.sort((a, b) => b._count.feedbacks - a._count.feedbacks).slice(0, 3)

    const rawFeedback = await prisma.feedback.findMany({
      where,
      take: 20,
      orderBy: { createdAt: "desc" },
      select: { content: true, channel: true, sentiment: true }
    })

    const statsContext = `
Period: ${startDate.toDateString()} to ${endDate.toDateString()}
Total Feedback Volume: ${totalCount}
Positive Sentiment: ${posCount}
Negative Sentiment: ${negCount}

Top 3 Themes:
${sortedThemes.map(t => `- ${t.name} (${t._count.feedbacks} items)`).join('\n')}

Sample verbatim quotes:
${rawFeedback.map(f => `[${f.sentiment}] ${f.channel}: "${f.content}"`).join('\n')}
`

    // 2. Call AI to write narrative
    let markdownReport = ""
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey })
        const prompt = `
You are a senior product manager writing a Voice of Customer (VoC) weekly digest for leadership.
Use ONLY the following data to write the report. Do not invent any numbers.

DATA:
${statsContext}

Format the report using Markdown. Include these sections:
- Executive Summary
- Sentiment Analysis
- Key Themes & Trends
- Notable Customer Quotes
- Recommended Actions
`
        const res = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { temperature: 0 }
        })
        markdownReport = res.text || ""
      } catch (err) {
        console.warn("AI generation failed for report, using silent fallback")
        markdownReport = `# Voice of Customer Report\n\n## Executive Summary\nWe received ${totalCount} feedback items during this period.\n\n## Key Themes\n${sortedThemes.map(t => `- **${t.name}**: ${t._count.feedbacks} mentions`).join('\n')}\n\n*Note: AI narrative generation is currently operating in offline fallback mode due to quota limits.*`
      }
    } else {
      markdownReport = `# Voice of Customer Report\n\n## Executive Summary\nWe received ${totalCount} feedback items during this period.\n\n## Key Themes\n${sortedThemes.map(t => `- **${t.name}**: ${t._count.feedbacks} mentions`).join('\n')}\n\n*Note: AI narrative generation requires an API key.*`
    }

    // 3. Save to database
    const report = await prisma.report.create({
      data: {
        title: `VoC Digest: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        periodStart: startDate,
        periodEnd: endDate,
        contentJson: JSON.stringify({ markdown: markdownReport, stats: { totalCount, posCount, negCount } }),
        workspaceId: user.workspaceId,
        generatedById: user.id
      }
    })

    return new Response(JSON.stringify(report), { status: 200 })
  } catch (error: any) {
    console.error("Report Generation Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
