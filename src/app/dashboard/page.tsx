import ProtectedLayout from "@/components/ProtectedLayout"

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600">This page is under construction.</p>
        </div>
      </main>
    </ProtectedLayout>
  )
}