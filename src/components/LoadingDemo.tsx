"use client"

import { useState } from 'react'
import LoadingScreen from './LoadingScreen'
import LoadingOverlay from './LoadingOverlay' 
import InlineLoader from './InlineLoader'
import { Button } from './ui/Button'

export default function LoadingDemo() {
  const [showOverlay, setShowOverlay] = useState(false)

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-violet-50 to-rose-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-violet-800 mb-8 text-center">
          🏠 Enhanced Loading Animations
        </h1>
        
        {/* Size variations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Small</h3>
            <LoadingScreen message="Preparing..." size="sm" />
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Medium</h3>
            <LoadingScreen message="Building your workspace..." size="md" />
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Large</h3>
            <LoadingScreen message="Constructing your dashboard..." size="lg" />
          </div>
        </div>

        {/* Inline variations */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Inline Loaders</h3>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <InlineLoader size="xs" />
              <span className="text-sm">Extra Small</span>
            </div>
            <div className="flex items-center space-x-2">
              <InlineLoader size="sm" />
              <span className="text-sm">Small</span>
            </div>
            <div className="flex items-center space-x-2">
              <InlineLoader size="md" />
              <span className="text-sm">Medium</span>
            </div>
          </div>
        </div>

        {/* Full overlay demo */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Screen Overlay</h3>
          <Button
            onClick={() => {
              setShowOverlay(true)
              setTimeout(() => setShowOverlay(false), 4000)
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Demo Full Screen Loading (4s)
          </Button>
        </div>

        {/* Animation details */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Animation Features</h3>
          <ul className="space-y-2 text-gray-600">
            <li>🏗️ <strong>Construction worker</strong> appears and bounces</li>
            <li>🧱 <strong>Shingles slide in</strong> from left and right with smooth easing</li>
            <li>✨ <strong>Sparkle effects</strong> and success glow on completion</li>
            <li>🌟 <strong>Shimmer effect</strong> sweeps across the finished house</li>
            <li>🎨 <strong>Modern purple/rose color scheme</strong> matching your reference</li>
            <li>🌿 <strong>Animated background trees</strong> and floating particles</li>
          </ul>
        </div>
      </div>

      {/* Overlay demo */}
      <LoadingOverlay
        message="Demonstrating the full screen experience..."
        show={showOverlay}
      />
    </div>
  )
}