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
  )
})

export default LeadMetrics