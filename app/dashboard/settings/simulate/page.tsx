"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const MOCK_DATA = {
  zendesk: [
    { content: "The billing page keeps timing out when I try to download an invoice.", channel: "Support Ticket" },
    { content: "How do I invite more members to my workspace?", channel: "Support Ticket" },
    { content: "Please cancel my subscription, the software is too hard to use.", channel: "Support Ticket" }
  ],
  appstore: [
    { content: "Love the new export feature, saved me an hour today. 5 stars!", channel: "App Store Review" },
    { content: "App crashes every time I open the dashboard on iOS 17.", channel: "App Store Review" },
    { content: "It's decent, but I wish there was a dark mode.", channel: "App Store Review" }
  ],
  sales: [
    { content: "Prospect wants SSO before they'll sign — third time this month we've heard this.", channel: "Sales Call Note" },
    { content: "Customer loves the UI, ready to upgrade to Enterprise.", channel: "Sales Call Note" }
  ]
}

export default function SimulateChannelsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null)

  const triggerSimulation = async (source: keyof typeof MOCK_DATA) => {
    setLoading(source)
    setMessage(null)

    try {
      const data = MOCK_DATA[source]
      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbacks: data })
      })

      if (!res.ok) throw new Error("Simulation failed")

      const result = await res.json()
      setMessage({ type: 'success', text: `Simulated ${result.imported} items from ${source} successfully!` })
      router.refresh()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold leading-6 text-gray-900 mb-6">Simulate Channel Integrations</h1>
      
      <p className="text-sm text-gray-600 mb-8">
        Use these controls to simulate live feedback flowing in from external integrations like Zendesk, App Stores, and CRMs.
      </p>

      {message && (
        <div className={`mb-6 p-4 text-sm rounded-md border ${message.type === 'success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Zendesk */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Zendesk Simulator</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Simulates a sync of 3 recent support tickets. Includes bug reports and help requests.
          </p>
          <button
            onClick={() => triggerSimulation('zendesk')}
            disabled={loading !== null}
            className="w-full rounded-md bg-[#03363D] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading === 'zendesk' ? "Syncing..." : "Sync Zendesk Tickets"}
          </button>
        </div>

        {/* App Store */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">App Store Reviews</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Simulates pulling new reviews from the iOS App Store.
          </p>
          <button
            onClick={() => triggerSimulation('appstore')}
            disabled={loading !== null}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
          >
            {loading === 'appstore' ? "Syncing..." : "Fetch New Reviews"}
          </button>
        </div>

        {/* Salesforce / CRM */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CRM Call Notes</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Simulates pushing meeting notes and prospect requests from the sales team.
          </p>
          <button
            onClick={() => triggerSimulation('sales')}
            disabled={loading !== null}
            className="w-full rounded-md bg-blue-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-300 disabled:opacity-50"
          >
            {loading === 'sales' ? "Syncing..." : "Pull CRM Notes"}
          </button>
        </div>

      </div>
    </div>
  )
}
