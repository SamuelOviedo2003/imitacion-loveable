import { Card } from "@/components/ui/card"
import Link from "next/link"
import Header from "@/components/Header"

export default function IncomingCallsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ backgroundColor: "#E8F4F8" }}>
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <Header />

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Incoming Calls</h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>
        </main>
      </div>
    </div>
  )
}