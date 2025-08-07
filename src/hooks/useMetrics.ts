"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export const useMetrics = (timePeriod: number, businessId?: number) => {
  const [leads, setLeads] = useState<any[]>([])
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
  const [revenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetchParams, setLastFetchParams] = useState<{ timePeriod: number, businessId?: number } | null>(null)

  // Mock data fallback
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

  const fetchMetrics = useCallback(async (days: number, businessId?: number) => {
    // Prevent duplicate fetches
    const currentParams = { timePeriod: days, businessId }
    if (lastFetchParams && 
        lastFetchParams.timePeriod === days && 
        lastFetchParams.businessId === businessId) {
      return
    }

    try {
      setLoading(true)
      setLastFetchParams(currentParams)

      if (!businessId) {
        // Provide fallback data immediately if no businessId
        setLeads(leadsTableData)
        setLeadMetrics({ totalLeads: 5, contactedLeads: 4, bookedLeads: 2, contactRate: 80, bookingRate: 50 })
        setRevenueMetrics({ shows: 5, closes: 2, totalAmount: 33000 })
        setAppointmentSetters([])
        setLoading(false)
        return
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateISO = startDate.toISOString()

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )

      // Fetch leads data within time period, filtered by business_id if available
      const leadsQuery = supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDateISO)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      const fetchPromise = leadsQuery

      const { data: leadsData, error: leadsError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any
      
      if (!leadsError && leadsData) {
        setLeads(leadsData)
        
        // Calculate lead metrics
        const totalLeads = leadsData.length
        const contactedLeads = leadsData.filter((lead: any) => lead.contacted === true).length
        const bookedLeads = leadsData.filter((lead: any) => lead.start_time !== null && lead.start_time !== '').length
        const contactRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0
        const bookingRate = contactedLeads > 0 ? Math.round((bookedLeads / contactedLeads) * 100) : 0
        
        setLeadMetrics({
          totalLeads,
          contactedLeads,
          bookedLeads,
          contactRate,
          bookingRate
        })

        // Calculate revenue metrics
        const shows = leadsData.filter((lead: any) => lead.show === true).length
        const closes = leadsData.filter((lead: any) => lead.closed_amount !== null && lead.closed_amount !== '').length
        const totalAmount = leadsData
          .reduce((sum: number, lead: any) => sum + (lead.closed_amount || 0), 0)
        
        setRevenueMetrics({
          shows,
          closes,
          totalAmount
        })

        // Skip heavy appointment setters computation for better performance
        // Load appointment setters in background after initial metrics
        setTimeout(() => {
          if (leadsData.length < 500) {
            fetchAppointmentSetters(days, businessId)
          } else {
            setAppointmentSetters([])
          }
        }, 100)
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
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAppointmentSetters = useCallback(async (timePeriod: number, businessId?: number) => {
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
      leadsData.forEach((lead: any) => {
        leadsMap.set(lead.lead_id, lead)
      })

      // Group data by assigned user from calls table
      const settersMap = new Map()

      // Get unique lead_ids that each setter called
      const setterLeadsMap = new Map() // setter -> Set of lead_ids they called

      callsData.forEach((call: any) => {
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
          totalLeads: leadIdsSet.size,
          contactedLeads: 0,
          bookedLeads: 0,
          totalCallTime: 0,
          firstCallSpeeds: [],
          firstCallDurations: [],
          leadsCalledSet: leadIdsSet
        })
      })

      // Calculate contacted and booked leads for each setter
      settersMap.forEach((setter) => {
        setter.leadsCalledSet.forEach((leadId: any) => {
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
        
        callsData.forEach((call: any) => {
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
        callsData.forEach((call: any) => {
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
      const settersArray = Array.from(settersMap.values()).map((setter: any) => {
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
  }, [])

  useEffect(() => {
    fetchMetrics(timePeriod, businessId)
  }, [timePeriod, businessId, fetchMetrics])

  // Memoize expensive calculations
  const memoizedMetrics = useMemo(() => ({
    leads,
    leadMetrics,
    revenueMetrics,
    appointmentSetters,
    revenueData,
    loading,
    refetch: () => fetchMetrics(timePeriod, businessId)
  }), [leads, leadMetrics, revenueMetrics, appointmentSetters, revenueData, loading, fetchMetrics, timePeriod, businessId])

  return memoizedMetrics
}