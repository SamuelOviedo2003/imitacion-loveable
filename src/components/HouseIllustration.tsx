"use client"

import React from 'react'

interface HouseIllustrationProps {
  width?: number
  height?: number
  className?: string
}

export const HouseIllustration = React.memo(function HouseIllustration({ 
  width = 500, 
  height = 400, 
  className = "" 
}: HouseIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 500 400"
        className="filter drop-shadow-2xl"
        style={{
          filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))'
        }}
      >
        <defs>
          {/* Gradients for 3D effect */}
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>
          
          <linearGradient id="roofSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          
          <linearGradient id="wallSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
          
          <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="50%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
        </defs>
        
        {/* Base/Foundation */}
        <path
          d="M 80 320 L 420 320 L 430 330 L 70 330 Z"
          fill="url(#baseGradient)"
          className="opacity-80"
        />
        
        {/* Main house body - front wall */}
        <path
          d="M 100 180 L 350 180 L 350 320 L 100 320 Z"
          fill="url(#wallGradient)"
          stroke="#d1d5db"
          strokeWidth="1"
        />
        
        {/* Side wall (right side for 3D effect) */}
        <path
          d="M 350 180 L 400 140 L 400 280 L 350 320 Z"
          fill="url(#wallSideGradient)"
          stroke="#9ca3af"
          strokeWidth="1"
        />
        
        {/* Main roof - front face */}
        <path
          d="M 80 180 L 225 80 L 370 180 Z"
          fill="url(#roofGradient)"
          stroke="#312e81"
          strokeWidth="2"
        />
        
        {/* Roof - right side for 3D effect */}
        <path
          d="M 370 180 L 420 140 L 275 40 L 225 80 Z"
          fill="url(#roofSideGradient)"
          stroke="#1e1b4b"
          strokeWidth="1"
        />
        
        {/* Chimney */}
        <rect
          x="290"
          y="60"
          width="25"
          height="50"
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="1"
          rx="2"
        />
        
        {/* Chimney side */}
        <path
          d="M 315 60 L 325 50 L 325 100 L 315 110 Z"
          fill="#b91c1c"
        />
        
        {/* Chimney top */}
        <rect
          x="290"
          y="60"
          width="25"
          height="8"
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth="1"
          rx="2"
        />
        
        {/* Dormer window */}
        <path
          d="M 180 140 L 200 120 L 240 120 L 260 140 L 260 180 L 180 180 Z"
          fill="url(#wallGradient)"
          stroke="#d1d5db"
          strokeWidth="1"
        />
        
        {/* Dormer roof */}
        <path
          d="M 170 140 L 200 110 L 240 110 L 270 140 Z"
          fill="url(#roofGradient)"
          stroke="#312e81"
          strokeWidth="1"
        />
        
        {/* Main door */}
        <rect
          x="200"
          y="250"
          width="50"
          height="70"
          fill="url(#doorGradient)"
          stroke="#5b21b6"
          strokeWidth="2"
          rx="25"
        />
        
        {/* Door handle */}
        <circle
          cx="240"
          cy="285"
          r="3"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="1"
        />
        
        {/* Windows - left */}
        <rect
          x="120"
          y="220"
          width="45"
          height="45"
          fill="url(#windowGradient)"
          stroke="#3b82f6"
          strokeWidth="2"
          rx="5"
        />
        
        {/* Window cross - left */}
        <line x1="142.5" y1="220" x2="142.5" y2="265" stroke="#1e40af" strokeWidth="2"/>
        <line x1="120" y1="242.5" x2="165" y2="242.5" stroke="#1e40af" strokeWidth="2"/>
        
        {/* Windows - right */}
        <rect
          x="285"
          y="220"
          width="45"
          height="45"
          fill="url(#windowGradient)"
          stroke="#3b82f6"
          strokeWidth="2"
          rx="5"
        />
        
        {/* Window cross - right */}
        <line x1="307.5" y1="220" x2="307.5" y2="265" stroke="#1e40af" strokeWidth="2"/>
        <line x1="285" y1="242.5" x2="330" y2="242.5" stroke="#1e40af" strokeWidth="2"/>
        
        {/* Dormer window */}
        <rect
          x="200"
          y="140"
          width="40"
          height="35"
          fill="url(#windowGradient)"
          stroke="#3b82f6"
          strokeWidth="2"
          rx="5"
        />
        
        {/* Dormer window cross */}
        <line x1="220" y1="140" x2="220" y2="175" stroke="#1e40af" strokeWidth="1.5"/>
        <line x1="200" y1="157.5" x2="240" y2="157.5" stroke="#1e40af" strokeWidth="1.5"/>
        
        {/* Side window */}
        <rect
          x="365"
          y="200"
          width="25"
          height="30"
          fill="url(#windowGradient)"
          stroke="#3b82f6"
          strokeWidth="1"
          rx="3"
        />
        
        {/* Side window cross */}
        <line x1="377.5" y1="200" x2="377.5" y2="230" stroke="#1e40af" strokeWidth="1"/>
        <line x1="365" y1="215" x2="390" y2="215" stroke="#1e40af" strokeWidth="1"/>
        
        {/* Roof edge details */}
        <path
          d="M 80 180 L 85 175 L 230 75 L 225 80 Z"
          fill="#818cf8"
          opacity="0.6"
        />
        
        <path
          d="M 370 180 L 375 175 L 230 75 L 225 80 Z"
          fill="#4338ca"
          opacity="0.8"
        />
        
        {/* Small decorative elements */}
        {/* Roof tiles indication */}
        <g opacity="0.3">
          <line x1="90" y1="170" x2="360" y2="170" stroke="#312e81" strokeWidth="1"/>
          <line x1="100" y1="160" x2="350" y2="160" stroke="#312e81" strokeWidth="1"/>
          <line x1="110" y1="150" x2="340" y2="150" stroke="#312e81" strokeWidth="1"/>
          <line x1="120" y1="140" x2="330" y2="140" stroke="#312e81" strokeWidth="1"/>
        </g>
        
        {/* Front porch steps */}
        <rect
          x="185"
          y="320"
          width="80"
          height="8"
          fill="#9ca3af"
          rx="4"
        />
        <rect
          x="190"
          y="315"
          width="70"
          height="8"
          fill="#6b7280"
          rx="4"
        />
      </svg>
    </div>
  )
})