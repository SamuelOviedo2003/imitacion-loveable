import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-red-100 relative">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
      <div className="relative z-10">
        {/* Header Card */}
        <div className="container mx-auto px-6 pt-6">
          <Card className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg">
            <header className="flex items-center justify-between px-8 py-4">
              <div className="flex items-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VM83AopODeRbWG1Ol4Eblk7MP7Qaka.png"
                  alt="Hard Roof Logo"
                  className="h-12 w-auto bg-white rounded px-1"
                  style={{
                    filter: "drop-shadow(0 0 0 white)",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
                  Dashboard
                </a>
                <div className="relative group">
                  <a
                    href="#"
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium flex items-center"
                  >
                    New Leads
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                </div>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
                  Incoming Calls
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
                  Salesman
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
                  FB Analysis
                </a>
              </nav>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                  <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </header>
          </Card>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">Connecting you</span> <span className="text-gray-400">to the</span>
                  <br />
                  <span className="text-gray-400">home</span> <span className="text-gray-900">you love</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                "Turning your dreams into reality, one home at a time. Let us guide you to your perfect place."
              </p>
            </div>

            {/* Right Content - House Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MdgSk6ap6pAmDNKNPVi01Tv8ARx9D6.png"
                  alt="Luxury brick home with complex roofline - aerial view"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "500px" }}
                />

                {/* Property Card Overlay */}
                <div className="absolute bottom-6 right-6 bg-white rounded-2xl p-4 shadow-lg max-w-xs">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Luxury Brick Estate</h3>
                    <p className="text-gray-600 text-sm">
                      Stunning two-story home with premium brick exterior and complex roofline design.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">USD $750,000</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full bg-transparent">
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="w-8 h-8 p-0 rounded-full bg-red-600 hover:bg-red-700">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
