"use client"

import React from "react"
import { DollarSign } from "lucide-react"

interface RevenueMetricsProps {
  revenueMetrics: {
    shows: number
    closes: number
    totalAmount: number
  }
}

const RevenueMetrics = React.memo(function RevenueMetrics({ revenueMetrics }: RevenueMetricsProps) {
  return (
    <div className="modern-card pastel-card-mint">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Metrics</h3>
        <p className="text-gray-600">Sales performance and earnings overview</p>
      </div>
      
      <div className="space-y-4">{/* Header Removed - Now integrated into card header */}

      {/* Statistics Cards - Modern Style */}
      <div className="space-y-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Shows</span>
            <span className="text-xl font-bold text-gray-900">{revenueMetrics.shows}</span>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Closes</span>
            <span className="text-xl font-bold text-emerald-600">{revenueMetrics.closes}</span>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Total Amount</span>
            <span className="text-xl font-bold text-emerald-600">${revenueMetrics.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Calculated Metrics */}
        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Close Rate</span>
              <span className="text-lg font-bold text-emerald-600">
                {revenueMetrics.shows > 0 ? Math.round((revenueMetrics.closes / revenueMetrics.shows) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${revenueMetrics.shows > 0 ? Math.min(Math.round((revenueMetrics.closes / revenueMetrics.shows) * 100), 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Avg. Order Value</span>
            <span className="text-lg font-bold text-emerald-600">
              ${revenueMetrics.closes > 0 ? Math.round(revenueMetrics.totalAmount / revenueMetrics.closes).toLocaleString() : 0}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
})

export default RevenueMetrics