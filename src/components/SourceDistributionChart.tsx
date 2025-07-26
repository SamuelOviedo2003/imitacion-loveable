"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartData } from "@/hooks/useIncomingCallsData"

interface SourceDistributionChartProps {
  data: ChartData[]
  loading?: boolean
}

// App theme colors - vibrant and consistent
const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald  
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280'  // Gray
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{data.value}</span> calls
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{data.percentage}%</span> of total
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-3 mt-6">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full shadow-sm" 
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-sm text-gray-700 font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
)

export default function SourceDistributionChart({ data, loading }: SourceDistributionChartProps) {
  if (loading) {
    return (
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Source Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="text-gray-500 animate-pulse">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Source Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              <div className="text-lg font-medium mb-1">No data available</div>
              <div className="text-sm">No calls found for the selected period</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCalls = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Source Distribution</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Call sources breakdown • {totalCalls} total calls
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={130}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={2}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}