"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function BackfillButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBackfill = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/feedback/backfill", {
        method: "POST"
      })
      if (!res.ok) throw new Error("Failed to process data")
      
      router.refresh()
    } catch (error) {
      alert("Error processing data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBackfill}
      disabled={loading}
      className="mt-3 rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 disabled:opacity-50"
    >
      {loading ? "Processing with AI..." : "Run AI Classification now"}
    </button>
  )
}
