"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  formatName, 
  formatUrgency, 
  formatService, 
  formatDateTime, 
  formatSpeedToLead, 
  formatGrade, 
  formatNextStep 
} from "@/lib/leadUtils"

// Mock data - will be replaced with real Supabase data
const leadsTableData = [
  {
    id: "mock-lead-1",
    lead_id: "mock-lead-1",
    name: "John Doe",
    first_name: "John",
    last_name: "Doe",
    urgency: "ASAP",
    service: "Full Replacement",
    houseValue: "$450,000",
    house_value: "$450,000",
    distance: "5.2 mi",
    dateTime: "Jan 1, 5:00 AM",
    created_at: "2024-01-01T05:00:00Z",
    speedToLead: "2:00",
    va: "Amelia",
    urgencyColor: "bg-red-50 text-red-600 border border-red-200",
    speedColor: "text-green-600",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
  },
  {
    id: "mock-lead-2",
    lead_id: "mock-lead-2",
    name: "Jane Smith",
    first_name: "Jane",
    last_name: "Smith",
    urgency: "Within 2 weeks",
    service: "Repair",
    houseValue: "$320,000",
    house_value: "$320,000",
    distance: "8.7 mi",
    dateTime: "Jan 2, 6:00 AM",
    created_at: "2024-01-02T06:00:00Z",
    speedToLead: "7:30",
    va: "Omar",
    urgencyColor: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    speedColor: "text-orange-500",
    email: "jane.smith@example.com",
    phone: "(555) 234-5678",
  },
  {
    id: "mock-lead-3",
    lead_id: "mock-lead-3",
    name: "David Lee",
    first_name: "David",
    last_name: "Lee",
    urgency: "Next month",
    service: "Inspection",
    houseValue: "$275,000",
    house_value: "$275,000",
    distance: "12.1 mi",
    dateTime: "Jan 3, 7:00 AM",
    created_at: "2024-01-03T07:00:00Z",
    speedToLead: "1:25",
    va: "Alba",
    urgencyColor: "bg-blue-50 text-blue-600 border border-blue-200",
    speedColor: "text-green-600",
    email: "david.lee@example.com",
    phone: "(555) 345-6789",
  },
]

interface LeadsTableProps {
  leads: any[]
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const router = useRouter()
  const displayLeads = leads.length > 0 ? leads : leadsTableData

  const handleRowClick = (lead: any) => {
    // Navigate to lead detail page
    const leadId = lead.lead_id || lead.id || 'mock-lead-' + Math.random().toString(36).substr(2, 9)
    router.push(`/leads/${leadId}`)
  }

  return (
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
              {displayLeads.map((lead, index) => {
                const name = formatName(lead)
                const { urgency, urgencyColor } = formatUrgency(lead)
                const service = formatService(lead)
                const dateTime = formatDateTime(lead)
                const { speed, speedColor } = formatSpeedToLead(lead)
                const grade = formatGrade(lead)
                const nextStep = formatNextStep(lead)
                
                return (
                  <tr 
                    key={lead.id || index} 
                    onClick={() => handleRowClick(lead)}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
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
  )
}