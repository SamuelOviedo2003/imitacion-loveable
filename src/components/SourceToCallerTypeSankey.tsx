"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SankeyLink } from "@/hooks/useIncomingCallsData"
import { useState } from "react"

interface SourceToCallerTypeSankeyProps {
  data: SankeyLink[]
  loading?: boolean
}

// App theme colors with subtle gradients
const COLORS = [
  { base: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },    // Blue
  { base: '#10b981', gradient: 'from-emerald-400 to-emerald-600' }, // Emerald
  { base: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },    // Amber
  { base: '#ef4444', gradient: 'from-red-400 to-red-600' },       // Red
  { base: '#8b5cf6', gradient: 'from-violet-400 to-violet-600' },  // Violet
  { base: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' },     // Cyan
  { base: '#84cc16', gradient: 'from-lime-400 to-lime-600' },     // Lime
  { base: '#f97316', gradient: 'from-orange-400 to-orange-600' }, // Orange
  { base: '#ec4899', gradient: 'from-pink-400 to-pink-600' },     // Pink
  { base: '#6b7280', gradient: 'from-gray-400 to-gray-600' }      // Gray
]

export default function SourceToCallerTypeSankey({ data, loading }: SourceToCallerTypeSankeyProps) {
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)

  if (loading) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Source to Caller Type Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 animate-pulse">Loading diagram...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Source to Caller Type Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <div className="text-lg font-medium mb-1">No data available</div>
              <div className="text-sm">No calls found for the selected period</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Extract unique sources and caller types
  const sources = Array.from(new Set(data.map(link => link.source)))
  const callerTypes = Array.from(new Set(data.map(link => link.target)))
  
  // Calculate totals for proportional sizing
  const maxValue = Math.max(...data.map(link => link.value))
  const totalCalls = data.reduce((sum, link) => sum + link.value, 0)

  // Calculate totals per source and caller type for node sizing
  const sourceTotals = sources.reduce((acc, source) => {
    acc[source] = data.filter(link => link.source === source).reduce((sum, link) => sum + link.value, 0)
    return acc
  }, {} as Record<string, number>)

  const callerTypeTotals = callerTypes.reduce((acc, callerType) => {
    acc[callerType] = data.filter(link => link.target === callerType).reduce((sum, link) => sum + link.value, 0)
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Source to Caller Type Relationship</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Flow of calls from sources to caller types • {totalCalls} total connections
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-12 p-6 min-h-96">
          {/* Sources Column */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-6 text-center">Sources</h3>
            <div className="space-y-4">
              {sources.map((source, index) => {
                const total = sourceTotals[source]
                const height = Math.max(50, (total / maxValue) * 150)
                const colorInfo = COLORS[index % COLORS.length]
                
                return (
                  <div 
                    key={source}
                    className="group relative"
                  >
                    <div 
                      className={`rounded-xl flex items-center justify-center text-white text-sm font-semibold transition-all duration-300 cursor-pointer bg-gradient-to-r ${colorInfo.gradient} hover:scale-105 hover:shadow-lg`}
                      style={{ height: `${height}px` }}
                      onMouseEnter={() => setHoveredConnection(source)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    >
                      <span className="px-4 text-center leading-tight">{source}</span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      <div className="font-medium">{source}</div>
                      <div>{total} calls</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Connections Visualization */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-700 mb-6">Top Connections</h3>
            <div className="space-y-3 w-full max-w-sm">
              {data
                .sort((a, b) => b.value - a.value)
                .slice(0, 8) // Show top 8 connections
                .map((link, index) => {
                  const width = Math.max(30, (link.value / maxValue) * 180)
                  const isHovered = hoveredConnection === link.source || hoveredConnection === link.target
                  const colorInfo = COLORS[index % COLORS.length]
                  
                  return (
                    <div 
                      key={`${link.source}-${link.target}`}
                      className={`group relative mx-auto rounded-full transition-all duration-300 cursor-pointer bg-gradient-to-r ${colorInfo.gradient} hover:shadow-lg ${isHovered ? 'scale-105 shadow-lg' : ''}`}
                      style={{ 
                        width: `${width}px`,
                        height: '24px'
                      }}
                      onMouseEnter={() => setHoveredConnection(`${link.source}-${link.target}`)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white text-xs font-bold">{link.value}</span>
                      </div>
                      
                      {/* Connection Tooltip */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        <div className="text-center">
                          <div className="font-medium">{link.source} → {link.target}</div>
                          <div>{link.value} calls ({Math.round((link.value / totalCalls) * 100)}%)</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Caller Types Column */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-6 text-center">Caller Types</h3>
            <div className="space-y-4">
              {callerTypes.map((callerType, index) => {
                const total = callerTypeTotals[callerType]
                const height = Math.max(50, (total / maxValue) * 150)
                const colorInfo = COLORS[(index + sources.length) % COLORS.length]
                
                return (
                  <div 
                    key={callerType}
                    className="group relative"
                  >
                    <div 
                      className={`rounded-xl flex items-center justify-center text-white text-sm font-semibold transition-all duration-300 cursor-pointer bg-gradient-to-r ${colorInfo.gradient} hover:scale-105 hover:shadow-lg`}
                      style={{ height: `${height}px` }}
                      onMouseEnter={() => setHoveredConnection(callerType)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    >
                      <span className="px-4 text-center leading-tight">{callerType}</span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      <div className="font-medium">{callerType}</div>
                      <div>{total} calls</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}