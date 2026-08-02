"use client"

import { useState } from "react"
import { Search, Sparkles, Copy, CheckCircle2, MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"

type Source = { id: string, content: string, channel: string }

export default function AskLoopPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<{ answer: string, sources: Source[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)
    setCopied(false)

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })

      if (!res.ok) {
        let backendError = "Failed to get an answer. Please try again."
        try {
          const errData = await res.json()
          if (errData.error) backendError = errData.error
        } catch (_) {}
        throw new Error(backendError)
      }

      const data = await res.json()
      setResponse(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8 text-center mt-6">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Ask LOOP
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Query your feedback database using natural language. LOOP uses semantic search to find the exact context and generates a summarized report.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <form onSubmit={handleAsk} className="p-4 bg-gray-50/80 border-b border-gray-200 sticky top-0 z-10">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything... e.g., 'What are users saying about the reporting feature?'"
              className="block w-full rounded-full border-0 py-4 pl-12 pr-32 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base bg-white transition-all hover:ring-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 rounded-full bg-indigo-600 px-6 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Thinking..." : "Generate"}
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-b from-white to-gray-50/50">
          {error && (
            <div className="max-w-4xl mx-auto p-4 text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          {!response && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <MessageSquare className="w-16 h-16 text-gray-200 mb-6 stroke-1" />
              <p className="text-lg text-gray-500">Ready to analyze your customer feedback.</p>
              <div className="flex gap-3 mt-8 flex-wrap justify-center max-w-2xl">
                {["Why are customers cancelling?", "What do people love most?", "Summarize feedback about billing"].map((suggestion) => (
                  <button 
                    key={suggestion}
                    type="button" 
                    onClick={() => setQuery(suggestion)} 
                    className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-indigo-500 py-32">
              <div className="relative flex justify-center items-center w-20 h-20 mb-4">
                <div className="absolute w-full h-full border-4 border-indigo-100 rounded-full" />
                <div className="absolute w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <p className="font-medium text-lg animate-pulse text-indigo-800">Synthesizing insights...</p>
            </div>
          )}

          {response && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">AI Synthesis</h3>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Report"}
                    </button>
                  </div>
                  <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed marker:text-indigo-400 prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
                    <ReactMarkdown>{response.answer}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Sources Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Cited Sources ({response.sources.length})
                  </h4>
                  {response.sources.length > 0 ? (
                    <ul className="space-y-4">
                      {response.sources.map((source, index) => (
                        <li key={source.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold ring-1 ring-inset ring-indigo-600/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {index + 1}
                            </span>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              {source.channel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic line-clamp-4 group-hover:line-clamp-none transition-all">"{source.content}"</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 text-center">
                      No exact sources found.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
