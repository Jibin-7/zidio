import { requireAuth } from "@/lib/session"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Inbox, 
  Settings, 
  LogOut, 
  BarChart3, 
  Sparkles,
  FileText,
  Home,
  PieChart
} from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 font-bold text-xl text-indigo-600">
          LOOP
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <Home className="w-5 h-5 text-gray-500" />
            Dashboard
          </Link>
          <Link href="/dashboard/inbox" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <Inbox className="w-5 h-5 text-gray-500" />
            Inbox
          </Link>
          <Link href="/dashboard/ask" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
            <span className="w-5 h-5 text-indigo-500 font-bold flex items-center justify-center">✨</span>
            Ask LOOP
          </Link>
          <Link href="/dashboard/trends" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <PieChart className="w-5 h-5 text-gray-500" />
            Trends
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <FileText className="w-5 h-5 text-gray-500" />
            Reports
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/dashboard/settings/members" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <Settings className="w-5 h-5 text-gray-500" />
              Settings
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-2">
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
