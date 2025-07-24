"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { supabase } from '@/lib/supabase'
import Header from "@/components/Header"
import AppointmentSetters from "@/components/AppointmentSetters"
import { useBusinessData } from "@/hooks/useBusinessData"
import { useMetrics } from "@/hooks/useMetrics"

export default function AppointmentSettersPage() {
  const [user, setUser] = useState<any>(null)
  const [timePeriod, setTimePeriod] = useState(30)
  const [loading, setLoading] = useState(true)

  const { businessData } = useBusinessData(user?.id)
  const businessId = businessData?.business_id
  
  const {
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

        <div className="container mx-auto px-6 py-8">
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Setters</h1>
                <p className="text-gray-600">Performance metrics for your appointment setters</p>
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

            <AppointmentSetters appointmentSetters={appointmentSetters} />
          </div>
        </div>
      </div>
    </div>
  )
}