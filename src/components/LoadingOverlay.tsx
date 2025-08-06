"use client"

import LoadingScreen from './LoadingScreen'

interface LoadingOverlayProps {
  message?: string
  show?: boolean
  blur?: boolean
}

const LoadingOverlay = ({ 
  message = "Preparing your workspace...", 
  show = true,
  blur = true 
}: LoadingOverlayProps) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with modern gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-rose-50 ${
          blur ? 'backdrop-blur-sm' : ''
        }`}
      >
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-violet-200 rounded-full mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-rose-200 rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Overlay for content clarity */}
        <div className="absolute inset-0 bg-white/40"></div>
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Construction-themed floating particles */}
        <div className="absolute top-1/6 left-1/6 w-2 h-2 bg-violet-300 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-rose-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/8 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/8 w-1 h-1 bg-violet-400 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/6 left-1/3 w-2 h-2 bg-rose-300 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle geometric shapes */}
        <div className="absolute top-1/5 right-1/3 transform rotate-45">
          <div className="w-3 h-3 border border-violet-200 animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>
        <div className="absolute bottom-1/3 left-1/5 transform rotate-12">
          <div className="w-4 h-4 border border-rose-200 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
        </div>
      </div>
      
      {/* Loading content */}
      <div className="relative z-10 text-center px-8">
        <LoadingScreen 
          message={message}
          size="lg"
          showMessage={true}
        />
        
        {/* Additional subtitle for enhanced UX */}
        <div className="mt-4 max-w-md mx-auto">
          <p className="text-xs text-violet-600/70 font-medium tracking-wider uppercase">
            Building your experience
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay