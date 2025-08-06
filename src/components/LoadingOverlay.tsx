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
      {/* Enhanced Background with modern pastel gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-blue-50/80 via-lavender-50/80 to-rose-50/80 ${
          blur ? 'backdrop-blur-md' : ''
        }`}
      >
        {/* Subtle animated background pattern with pastel colors */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-peach-200 to-rose-200 rounded-full mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-mint-200 to-emerald-200 rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-gradient-to-r from-lavender-200 to-purple-200 rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/2 w-28 h-28 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
        
        {/* Overlay for content clarity */}
        <div className="absolute inset-0 bg-white/50"></div>
      </div>
      
      {/* Floating decorative elements with pastel theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Pastel floating particles */}
        <div className="absolute top-1/6 left-1/6 w-3 h-3 bg-gradient-to-r from-peach-300 to-orange-300 rounded-full animate-ping shadow-sm" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/4 right-1/6 w-2 h-2 bg-gradient-to-r from-mint-300 to-emerald-300 rounded-full animate-ping shadow-sm" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/8 w-2.5 h-2.5 bg-gradient-to-r from-lavender-300 to-purple-300 rounded-full animate-ping shadow-sm" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/8 w-2 h-2 bg-gradient-to-r from-sky-300 to-blue-300 rounded-full animate-ping shadow-sm" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/6 left-1/3 w-3 h-3 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full animate-ping shadow-sm" style={{ animationDelay: '4s' }}></div>
        
        {/* Modern geometric shapes */}
        <div className="absolute top-1/5 right-1/3 transform rotate-45">
          <div className="w-4 h-4 border-2 border-lavender-300 rounded animate-spin shadow-sm" style={{ animationDuration: '8s' }}></div>
        </div>
        <div className="absolute bottom-1/3 left-1/5 transform rotate-12">
          <div className="w-5 h-5 border-2 border-mint-300 rounded-lg animate-spin shadow-sm" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
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
        <div className="mt-6 max-w-md mx-auto">
          <div className="modern-card pastel-card-sky inline-block px-4 py-2">
            <p className="text-xs text-gray-600 font-medium tracking-wider uppercase">
              Preparing Your Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay