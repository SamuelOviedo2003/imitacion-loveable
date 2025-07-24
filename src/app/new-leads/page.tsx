"use client"

import { useState, useEffect } from "react"
import { Users, Phone, ChevronDown } from "lucide-react"
import { supabase } from '@/lib/supabase'
import Header from "@/components/Header"
import LeadMetrics from "@/components/LeadMetrics"
import RevenueMetrics from "@/components/RevenueMetrics"
import LeadsTable from "@/components/LeadsTable"
import AppointmentSetters from "@/components/AppointmentSetters"
import { useBusinessData } from "@/hooks/useBusinessData"
import { useMetrics } from "@/hooks/useMetrics"

export default function NewLeadsPage() {
  const [activeSection, setActiveSection] = useState("leads")
  const [user, setUser] = useState<any>(null)
  const [timePeriod, setTimePeriod] = useState(30)
  const [loading, setLoading] = useState(true)

  const { businessData } = useBusinessData(user?.id)
  const businessId = businessData?.business_id
  
  const {
    leads,
    leadMetrics,
    revenueMetrics,
    appointmentSetters,
    loading: metricsLoading
  } = useMetrics(timePeriod, businessId)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)
      setLoading(false)
    }
    
    fetchUser()
  }, [])

  const menuItems = [
    { id: "leads", icon: Users, label: "New Leads" },
    { id: "setters", icon: Phone, label: "Appointment Setters" },
  ]

  if (loading || metricsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center" style={{ backgroundColor: "#E8F4F8" }}>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ backgroundColor: "#E8F4F8" }}>
      <div className="relative">
        <Header user={user} />

        <div className="container mx-auto px-6">
          <div className="flex mt-6">
            {/* Sidebar */}
            <div className="w-20 bg-white p-4 flex flex-col items-center min-h-[calc(100vh-140px)] rounded-r-3xl shadow-lg border border-gray-100">
              <nav className="flex flex-col space-y-4 mt-8">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </button>
                ))}
              </nav>
              <div className="flex-1"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Content based on active section */}
              {activeSection === "leads" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">New Leads</h1>
                      <p className="text-gray-600">Manage and track your incoming leads</p>
                    </div>
                    
                    {/* Global Date Filter */}
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500 mb-2">Date Filter (affects all data)</p>
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
                    <RevenueMetrics revenueMetrics={revenueMetrics} />
                  </div>

                  <LeadsTable leads={leads} />
                </div>
              )}

              {activeSection === "setters" && (
                <AppointmentSetters appointmentSetters={appointmentSetters} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}