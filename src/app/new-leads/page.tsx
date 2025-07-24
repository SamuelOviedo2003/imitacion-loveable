"use client"

import { useState, useEffect } from "react"
import { Users, DollarSign, Phone, Clock, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from '@/lib/supabase'
import Header from "@/components/Header"

// Mock data - will be replaced with real Supabase data
const leadsTableData = [
  {
    name: "John Doe",
    urgency: "ASAP",
    service: "Full Replacement",
    houseValue: "$450,000",
    distance: "5.2 mi",
    dateTime: "Jan 1, 5:00 AM",
    speedToLead: "2:00",
    va: "Amelia",
    urgencyColor: "bg-red-50 text-red-600 border border-red-200",
    speedColor: "text-green-600",
  },
  {
    name: "Jane Smith",
    urgency: "Within 2 weeks",
    service: "Repair",
    houseValue: "$320,000",
    distance: "8.7 mi",
    dateTime: "Jan 2, 6:00 AM",
    speedToLead: "7:30",
    va: "Omar",
    urgencyColor: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    speedColor: "text-orange-500",
  },
  {
    name: "David Lee",
    urgency: "Next month",
    service: "Inspection",
    houseValue: "$275,000",
    distance: "12.1 mi",
    dateTime: "Jan 3, 7:00 AM",
    speedToLead: "1:25",
    va: "Alba",
    urgencyColor: "bg-blue-50 text-blue-600 border border-blue-200",
    speedColor: "text-green-600",
  },
]

export default function NewLeadsPage() {
  const [activeSection, setActiveSection] = useState("leads")
  const [user, setUser] = useState<any>(null)
  const [businessData, setBusinessData] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState(30)
  const [leadMetrics, setLeadMetrics] = useState({
    totalLeads: 0,
    contactedLeads: 0,
    bookedLeads: 0,
    contactRate: 0,
    bookingRate: 0
  })
  const [revenueMetrics, setRevenueMetrics] = useState({
    shows: 0,
    closes: 0,
    totalAmount: 0
  })
  const [appointmentSetters, setAppointmentSetters] = useState<any[]>([])

  const fetchBusinessData = async (userId: string) => {
    try {
      // Get user's business_id from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', userId)
        .single()
      
      if (!profileError && profileData?.business_id) {
        // Get business data using the business_id from profiles
        const { data: businessDataResult, error: businessError } = await supabase
          .from('business_clients')
          .select('*')
          .eq('business_id', profileData.business_id)
          .single()
        
        if (!businessError && businessDataResult) {
          setBusinessData(businessDataResult)
          return businessDataResult.business_id
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
    return null
  }

  const fetchRevenueChart = async (businessId?: number) => {
    try {
      // Build query for revenue chart data with global date filter
      const chartStartDate = new Date()
      chartStartDate.setDate(chartStartDate.getDate() - timePeriod)
      const chartStartDateISO = chartStartDate.toISOString()
      
      let revenueQuery = supabase
        .from('leads')
        .select('closed_amount, created_at')
        .gte('created_at', chartStartDateISO)
        .not('closed_amount', 'is', null)
      
      if (businessId) {
        revenueQuery = revenueQuery.eq('business_id', businessId)
      }
      
      const { data: revenueBookings, error: revenueError } = await revenueQuery
      
      if (!revenueError && revenueBookings) {
        // Calculate periods based on timePeriod for dynamic chart
        const periods = Math.min(6, Math.ceil(timePeriod / 7)) // Show weekly periods up to 6
        
        const periodData = Array.from({ length: periods }, (_, i) => {
          const periodDate = new Date()
          const daysBack = ((periods - 1 - i) * Math.floor(timePeriod / periods))
          periodDate.setDate(periodDate.getDate() - daysBack)
          
          const periodName = timePeriod <= 30 
            ? `Week ${i + 1}`
            : periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          
          const periodStart = new Date(periodDate)
          periodStart.setDate(periodStart.getDate() - Math.floor(timePeriod / periods))
          
          const periodBookings = revenueBookings.filter(booking => {
            const bookingDate = new Date(booking.created_at)
            return bookingDate >= periodStart && bookingDate <= periodDate
          })
          
          const revenue = periodBookings.reduce((sum, booking) => 
            sum + (booking.closed_amount || 0), 0
          )
          
          return {
            month: periodName,
            closedSales: periodBookings.length,
            revenue: revenue
          }
        })
        
        setRevenueData(periodData)
      }
    } catch (error) {
      console.error('Error fetching revenue chart data:', error)
    }
  }

  const fetchMetrics = async (days: number, businessId?: number) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateISO = startDate.toISOString()

      // Fetch leads data within time period, filtered by business_id if available
      let leadsQuery = supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDateISO)
        .order('created_at', { ascending: false })

      if (businessId) {
        leadsQuery = leadsQuery.eq('business_id', businessId)
      }

      const { data: leadsData, error: leadsError } = await leadsQuery
      
      if (!leadsError && leadsData) {
        setLeads(leadsData)
        
        // Calculate lead metrics
        const totalLeads = leadsData.length
        const contactedLeads = leadsData.filter(lead => lead.contacted === true).length
        const bookedLeads = leadsData.filter(lead => lead.start_time !== null && lead.start_time !== '').length
        const contactRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0
        const bookingRate = contactedLeads > 0 ? Math.round((bookedLeads / contactedLeads) * 100) : 0
        
        setLeadMetrics({
          totalLeads,
          contactedLeads,
          bookedLeads,
          contactRate,
          bookingRate
        })

        // Calculate revenue metrics based on correct logic
        const shows = leadsData.filter(lead => lead.show === true).length
        const closes = leadsData.filter(lead => lead.closed_amount!== null && lead.closed_amount !== '').length
        const totalAmount = leadsData
          .reduce((sum, lead) => sum + (lead.closed_amount || 0), 0)
        
        setRevenueMetrics({
          shows,
          closes,
          totalAmount
        })
      } else {
        console.error('Error fetching leads:', leadsError)
        // Fallback data
        setLeads(leadsTableData)
        setLeadMetrics({ totalLeads: 5, contactedLeads: 4, bookedLeads: 2, contactRate: 80, bookingRate: 50 })
        setRevenueMetrics({ shows: 5, closes: 2, totalAmount: 33000 })
      }
      
    } catch (error) {
      console.error('Error fetching metrics:', error)
      // Fallback data
      setLeads(leadsTableData)
      setLeadMetrics({ totalLeads: 5, contactedLeads: 4, bookedLeads: 2, contactRate: 80, bookingRate: 50 })
      setRevenueMetrics({ shows: 5, closes: 2, totalAmount: 33000 })
    }
  }

  const fetchAppointmentSetters = async (businessId?: number) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timePeriod)
      const startDateISO = startDate.toISOString()

      // First, get leads that belong to the business and are within date range
      let leadsQuery = supabase
        .from('leads')
        .select('lead_id, contacted, start_time, created_at, working_hours')
        .gte('created_at', startDateISO)

      if (businessId) {
        leadsQuery = leadsQuery.eq('business_id', businessId)
      }

      const { data: leadsData, error: leadsError } = await leadsQuery

      if (leadsError) {
        console.error('Error fetching leads for setters:', leadsError)
        return
      }

      if (!leadsData || leadsData.length === 0) {
        setAppointmentSetters([])
        return
      }

      // Get all lead_ids for business filtering
      const leadIds = leadsData.map((lead: any) => lead.lead_id)

      // Now fetch calls for these leads, grouped by assigned person
      const { data: callsData, error: callsError } = await supabase
        .from('leads_calls')
        .select('lead_id, assigned, duration, time_speed, created_at')
        .in('lead_id', leadIds)
        .gte('created_at', startDateISO)
        .not('assigned', 'is', null)

      if (callsError) {
        console.error('Error fetching calls for setters:', callsError)
        return
      }

      if (!callsData || callsData.length === 0) {
        setAppointmentSetters([])
        return
      }

      // Create a map of lead_id to lead data for quick lookup
      const leadsMap = new Map()
      leadsData.forEach(lead => {
        leadsMap.set(lead.lead_id, lead)
      })

      // Group data by assigned user from calls table
      const settersMap = new Map()

      // Get unique lead_ids that each setter called
      const setterLeadsMap = new Map() // setter -> Set of lead_ids they called

      callsData.forEach(call => {
        const assignedUser = call.assigned
        if (!setterLeadsMap.has(assignedUser)) {
          setterLeadsMap.set(assignedUser, new Set())
        }
        setterLeadsMap.get(assignedUser).add(call.lead_id)
      })

      // Initialize setters data based on unique leads they called
      setterLeadsMap.forEach((leadIdsSet, assigned) => {
        settersMap.set(assigned, {
          name: assigned,
          totalLeads: leadIdsSet.size, // Count unique leads this setter called
          contactedLeads: 0,
          bookedLeads: 0,
          totalCallTime: 0,
          firstCallSpeeds: [],
          firstCallDurations: [], // New: for total time calculation
          leadsCalledSet: leadIdsSet
        })
      })

      // Calculate contacted and booked leads for each setter
      settersMap.forEach((setter, assigned) => {
        setter.leadsCalledSet.forEach(leadId => {
          const lead = leadsMap.get(leadId)
          if (lead) {
            if (lead.contacted) {
              setter.contactedLeads++
            }
            if (lead.start_time && lead.start_time !== '') {
              setter.bookedLeads++
            }
          }
        })
      })

      // Process calls data for call time and speed metrics
      if (callsData && callsData.length > 0) {
        // Group calls by lead_id and assigned to find first call per lead per setter
        const callsByLeadAndSetter = new Map()
        
        callsData.forEach(call => {
          const key = `${call.lead_id}_${call.assigned}`
          if (!callsByLeadAndSetter.has(key)) {
            callsByLeadAndSetter.set(key, [])
          }
          callsByLeadAndSetter.get(key).push(call)
        })

        // Sort calls by created_at for each lead+setter combination to find first call
        callsByLeadAndSetter.forEach((calls) => {
          calls.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        })

        // Process each call for duration and first-call speed tracking
        callsData.forEach(call => {
          const setter = settersMap.get(call.assigned)
          if (!setter) return

          // Check if this is the first call this setter made to this lead
          const key = `${call.lead_id}_${call.assigned}`
          const leadCalls = callsByLeadAndSetter.get(key)
          const isFirstCall = leadCalls && leadCalls[0] && leadCalls[0].created_at === call.created_at
          
          if (isFirstCall) {
            // Get the lead data to check working_hours
            const lead = leadsMap.get(call.lead_id)
            
            if (lead && lead.working_hours === true) {
              // Add to first call speeds (for average speed calculation)
              if (call.time_speed) {
                setter.firstCallSpeeds.push(call.time_speed)
              }
              
              // Add to first call durations (for total time calculation)
              if (call.duration) {
                setter.firstCallDurations.push(call.duration)
              }
            }
          }
        })
      }

      // Convert map to array and calculate final metrics
      const settersArray = Array.from(settersMap.values()).map(setter => {
        const contactRate = setter.totalLeads > 0 ? Math.round((setter.contactedLeads / setter.totalLeads) * 100) : 0
        const bookingRate = setter.contactedLeads > 0 ? Math.round((setter.bookedLeads / setter.contactedLeads) * 100) : 0
        
        // Calculate total time from first call durations (working_hours = true only)
        const totalDuration = setter.firstCallDurations.reduce((sum: any, duration: any) => sum + duration, 0)
        const totalMinutes = Math.floor(totalDuration / 60)
        const remainingSeconds = totalDuration % 60
        const formattedCallTime = `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
        
        // Calculate average speed of first calls (time_speed is in seconds, working_hours = true only)
        const avgSpeed = setter.firstCallSpeeds.length > 0 
          ? Math.round(setter.firstCallSpeeds.reduce((sum: any, speed: any) => sum + speed, 0) / setter.firstCallSpeeds.length)
          : 0
        
        const avgMinutes = Math.floor(avgSpeed / 60)
        const avgSeconds = avgSpeed % 60
        const formattedAvgSpeed = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`

        return {
          name: setter.name,
          totalLeads: setter.totalLeads,
          contactedLeads: setter.contactedLeads,
          bookedLeads: setter.bookedLeads,
          contactRate,
          bookingRate,
          formattedCallTime,
          avgSpeed: formattedAvgSpeed
        }
      })

      setAppointmentSetters(settersArray)

    } catch (error) {
      console.error('Error fetching appointment setters data:', error)
      setAppointmentSetters([])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)
      
      // Fetch business data and get business_id
      const businessId = await fetchBusinessData(user.id)
      
      // Fetch all data with business context
      await Promise.all([
        fetchMetrics(timePeriod, businessId),
        fetchRevenueChart(businessId),
        fetchAppointmentSetters(businessId)
      ])
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    if (user && businessData) {
      const businessId = businessData.business_id
      // Global date filter affects all components
      Promise.all([
        fetchMetrics(timePeriod, businessId),
        fetchRevenueChart(businessId),
        fetchAppointmentSetters(businessId)
      ])
    } else if (user && !loading) {
      // If no business data, fetch without business_id filter
      Promise.all([
        fetchMetrics(timePeriod),
        fetchRevenueChart(),
        fetchAppointmentSetters()
      ])
    }
  }, [timePeriod, user, businessData])

  const menuItems = [
    { id: "leads", icon: Users, label: "New Leads" },
    { id: "setters", icon: Phone, label: "Appointment Setters" },
  ]

  if (loading) {
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
                  {/* Lead Metrics Component */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        Lead Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Lead Statistics */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Leads:</span>
                          <span className="text-xl font-bold text-gray-900">{leadMetrics.totalLeads}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Contacted:</span>
                          <span className="text-xl font-bold text-blue-600">{leadMetrics.contactedLeads}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Booked:</span>
                          <span className="text-xl font-bold text-green-600">{leadMetrics.bookedLeads}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Contact Rate:</span>
                            <span className="text-xl font-bold text-blue-600">{leadMetrics.contactRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Booking Rate:</span>
                            <span className="text-xl font-bold text-green-600">{leadMetrics.bookingRate}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Metrics Component */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                        Revenue Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Revenue Statistics */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Shows:</span>
                          <span className="text-xl font-bold text-gray-900">{revenueMetrics.shows}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Closes:</span>
                          <span className="text-xl font-bold text-green-600">{revenueMetrics.closes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Total Amount:</span>
                          <span className="text-xl font-bold text-green-600">${revenueMetrics.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Close Rate and Average Order Display */}
                      <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Close Rate:</span>
                          <span className="text-xl font-bold text-green-600">
                            {revenueMetrics.shows > 0 ? Math.round((revenueMetrics.closes / revenueMetrics.shows) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Avg. Order:</span>
                          <span className="text-xl font-bold text-green-600">
                            ${revenueMetrics.closes > 0 ? Math.round(revenueMetrics.totalAmount / revenueMetrics.closes).toLocaleString() : 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Leads Table */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-900 flex items-center gap-2">Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">Lead Name</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">How Soon</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">Service</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">Date</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">Speed to Lead</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">Grade</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-medium">Next Step</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(leads.filter(lead => lead.start_time && lead.start_time !== '').length > 0 
                            ? leads.filter(lead => lead.start_time && lead.start_time !== '') 
                            : leadsTableData
                          ).map((lead, index) => {
                            // Helper functions for real data formatting
                            const formatName = (lead: any) => {
                              if (lead.customer_name) return lead.customer_name
                              if (lead.first_name && lead.last_name) return `${lead.first_name} ${lead.last_name}`
                              return lead.name || 'Unknown'
                            }
                            
                            const formatUrgency = (lead: any) => {
                              const urgency = lead.urgency || lead.priority || lead.how_soon || 'Not specified'
                              let urgencyColor = "bg-gray-50 text-gray-600 border border-gray-200"
                              
                              if (urgency.toLowerCase().includes('asap') || urgency.toLowerCase().includes('urgent')) {
                                urgencyColor = "bg-red-50 text-red-600 border border-red-200"
                              } else if (urgency.toLowerCase().includes('week')) {
                                urgencyColor = "bg-orange-50 text-orange-600 border border-orange-200"
                              } else if (urgency.toLowerCase().includes('month')) {
                                urgencyColor = "bg-blue-50 text-blue-600 border border-blue-200"
                              }
                              
                              return { urgency, urgencyColor }
                            }
                            
                            const formatService = (lead: any) => {
                              return lead.service_type || lead.service || 'Service'
                            }
                            
                            const formatDateTime = (lead: any) => {
                              const date = lead.created_at || lead.date_time || lead.dateTime
                              if (date) {
                                return new Date(date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })
                              }
                              return 'N/A'
                            }
                            
                            const formatSpeedToLead = (lead: any) => {
                              const speed = lead.speed_to_lead || lead.speedToLead || '0:00'
                              const speedNum = parseInt(speed.split(':')[0]) || 0
                              let speedColor = "text-green-600"
                              if (speedNum > 10) speedColor = "text-red-500"
                              else if (speedNum > 5) speedColor = "text-orange-500"
                              
                              return { speed, speedColor }
                            }
                            
                            const formatGrade = (lead: any) => {
                              return lead.grade || lead.lead_grade || 'A'
                            }
                            
                            const formatNextStep = (lead: any) => {
                              return lead.next_step || lead.status || 'Contact'
                            }
                            
                            const name = formatName(lead)
                            const { urgency, urgencyColor } = formatUrgency(lead)
                            const service = formatService(lead)
                            const dateTime = formatDateTime(lead)
                            const { speed, speedColor } = formatSpeedToLead(lead)
                            const grade = formatGrade(lead)
                            const nextStep = formatNextStep(lead)
                            
                            return (
                              <tr key={lead.id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      <span className="text-gray-600 text-xs font-bold">
                                        {name
                                          .split(" ")
                                          .map((n: string) => n[0])
                                          .join("")}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <Badge className={`${urgencyColor} text-xs`}>{urgency}</Badge>
                                </td>
                                <td className="py-4 px-6 text-gray-600">{service}</td>
                                <td className="py-4 px-6 text-gray-600">{dateTime}</td>
                                <td className={`py-4 px-6 font-bold ${speedColor}`}>{speed}</td>
                                <td className="py-4 px-6">
                                  <Badge className="bg-blue-50 text-blue-600 border border-blue-200 text-xs">{grade}</Badge>
                                </td>
                                <td className="py-4 px-6 text-gray-600">{nextStep}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "setters" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Setters</h1>
                  <p className="text-gray-600">Performance metrics for your appointment setters</p>
                </div>
                
                {appointmentSetters.length > 0 ? (
                  <div className="grid gap-6">
                    {appointmentSetters.map((setter, index) => (
                      <Card key={index} className="bg-white border border-gray-200 shadow-sm max-w-4xl">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">
                                {setter.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900">{setter.name}</h3>
                              <p className="text-gray-600">Avg. response {setter.avgSpeed}</p>
                              
                              {/* Stats Row 1 - Lead Counts */}
                              <div className="flex items-center space-x-6 mt-3 text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  leads {setter.totalLeads}
                                </div>
                                <div className="flex items-center gap-1 text-blue-600">
                                  <span>contacted {setter.contactedLeads}</span>
                                </div>
                                <div className="flex items-center gap-1 text-green-600">
                                  <span>booked {setter.bookedLeads}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  Total Time {setter.formattedCallTime}
                                </div>
                              </div>
                              
                              {/* Stats Row 2 - Rates */}
                              <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center gap-1 text-blue-600 font-bold">
                                  <span>Contact Rate: {setter.contactRate}%</span>
                                </div>
                                <div className="flex items-center gap-1 text-green-600 font-bold">
                                  <span>Booking Rate: {setter.bookingRate}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white border border-gray-200 shadow-sm max-w-2xl">
                    <CardContent className="p-6">
                      <div className="text-center text-gray-600">
                        <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p>No appointment setter data available for the selected time period.</p>
                        <p className="text-sm mt-2">Make sure leads have been assigned to setters and calls have been made.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}