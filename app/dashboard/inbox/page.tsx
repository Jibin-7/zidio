import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Plus, Search } from "lucide-react"

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await requireAuth()

  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined
  const channel = typeof resolvedParams.channel === 'string' ? resolvedParams.channel : undefined
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined
  const theme = typeof resolvedParams.theme === 'string' ? resolvedParams.theme : undefined
  const sentiment = typeof resolvedParams.sentiment === 'string' ? resolvedParams.sentiment : undefined
  const startDate = typeof resolvedParams.startDate === 'string' ? resolvedParams.startDate : undefined
  const endDate = typeof resolvedParams.endDate === 'string' ? resolvedParams.endDate : undefined

  const limit = 20
  const skip = (page - 1) * limit

  const where: any = { workspaceId: user.workspaceId }
  if (search) where.content = { contains: search, mode: 'insensitive' }
  if (channel) where.channel = channel
  if (status) where.status = status
  if (theme) where.themes = { some: { theme: { name: theme } } }
  if (sentiment) where.sentiment = sentiment
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setUTCHours(23, 59, 59, 999) // Include the whole end day
      where.createdAt.lte = end
    }
  }

  const feedbacks = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  })

  const total = await prisma.feedback.count({ where })
  const totalPages = Math.ceil(total / limit)

  // Helper for pagination link
  const getPageUrl = (p: number) => {
    const params = new URLSearchParams()
    params.set('page', p.toString())
    if (search) params.set('search', search)
    if (channel) params.set('channel', channel)
    if (status) params.set('status', status)
    if (theme) params.set('theme', theme)
    if (sentiment) params.set('sentiment', sentiment)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return `/dashboard/inbox?${params.toString()}`
  }

  return (
    <div className="p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Feedback Inbox</h1>
        </div>
        <div className="mt-4 flex gap-3 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/settings/import"
            className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Import CSV
          </Link>
          <Link
            href="/dashboard/inbox/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" />
            Add Feedback
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4">
        {theme && (
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 w-fit">
            Filtered by theme: {theme}
          </div>
        )}
        <form className="flex flex-col xl:flex-row gap-4 w-full">
          {theme && <input type="hidden" name="theme" value={theme} />}
          
          <div className="relative flex-1 min-w-[200px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              name="search"
              defaultValue={search}
              type="text"
              placeholder="Search feedback..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="flex flex-wrap gap-3 flex-1 lg:flex-none">
            <select
              name="channel"
              defaultValue={channel || ""}
              className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Channels</option>
              <option value="Support Ticket">Support Ticket</option>
              <option value="App Store Review">App Store Review</option>
              <option value="NPS Survey">NPS Survey</option>
              <option value="Sales Call Note">Sales Call Note</option>
            </select>

            <select
              name="status"
              defaultValue={status || ""}
              className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </select>

            <select
              name="sentiment"
              defaultValue={sentiment || ""}
              className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>

            <div className="flex items-center gap-2">
              <input 
                type="date" 
                name="startDate" 
                defaultValue={startDate || ""}
                title="Start Date"
                className="block rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input 
                type="date" 
                name="endDate" 
                defaultValue={endDate || ""}
                title="End Date"
                className="block rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <button type="submit" className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-md hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200">
              Apply
            </button>
            {(search || channel || status || sentiment || startDate || endDate) && (
              <Link href="/dashboard/inbox" className="px-3 py-1.5 text-gray-500 text-sm font-medium hover:text-gray-700 flex items-center">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-1/2">
                      Content
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Channel
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {feedbacks.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                        <div className="line-clamp-2">{item.content}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.channel}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <form action={async () => {
                          "use server"
                          // toggle status inline
                          const nextStatus = item.status === 'NEW' ? 'REVIEWED' : item.status === 'REVIEWED' ? 'ACTIONED' : 'NEW'
                          await prisma.feedback.update({ where: { id: item.id }, data: { status: nextStatus } })
                        }}>
                          <button type="submit" className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            item.status === 'NEW' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                            item.status === 'REVIEWED' ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10' :
                            'bg-green-50 text-green-700 ring-green-700/10'
                          }`}>
                            {item.status}
                          </button>
                        </form>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {item.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {feedbacks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                        No feedback found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:justify-end gap-2">
                    {page > 1 && (
                      <Link
                        href={`/dashboard/inbox?page=${page - 1}&search=${search||''}&channel=${channel||''}&status=${status||''}&theme=${theme||''}`}
                        className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={`/dashboard/inbox?page=${page + 1}&search=${search||''}&channel=${channel||''}&status=${status||''}&theme=${theme||''}`}
                        className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
