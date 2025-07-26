"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IncomingCall } from '@/hooks/useIncomingCallsData'

interface RecentIncomingCallsTableProps {
  calls: IncomingCall[]
  loading: boolean
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatDuration = (duration?: number) => {
  if (!duration) return 'N/A'
  
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
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
  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">Recent Incoming Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-gray-500">Loading calls...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!calls || calls.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">Recent Incoming Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No calls found for the selected time period</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show most recent 20 calls
  const displayCalls = calls.slice(0, 20)

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-gray-900 flex items-center gap-2">Recent Incoming Calls</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Date & Time</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Source</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Caller Type</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Duration</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayCalls.map((call, index) => {
                const dateTime = formatDateTime(call.created_at)
                const source = call.source?.trim() || 'Unknown'
                const callerType = call.caller_type?.trim() || 'Unknown'
                const duration = formatDuration(call.duration)
                const status = call.status?.trim() || 'Unknown'
                const statusStyle = getStatusBadgeStyle(call.status)
                
                return (
                  <tr 
                    key={call.incoming_call_id || index} 
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{dateTime}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-xs">
                        {source}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs">
                        {callerType}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{duration}</td>
                    <td className="py-4 px-6">
                      <Badge className={`${statusStyle} text-xs`}>{status}</Badge>
                    </td>
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