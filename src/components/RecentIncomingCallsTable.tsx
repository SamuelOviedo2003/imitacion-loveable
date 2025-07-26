"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Eye } from "lucide-react"
import { useState } from "react"
import { IncomingCall } from "@/hooks/useIncomingCallsData"

interface RecentIncomingCallsTableProps {
  calls: IncomingCall[]
  loading?: boolean
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return 'N/A'
  try {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return 'N/A'
  }
}

const formatDuration = (duration?: number) => {
  if (!duration || duration === 0) return 'N/A'
  
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

const getStatusBadge = (status?: string) => {
  if (!status) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Unknown</span>
  
  const statusLower = status.toLowerCase()
  let className = "px-2 py-1 text-xs rounded-full font-medium transition-colors"
  
  switch (statusLower) {
    case 'answered':
    case 'completed':
    case 'connected':
      className += " bg-green-100 text-green-700 hover:bg-green-200"
      break
    case 'pending':
    case 'new':
    case 'ringing':
      className += " bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
      break
    case 'missed':
    case 'failed':
    case 'no-answer':
      className += " bg-red-100 text-red-700 hover:bg-red-200"
      break
    case 'in-progress':
    case 'active':
    case 'busy':
      className += " bg-blue-100 text-blue-700 hover:bg-blue-200"
      break
    default:
      className += " bg-gray-100 text-gray-600 hover:bg-gray-200"
  }
  
  return <span className={className}>{status}</span>
}

interface ExpandedRowProps {
  call: IncomingCall
}

const ExpandedRow = ({ call }: ExpandedRowProps) => (
  <tr className="bg-gray-50 border-l-4 border-blue-200">
    <td colSpan={6} className="px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Call Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Call ID:</span>
              <span className="ml-2 text-gray-900 font-mono">{call.incoming_call_id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Account ID:</span>
              <span className="ml-2 text-gray-900">{call.account_id || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Local Call:</span>
              <span className={`ml-2 font-medium ${call.local_call ? 'text-green-600' : 'text-gray-500'}`}>
                {call.local_call ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Assignment</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Assigned:</span>
              <span className="ml-2 text-gray-900">{call.assigned || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Assigned ID:</span>
              <span className="ml-2 text-gray-900 font-mono">{call.assigned_id || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Recording:</span>
              <span className="ml-2">
                {call.recording_url ? (
                  <a 
                    href={call.recording_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Recording
                  </a>
                ) : (
                  <span className="text-gray-500">No recording</span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Notes & Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Summary:</span>
              <div className="ml-2 text-gray-900 max-w-xs">
                {call.call_summary ? (
                  <p className="text-xs bg-gray-100 p-2 rounded mt-1">{call.call_summary}</p>
                ) : (
                  <span className="text-gray-500">No summary</span>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Notes:</span>
              <div className="ml-2 text-gray-900 max-w-xs">
                {call.notes ? (
                  <p className="text-xs bg-gray-100 p-2 rounded mt-1">{call.notes}</p>
                ) : (
                  <span className="text-gray-500">No notes</span>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Next Step:</span>
              <div className="ml-2 text-gray-900">{call.next_step || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </td>
  </tr>
)

export default function RecentIncomingCallsTable({ calls, loading }: RecentIncomingCallsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleExpanded = (callId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(callId)) {
      newExpanded.delete(callId)
    } else {
      newExpanded.add(callId)
    }
    setExpandedRows(newExpanded)
  }

  if (loading) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Incoming Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 animate-pulse">Loading calls...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayCalls = calls.slice(0, 25) // Show recent 25 calls

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Incoming Calls</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Latest {displayCalls.length} calls from your business
        </p>
      </CardHeader>
      <CardContent>
        {displayCalls.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">No calls found</div>
            <div className="text-sm">No calls match the selected time period</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 w-10"></th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Source</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Caller Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Duration</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayCalls.map((call) => (
                  <>
                    <tr 
                      key={call.incoming_call_id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${expandedRows.has(call.incoming_call_id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleExpanded(call.incoming_call_id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-blue-100"
                          title="View details"
                        >
                          {expandedRows.has(call.incoming_call_id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {formatDateTime(call.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {call.source || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {call.caller_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-medium">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(call.status)}
                      </td>
                    </tr>
                    {expandedRows.has(call.incoming_call_id) && (
                      <ExpandedRow key={`expanded-${call.incoming_call_id}`} call={call} />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}