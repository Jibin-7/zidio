"use client"

import { useEffect, useState, useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const SENTIMENT_COLORS: Record<string, string> = { 'POS': '#10B981', 'NEU': '#6B7280', 'NEG': '#EF4444' }

type DashboardClientProps = {
  totalFeedback: number
  percentNegative: number
  newThisWeek: number
  volumeData: { name: string, count: number }[]
  sentimentData: { name: string, value: number }[]
  themesData: { name: string, count: number }[]
}

export default function DashboardClient({
  totalFeedback,
  percentNegative,
  newThisWeek,
  volumeData,
  sentimentData,
  themesData
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleExportPDF = () => {
    // html2canvas struggles with modern CSS colors like oklch() used by Tailwind v4.
    // Native window.print() produces a vector PDF (crisp text, selectable) without crashing.
    window.print()
  }

  if (!mounted) return null // Prevent hydration errors with Recharts

  return (
    <div ref={dashboardRef} className="p-8 space-y-8 bg-gray-50 min-h-full">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of customer feedback volume, sentiment, and key themes.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none print:hidden">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-gray-100">
          <dt className="text-sm font-medium truncate text-gray-500">Total Feedback</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalFeedback}</dd>
        </div>
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-gray-100">
          <dt className="text-sm font-medium truncate text-gray-500">% Negative Sentiment</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">{percentNegative}%</dd>
        </div>
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 border border-gray-100">
          <dt className="text-sm font-medium truncate text-gray-500">New This Week</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">{newThisWeek}</dd>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Volume Over Time */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-100">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Feedback Volume (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-100">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Sentiment Breakdown</h3>
          <div className="h-72">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Not enough data.</div>
            )}
          </div>
        </div>

        {/* Top Themes */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-100 lg:col-span-2">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Top Themes</h3>
          <div className="h-80">
            {themesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={themesData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Not enough data.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
