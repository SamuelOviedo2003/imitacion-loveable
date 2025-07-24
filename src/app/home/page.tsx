import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import ProtectedLayout from "@/components/ProtectedLayout"

export default function HomePage() {
  return (
    <ProtectedLayout>
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
    </ProtectedLayout>
  )
}