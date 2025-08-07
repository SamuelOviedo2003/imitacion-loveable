"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  formatName, 
  formatUrgency, 
  formatService, 
  formatDateTimeInTimezone 
} from "@/lib/leadUtils"
import { useAuth } from "@/contexts/AuthContext"

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
    score: 85,
    status: "New",
    urgencyColor: "bg-red-50 text-red-600 border border-red-200",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    notes: "Interested in metal roofing, wants quote ASAP",
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
    score: 45,
    status: "Contacted",
    urgencyColor: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    email: "jane.smith@example.com",
    phone: "(555) 234-5678",
    notes: "Small leak repair needed, budget conscious",
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
    score: 22,
    status: "Qualified",
    urgencyColor: "bg-blue-50 text-blue-600 border border-blue-200",
    email: "david.lee@example.com",
    phone: "(555) 345-6789",
    notes: "Preparing for sale, needs full inspection",
  },
]

interface LeadsTableProps {
  leads: any[]
}

const getScoreColor = (score: number | null) => {
  if (!score || score < 0) return 'bg-gray-100 text-gray-600 border-gray-200'
  
  if (score <= 33) {
    return 'bg-red-100 text-red-700 border-red-200'
  } else if (score <= 66) {
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  } else {
    return 'bg-green-100 text-green-700 border-green-200'
  }
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const router = useRouter()
  const { businessData } = useAuth()
  const displayLeads = leads.length > 0 ? leads : leadsTableData

  const handleRowClick = (lead: any) => {
    // Navigate to lead detail page
    const leadId = lead.lead_id || lead.id || 'mock-lead-' + Math.random().toString(36).substr(2, 9)
    router.push(`/leads/${leadId}`)
  }

  return (
    <div>
      {/* Table Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Leads</h3>
        <p className="text-gray-600">Click on any lead to view detailed information</p>
      </div>

      {/* Modern Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
              <tr>
                <th className="text-left py-5 px-6 text-gray-700 font-semibold text-sm">Lead Name</th>
                <th className="text-left py-5 px-6 text-gray-700 font-semibold text-sm">Service</th>
                <th className="text-left py-5 px-6 text-gray-700 font-semibold text-sm">Date</th>
                <th className="text-left py-5 px-6 text-gray-700 font-semibold text-sm">Notes</th>
                <th className="text-left py-5 px-6 text-gray-700 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {displayLeads.map((lead, index) => {
                const name = formatName(lead)
                const { urgency, urgencyColor } = formatUrgency(lead)
                const service = formatService(lead)
                const dateTime = formatDateTimeInTimezone(lead.created_at, businessData?.time_zone)
                const scoreColor = getScoreColor(lead.score)
                
                return (
                  <tr 
                    key={lead.id || index} 
                    onClick={() => handleRowClick(lead)}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scoreColor} shadow-sm group-hover:shadow-md transition-shadow`}>
                          <span className="text-sm font-bold">
                            {lead.score || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-medium">{service}</span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${urgencyColor} shadow-sm`}>
                          {urgency}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-gray-700 font-medium">{dateTime}</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="max-w-xs">
                        <p className="text-gray-700 font-medium truncate" title={lead.notes || 'No notes available'}>
                          {lead.notes || 'No notes available'}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 shadow-sm">
                        {lead.status || 'New'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {/* Empty State */}
          {displayLeads.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-xl inline-block mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">Leads will appear here once they're created or received.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}