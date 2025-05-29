// src/app/dashboard/layout.tsx
import Sidebar from '@/components/dashboard/sidebar/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Header */}
        
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}