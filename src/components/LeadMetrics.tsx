"use client"

import React from "react"
import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LeadMetricsProps {
  leadMetrics: {
    totalLeads: number
    contactedLeads: number
    bookedLeads: number
    contactRate: number
    bookingRate: number
  }
}

const LeadMetrics = React.memo(function LeadMetrics({ leadMetrics }: LeadMetricsProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Lead Metrics</h3>
          <p className="text-xs text-gray-600">Performance overview</p>
        </div>
      </div>

      {/* Statistics Cards - More Compact */}
      <div className="space-y-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Total Leads</span>
            <span className="text-xl font-bold text-gray-900">{leadMetrics.totalLeads}</span>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Contacted</span>
            <span className="text-xl font-bold text-blue-600">{leadMetrics.contactedLeads}</span>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Booked</span>
            <span className="text-xl font-bold text-emerald-600">{leadMetrics.bookedLeads}</span>
          </div>
        </div>
        
        {/* Rates Section - More Compact */}
        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Contact Rate</span>
              <span className="text-lg font-bold text-blue-600">{leadMetrics.contactRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(leadMetrics.contactRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Booking Rate</span>
              <span className="text-lg font-bold text-emerald-600">{leadMetrics.bookingRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(leadMetrics.bookingRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default LeadMetrics