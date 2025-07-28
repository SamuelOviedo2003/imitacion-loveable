"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import ProtectedLayout from "@/components/ProtectedLayout"
import SourceDistributionChart from "@/components/SourceDistributionChart"
import CallerTypeDistributionChart from "@/components/CallerTypeDistributionChart"
import SourceToCallerTypeSankey from "@/components/SourceToCallerTypeSankey"
import RecentIncomingCallsTable from "@/components/RecentIncomingCallsTable"
import { useAuth } from "@/contexts/AuthContext"
import { useIncomingCallsData } from "@/hooks/useIncomingCallsData"

export default function IncomingCallsPage() {
  const { user } = useAuth()
  const [timePeriod, setTimePeriod] = useState(30)

  const {
    calls,
    sourceData,
    callerTypeData,
    sankeyData,
    loading,
    error
  } = useIncomingCallsData(user?.id, timePeriod)

  console.log('🏠 [IncomingCallsPage] Rendering with:', {
    userId: user?.id,
    userEmail: user?.email,
    callsCount: calls.length,
    timePeriod,
    loading,
    error
  })

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header with Time Filter */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Incoming Calls</h1>
              <p className="text-gray-600">Monitor and analyze your lead data from all sources</p>
            </div>
            
            {/* Global Time Filter */}
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-500 mb-2">Time Period</p>
              <div className="relative">
                <select 
                  value={timePeriod} 
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">Error loading data</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
            </div>
          )}


          {/* Charts Grid */}
          {!error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SourceDistributionChart data={sourceData} loading={loading} />
              <CallerTypeDistributionChart data={callerTypeData} loading={loading} />
            </div>
          )}

          {/* Recent Incoming Calls Table */}
          {!error && (
            <RecentIncomingCallsTable calls={calls} loading={loading} />
          )}

          {/* Sankey Diagram - Full Width */}
          {!error && (
            <SourceToCallerTypeSankey data={sankeyData} loading={loading} />
          )}

        </div>
      </div>
    </ProtectedLayout>
  )
}