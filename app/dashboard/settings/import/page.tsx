"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"

export default function ImportFeedbackPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number, failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedData = results.data.map((row: any) => ({
            content: row.content || row.text || row.feedback,
            channel: row.channel || row.source || "CSV Import",
            customerLabel: row.customer_label || row.customerLabel || undefined
          })).filter(row => row.content && row.channel)

          if (formattedData.length === 0) {
            throw new Error("No valid rows found. Please check column headers (expected: content, channel).")
          }

          const res = await fetch("/api/feedback/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feedbacks: formattedData })
          })

          if (!res.ok) {
            throw new Error("Server error during import.")
          }

          const data = await res.json()
          setResult(data)
          setFile(null)
          
          // Reset file input
          const fileInput = document.getElementById('csv-upload') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      error: (err) => {
        setError("Error parsing CSV file: " + err.message)
        setLoading(false)
      }
    })
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold leading-6 text-gray-900 mb-6">Bulk Import Feedback</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV file containing feedback data. The file must have headers. 
          Expected columns are <strong>content</strong> and <strong>channel</strong> (optional: <strong>customer_label</strong>).
        </p>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
            Successfully imported {result.imported} rows. {result.failed > 0 && `${result.failed} rows failed.`}
          </div>
        )}

        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
              <label
                htmlFor="csv-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <span>Upload a CSV file</span>
                <input id="csv-upload" name="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xs leading-5 text-gray-600 mt-2">
              {file ? file.name : "or drag and drop"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Importing..." : "Run Import"}
          </button>
        </div>
      </div>
    </div>
  )
}
