import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const rowSchema = z.object({
  content: z.string().min(1),
  channel: z.string().min(1),
  customerLabel: z.string().optional(),
})

const bulkSchema = z.array(rowSchema)

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  if (user.role === "VIEWER") return new Response("Forbidden", { status: 403 })

  try {
    const body = await req.json()
    const parsedData = bulkSchema.parse(body.feedbacks)

    let imported = 0
    let failed = 0

    // For better performance, we could use createMany, but createMany doesn't return created items easily in all adapters.
    // Also, we might want to trigger AI processing (Week 3) individually later. 
    // For now, we'll use createMany for speed since we just need the counts.
    
    const dataToInsert = parsedData.map(item => ({
      content: item.content,
      channel: item.channel,
      customerLabel: item.customerLabel,
      status: "NEW" as const,
      workspaceId: user.workspaceId
    }))

    const result = await prisma.feedback.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    })

    imported = result.count
    failed = parsedData.length - result.count

    return new Response(JSON.stringify({ imported, failed }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response("Invalid request data", { status: 400 })
  }
}
