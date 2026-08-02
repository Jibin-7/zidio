"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("React Error Boundary Caught:", error)
  }, [error])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="rounded-xl bg-white p-8 shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-8 text-sm">
          We experienced an unexpected error. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
