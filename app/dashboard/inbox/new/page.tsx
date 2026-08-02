"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewFeedbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      content: formData.get("content"),
      channel: formData.get("channel"),
      customerLabel: formData.get("customerLabel") || undefined,
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error("Failed to add feedback")
      }

      router.push("/dashboard/inbox")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Add Feedback manually</h1>
        <Link href="/dashboard/inbox" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Back to Inbox
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <form onSubmit={handleSubmit} className="px-4 py-6 sm:p-8">
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">
                Feedback Content
              </label>
              <div className="mt-2">
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Paste customer feedback here..."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="channel" className="block text-sm font-medium leading-6 text-gray-900">
                Channel
              </label>
              <div className="mt-2">
                <select
                  id="channel"
                  name="channel"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                >
                  <option value="Support Ticket">Support Ticket</option>
                  <option value="App Store Review">App Store Review</option>
                  <option value="NPS Survey">NPS Survey</option>
                  <option value="Sales Call Note">Sales Call Note</option>
                  <option value="Community Post">Community Post</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="customerLabel" className="block text-sm font-medium leading-6 text-gray-900">
                Customer Label (Optional)
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="customerLabel"
                  id="customerLabel"
                  placeholder="e.g. Enterprise, Pro"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
