"use client"

import { Badge } from "@/components/ui/badge"
import { IncomingCall } from '@/hooks/useIncomingCallsData'
import { useAuth } from "@/contexts/AuthContext"
import { formatDateTimeInTimezone } from "@/lib/leadUtils"

interface RecentIncomingCallsTableProps {
  calls: IncomingCall[]
  loading: boolean
}


const formatDuration = (duration?: number) => {
  if (!duration) return 'N/A'
  
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const getStatusBadgeStyle = (status?: string) => {
  if (!status) return "bg-gray-50 text-gray-600 border border-gray-200"
  
  switch (status.toLowerCase()) {
    case 'completed':
    case 'answered':
      return "bg-green-50 text-green-600 border border-green-200"
    case 'missed':
    case 'no answer':
      return "bg-red-50 text-red-600 border border-red-200"
    case 'voicemail':
      return "bg-yellow-50 text-yellow-600 border border-yellow-200"
    case 'in progress':
    case 'ongoing':
      return "bg-blue-50 text-blue-600 border border-blue-200"
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200"
  }
}

export default function RecentIncomingCallsTable({ calls, loading }: RecentIncomingCallsTableProps) {
  const { businessData } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-pulse text-gray-500">Loading calls...</div>
      </div>
    )
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">No calls found for the selected time period</div>
      </div>
    )
  }

  // Show most recent 20 calls
  const displayCalls = calls.slice(0, 20)

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
            <tr>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold">Date & Time</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold">Source</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold">Caller Type</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold">Duration</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {displayCalls.map((call, index) => {
              const dateTime = formatDateTimeInTimezone(call.created_at, businessData?.time_zone)
              const source = call.source?.trim() || 'Unknown'
              const callerType = call.caller_type?.trim() || 'Unknown'
              const duration = formatDuration(call.duration)
              const status = call.status?.trim() || 'Unknown'
              const statusStyle = getStatusBadgeStyle(call.status)
              
              return (
                <tr 
                  key={call.incoming_call_id || index} 
                  className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                >
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{dateTime}</div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-xs rounded-xl shadow-sm">
                      {source}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs rounded-xl shadow-sm">
                      {callerType}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{duration}</td>
                  <td className="py-4 px-6">
                    <Badge className={`${statusStyle} text-xs rounded-xl shadow-sm`}>{status}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}