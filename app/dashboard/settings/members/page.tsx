import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/db"

export default async function MembersPage() {
  const user = await requireAdmin()

  const members = await prisma.user.findMany({
    where: {
      workspaceId: user.workspaceId
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Workspace Members</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your workspace including their name, email, and role.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {members.map((member: {
                    id: string
                    name: string | null
                    email: string
                    role: string
                  }) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          member.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' :
                          member.role === 'ANALYST' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                          'bg-gray-50 text-gray-600 ring-gray-500/10'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
