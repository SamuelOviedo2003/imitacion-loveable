"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import ProtectedLayout from "@/components/ProtectedLayout"
import LeadMetrics from "@/components/LeadMetrics"
import AppointmentSetters from "@/components/AppointmentSetters"
import LeadsTable from "@/components/LeadsTable"
import LoadingScreen from "@/components/LoadingScreen"
import { useAuth } from "@/contexts/AuthContext"
import { useMetrics } from "@/hooks/useMetrics"

export default function NewLeadsPage() {
  const { businessData } = useAuth()
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
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <LoadingScreen 
            message="Loading lead metrics..."
            size="lg"
          />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-6 py-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">New Leads</h1>
                <p className="text-lg text-gray-600">Manage and track your incoming leads with ease</p>
              </div>
              
              {/* Modern Date Filter */}
              <div className="flex flex-col items-start md:items-end">
                <p className="text-sm font-medium text-gray-700 mb-3">Time Period</p>
                <div className="relative">
                  <select 
                    value={timePeriod} 
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="appearance-none modern-card bg-white border-0 shadow-md px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:shadow-lg w-48 transition-all duration-200"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={15}>Last 15 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modern Card Grid */}
            <div className="grid-modern-2">
              <div className="modern-card pastel-card-mint">
                <LeadMetrics leadMetrics={leadMetrics} />
              </div>
              <div className="modern-card pastel-card-lavender">
                <AppointmentSetters appointmentSetters={appointmentSetters} />
              </div>
            </div>

            {/* Leads Table in Modern Card */}
            <div className="modern-card">
              <LeadsTable leads={leads} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}