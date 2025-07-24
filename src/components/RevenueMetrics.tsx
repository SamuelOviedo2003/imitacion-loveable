"use client"

import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueMetricsProps {
  revenueMetrics: {
    shows: number
    closes: number
    totalAmount: number
  }
}

export default function RevenueMetrics({ revenueMetrics }: RevenueMetricsProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          Revenue Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Statistics */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Shows:</span>
            <span className="text-xl font-bold text-gray-900">{revenueMetrics.shows}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Closes:</span>
            <span className="text-xl font-bold text-green-600">{revenueMetrics.closes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Amount:</span>
            <span className="text-xl font-bold text-green-600">${revenueMetrics.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Close Rate and Average Order Display */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Close Rate:</span>
            <span className="text-xl font-bold text-green-600">
              {revenueMetrics.shows > 0 ? Math.round((revenueMetrics.closes / revenueMetrics.shows) * 100) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Avg. Order:</span>
            <span className="text-xl font-bold text-green-600">
              ${revenueMetrics.closes > 0 ? Math.round(revenueMetrics.totalAmount / revenueMetrics.closes).toLocaleString() : 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}