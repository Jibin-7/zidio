import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/db"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const user = await requireAuth()
  const workspaceId = user.workspaceId

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Fetch counts
  const totalFeedback = await prisma.feedback.count({ where: { workspaceId } })
  const newThisWeek = await prisma.feedback.count({
    where: { workspaceId, createdAt: { gte: sevenDaysAgo } }
  })
  const negCount = await prisma.feedback.count({
    where: { workspaceId, sentiment: "NEG" }
  })
  const percentNegative =
    totalFeedback > 0 ? Math.round((negCount / totalFeedback) * 100) : 0

  // Fetch sentiment breakdown
  const sentimentGroups = await prisma.feedback.groupBy({
    by: ["sentiment"],
    where: { workspaceId, sentiment: { not: null } },
    _count: true
  })
  const sentimentData = sentimentGroups.map(
    (g: { sentiment: string | null; _count: number }) => ({
      name: g.sentiment ?? "UNKNOWN",
      value: g._count
    })
  )

  // Fetch top themes
  const topThemes = await prisma.theme.findMany({
    where: { workspaceId },
    include: { _count: { select: { feedbacks: true } } },
    orderBy: { feedbacks: { _count: "desc" } },
    take: 5
  })
  const themesData = topThemes.map(
    (t: { name: string; _count: { feedbacks: number } }) => ({
      name: t.name,
      count: t._count.feedbacks
    })
  )

  // Fetch volume over time (last 7 days)
  const recentFeedback = await prisma.feedback.findMany({
    where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true }
  })

  // Group volume by day
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const volumeMap = new Map<string, number>()

  // Initialise last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    volumeMap.set(days[d.getDay()], 0)
  }

  recentFeedback.forEach((f: { createdAt: Date }) => {
    const dayName = days[f.createdAt.getDay()]
    if (volumeMap.has(dayName)) {
      volumeMap.set(dayName, volumeMap.get(dayName)! + 1)
    }
  })

  const volumeData = Array.from(volumeMap.entries()).map(
    ([name, count]) => ({ name, count })
  )

  return (
    <DashboardClient
      totalFeedback={totalFeedback}
      percentNegative={percentNegative}
      newThisWeek={newThisWeek}
      volumeData={volumeData}
      sentimentData={sentimentData}
      themesData={themesData}
    />
  )
}