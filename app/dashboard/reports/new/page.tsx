"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Calendar } from "lucide-react"

export default function NewReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Default to last 7 days
  const today = new Date()
  const lastWeek = new Date()
  lastWeek.setDate(today.getDate() - 7)

  const [periodStart, setPeriodStart] = useState(lastWeek.toISOString().split('T')[0])
  const [periodEnd, setPeriodEnd] = useState(today.toISOString().split('T')[0])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodStart, periodEnd })
      })

      if (!res.ok) {
        let msg = "Failed to generate report"
        try {
          const data = await res.json()
          msg = data.error || msg
        } catch (_) {}
        throw new Error(msg)
      }

      const report = await res.json()
      router.push(`/dashboard/reports/${report.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-6 text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          Generate New VoC Report
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          The AI will read all feedback within the selected date range and synthesize a comprehensive narrative.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          {error && (
            <div className="p-4 text-red-700 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Start Date
              </label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                End Date
              </label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md ring-1 ring-inset ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Digest"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
