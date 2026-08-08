import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"

import BackfillButton from "./BackfillButton"

export default async function TrendsPage() {
  const user = await requireAuth()

  // Get all themes with their counts
  const themes = await prisma.theme.findMany({
    where: { workspaceId: user.workspaceId },
    include: {
      _count: {
        select: { feedbacks: true }
      }
    },
    orderBy: {
      feedbacks: {
        _count: 'desc'
      }
    }
  })

  // Determine unclassified items count for backfill prompt
  const unclassifiedCount = await prisma.feedback.count({
    where: { workspaceId: user.workspaceId, sentiment: null }
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Theme Trends</h1>
          <p className="mt-2 text-sm text-gray-700">
            AI-extracted themes and feature areas from customer feedback.
          </p>
        </div>
      </div>

      {unclassifiedCount > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm">
          <h3 className="text-sm font-semibold text-yellow-800">Unclassified Data Detected</h3>
          <p className="mt-1 text-sm text-yellow-700">
            You have {unclassifiedCount} feedback items that haven't been processed by AI yet.
          </p>
          <BackfillButton />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme: {
          id: string
          name: string
          description: string | null
          _count: { feedbacks: number }
        }) => (
          <div key={theme.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate" title={theme.name}>{theme.name}</h3>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {theme._count.feedbacks} items
              </span>
            </div>
            {theme.description && (
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                {theme.description}
              </p>
            )}
            <Link 
              href={`/dashboard/inbox?theme=${encodeURIComponent(theme.name)}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-auto"
            >
              View feedback &rarr;
            </Link>
          </div>
        ))}

        {themes.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            No themes found. Import feedback and wait for the AI to classify it.
          </div>
        )}
      </div>
    </div>
  )
}
