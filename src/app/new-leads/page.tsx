"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import ProtectedLayout from "@/components/ProtectedLayout"
import LeadMetrics from "@/components/LeadMetrics"
import AppointmentSetters from "@/components/AppointmentSetters"
import LeadsTable from "@/components/LeadsTable"
import { useAuth } from "@/contexts/AuthContext"
import { useMetrics } from "@/hooks/useMetrics"

export default function NewLeadsPage() {
  const { user, businessData } = useAuth()
  const [timePeriod, setTimePeriod] = useState(30)

  const businessId = businessData?.business_id
  
  const {
    leads,
    leadMetrics,
    appointmentSetters,
    loading: metricsLoading
  } = useMetrics(timePeriod, businessId)

  if (metricsLoading) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-6 py-8 flex items-center justify-center">
          <div className="text-gray-600">Loading metrics...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">New Leads</h1>
              <p className="text-gray-600">Manage and track your incoming leads</p>
            </div>
            
            {/* Date Filter */}
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-500 mb-2">Date Filter</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LeadMetrics leadMetrics={leadMetrics} />
            <div>
              <AppointmentSetters appointmentSetters={appointmentSetters} />
            </div>
          </div>

          <LeadsTable leads={leads} />
        </div>
      </div>
    </ProtectedLayout>
  )
}