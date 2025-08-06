"use client"

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showMessage?: boolean
  className?: string
}

const LoadingScreen = ({ 
  message = "Loading...", 
  size = 'md', 
  showMessage = true,
  className = ""
}: LoadingScreenProps) => {
  const [animationPhase, setAnimationPhase] = useState(0)
  const [shimmerActive, setShimmerActive] = useState(false)

  useEffect(() => {
    const phases = [
      500,  // Phase 1: Construction worker appears
      1000, // Phase 2: First shingle slides in
      1400, // Phase 3: Second shingle slides in  
      1800, // Phase 4: Third shingle slides in
      2200, // Phase 5: Fourth shingle slides in
      2600, // Phase 6: Final shingle + completion effects
      3000, // Phase 7: Shimmer effect
      3500  // Reset
    ]

    const timeouts = phases.map((delay, index) => {
      return setTimeout(() => {
        if (index === phases.length - 1) {
          // Reset animation
          setAnimationPhase(0)
          setShimmerActive(false)
        } else if (index === phases.length - 2) {
          // Start shimmer effect
          setShimmerActive(true)
        } else {
          setAnimationPhase(index + 1)
        }
      }, delay)
    })

    return () => timeouts.forEach(clearTimeout)
  }, [])

  const sizes = {
    sm: { container: 'w-20 h-20', house: 100, scale: 0.8 },
    md: { container: 'w-28 h-28', house: 140, scale: 1 },
    lg: { container: 'w-36 h-36', house: 180, scale: 1.2 }
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex flex-col items-center justify-center space-y-8 ${className}`}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating construction particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-violet-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-rose-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-violet-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        <svg 
          width={currentSize.house} 
          height={currentSize.house} 
          viewBox="0 0 160 140" 
          className="drop-shadow-lg"
        >
          {/* Background decorative elements */}
          <defs>
            <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc"/>
              <stop offset="100%" stopColor="#e2e8f0"/>
            </linearGradient>
            <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
            <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent"/>
              <stop offset="50%" stopColor="rgba(255,255,255,0.8)"/>
              <stop offset="100%" stopColor="transparent"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Trees (inspired by reference) */}
          <ellipse cx="25" cy="90" rx="12" ry="15" fill="#f87171" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0s' }}/>
          <ellipse cx="135" cy="85" rx="10" ry="12" fill="#f87171" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }}/>
          
          {/* Ground shadow */}
          <ellipse cx="80" cy="125" rx="70" ry="8" fill="#000000" opacity="0.1"/>

          {/* Main house structure */}
          <rect 
            x="30" 
            y="75" 
            width="100" 
            height="50" 
            rx="4"
            fill="url(#houseGradient)"
            stroke="#e2e8f0"
            strokeWidth="2"
            className="drop-shadow-md"
          />
          
          {/* Chimney */}
          <rect 
            x="105" 
            y="45" 
            width="8" 
            height="35" 
            rx="1"
            fill="#8b5cf6"
          />
          <rect 
            x="103" 
            y="43" 
            width="12" 
            height="4" 
            rx="1"
            fill="#6366f1"
          />

          {/* Modern door with glass */}
          <rect 
            x="65" 
            y="95" 
            width="20" 
            height="30" 
            rx="2"
            fill="#6366f1"
            className="drop-shadow-sm"
          />
          <rect 
            x="67" 
            y="97" 
            width="7" 
            height="12" 
            rx="1"
            fill="#bfdbfe"
            opacity="0.8"
          />
          <rect 
            x="76" 
            y="97" 
            width="7" 
            height="12" 
            rx="1"
            fill="#bfdbfe"
            opacity="0.8"
          />
          <circle cx="81" cy="110" r="1.5" fill="#f87171"/>

          {/* Windows with more detail */}
          <rect 
            x="40" 
            y="85" 
            width="16" 
            height="16" 
            rx="2"
            fill="#bfdbfe"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="drop-shadow-sm"
          />
          <rect 
            x="104" 
            y="85" 
            width="16" 
            height="16" 
            rx="2"
            fill="#bfdbfe"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="drop-shadow-sm"
          />
          
          {/* Window crosses */}
          <line x1="48" y1="85" x2="48" y2="101" stroke="#6366f1" strokeWidth="1"/>
          <line x1="40" y1="93" x2="56" y2="93" stroke="#6366f1" strokeWidth="1"/>
          <line x1="112" y1="85" x2="112" y2="101" stroke="#6366f1" strokeWidth="1"/>
          <line x1="104" y1="93" x2="120" y2="93" stroke="#6366f1" strokeWidth="1"/>

          {/* Base roof structure (incomplete) */}
          <path 
            d="M20 75 L80 35 L140 75 Z" 
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth="2"
            opacity="0.4"
            className="transition-opacity duration-500"
          />

          {/* Roof ridge beam */}
          <line 
            x1="30" 
            y1="70" 
            x2="130" 
            y2="70" 
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-sm"
          />

          {/* Construction worker (appears in phase 1) */}
          {animationPhase >= 1 && (
            <g className="animate-bounce" style={{ transformOrigin: '25px 70px' }}>
              {/* Worker hat */}
              <ellipse cx="25" cy="65" rx="4" ry="3" fill="#f59e0b"/>
              {/* Worker body */}
              <rect x="23" y="68" width="4" height="8" rx="2" fill="#6366f1"/>
              {/* Tool in hand */}
              <rect x="27" y="70" width="6" height="1" rx="0.5" fill="#8b5cf6"/>
            </g>
          )}

          {/* Progressive shingles with enhanced animations */}
          {/* Row 1 - Top center */}
          {animationPhase >= 2 && (
            <g>
              <rect 
                x="60" 
                y="40" 
                width="40" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="animate-slide-in-from-left drop-shadow-md"
                style={{
                  animation: 'slideInFromLeft 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards',
                  filter: 'url(#glow)'
                }}
              />
              <rect x="62" y="42" width="36" height="2" rx="1" fill="#ffffff" opacity="0.3"/>
            </g>
          )}

          {/* Row 2 - Second level */}
          {animationPhase >= 3 && (
            <g>
              <rect 
                x="45" 
                y="48" 
                width="25" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="drop-shadow-md"
                style={{
                  animation: 'slideInFromLeft 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards 0.1s',
                  opacity: 0,
                  animationFillMode: 'forwards',
                  filter: 'url(#glow)'
                }}
              />
              <rect 
                x="90" 
                y="48" 
                width="25" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="drop-shadow-md"
                style={{
                  animation: 'slideInFromRight 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards 0.15s',
                  opacity: 0,
                  animationFillMode: 'forwards',
                  filter: 'url(#glow)'
                }}
              />
            </g>
          )}

          {/* Row 3 - Third level */}
          {animationPhase >= 4 && (
            <g>
              <rect 
                x="35" 
                y="56" 
                width="30" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="drop-shadow-md"
                style={{
                  animation: 'slideInFromLeft 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards 0.2s',
                  opacity: 0,
                  animationFillMode: 'forwards',
                  filter: 'url(#glow)'
                }}
              />
              <rect 
                x="95" 
                y="56" 
                width="30" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="drop-shadow-md"
                style={{
                  animation: 'slideInFromRight 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards 0.25s',
                  opacity: 0,
                  animationFillMode: 'forwards',
                  filter: 'url(#glow)'
                }}
              />
            </g>
          )}

          {/* Row 4 - Bottom level */}
          {animationPhase >= 5 && (
            <g>
              <rect 
                x="25" 
                y="64" 
                width="35" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="drop-shadow-md"
                style={{
                  animation: 'slideInFromLeft 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards 0.3s',
                  opacity: 0,
                  animationFillMode: 'forwards',
                  filter: 'url(#glow)'
                }}
              />
              <rect 
                x="100" 
                y="64" 
                width="35" 
                height="10" 
                rx="2"
                fill="url(#roofGradient)"
                className="drop-shadow-md"
                style={{
                  animation: 'slideInFromRight 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards 0.35s',
                  opacity: 0,
                  animationFillMode: 'forwards',
                  filter: 'url(#glow)'
                }}
              />
            </g>
          )}

          {/* Completion effects */}
          {animationPhase >= 6 && (
            <g>
              {/* Success glow around house */}
              <path 
                d="M20 75 L80 35 L140 75 Z" 
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                opacity="0.8"
                className="animate-pulse"
                filter="url(#glow)"
              />
              
              {/* Sparkles */}
              <circle cx="50" cy="50" r="2" fill="#f87171" className="animate-ping"/>
              <circle cx="110" cy="55" r="1.5" fill="#6366f1" className="animate-ping" style={{ animationDelay: '0.2s' }}/>
              <circle cx="80" cy="45" r="1" fill="#8b5cf6" className="animate-ping" style={{ animationDelay: '0.4s' }}/>
            </g>
          )}

          {/* Shimmer effect */}
          {shimmerActive && (
            <rect 
              x="20" 
              y="35" 
              width="120" 
              height="90" 
              fill="url(#shimmerGradient)"
              className="animate-shimmer"
              style={{
                animation: 'shimmer 1s ease-in-out forwards'
              }}
            />
          )}
        </svg>
      </div>

      {showMessage && (
        <div className="text-center space-y-3">
          <p className="text-violet-700 text-sm font-semibold tracking-wide">
            {message}
          </p>
          <div className="flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-30px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromRight {
          0% {
            transform: translateX(30px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen