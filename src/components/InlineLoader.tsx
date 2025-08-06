"use client"

interface InlineLoaderProps {
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const InlineLoader = ({ size = 'sm', className = "" }: InlineLoaderProps) => {
  const sizes = {
    xs: { container: 'w-4 h-4', house: 16 },
    sm: { container: 'w-6 h-6', house: 24 }, 
    md: { container: 'w-8 h-8', house: 32 }
  }

  const currentSize = sizes[size]

  return (
    <div className={`inline-flex items-center justify-center ${currentSize.container} ${className}`}>
      <svg 
        width={currentSize.house} 
        height={currentSize.house} 
        viewBox="0 0 24 24" 
        className="animate-pulse"
      >
        <defs>
          <linearGradient id="inlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
        </defs>

        {/* Modern simplified house with reference colors */}
        <path 
          d="M4 13 L12 5 L20 13 L20 19 L16 19 L16 15 L8 15 L8 19 L4 19 Z" 
          fill="url(#inlineGradient)"
          opacity="0.9"
        />
        
        {/* Door */}
        <rect 
          x="10" 
          y="16" 
          width="4" 
          height="3" 
          fill="#f8fafc"
          rx="0.5"
        />
        
        {/* Windows */}
        <rect 
          x="6" 
          y="16" 
          width="2" 
          height="2" 
          fill="#bfdbfe"
          rx="0.2"
        />
        <rect 
          x="16" 
          y="16" 
          width="2" 
          height="2" 
          fill="#bfdbfe"
          rx="0.2"
        />

        {/* Animated roof repair with sparkle effect */}
        <path 
          d="M4 13 L12 5 L20 13" 
          stroke="#f87171"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse"
          opacity="0.8"
        />
        
        {/* Tiny sparkle */}
        <circle 
          cx="12" 
          cy="8" 
          r="0.5" 
          fill="#f87171" 
          className="animate-ping"
        />
      </svg>
    </div>
  )
}

export default InlineLoader