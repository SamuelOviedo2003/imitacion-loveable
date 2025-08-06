import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import ProtectedLayout from "@/components/ProtectedLayout"

export default function HomePage() {
  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
        {/* Main Content */}
        <main className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">Connecting you</span> <span className="text-gray-400">to the</span>
                  <br />
                  <span className="text-gray-400">home</span> <span className="text-indigo-600">you love</span>
                </h1>
              </div>

              {/* Description */}
              <div className="modern-card pastel-card-periwinkle max-w-lg">
                <p className="text-gray-700 text-lg leading-relaxed">
                  &ldquo;Turning your dreams into reality, one home at a time. Let us guide you to your perfect place.&rdquo;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="modern-button modern-button-primary">
                  Get Started
                </button>
                <button className="modern-button-secondary">
                  Learn More
                </button>
              </div>
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

                {/* Modern Property Card Overlay */}
                <div className="absolute bottom-6 right-6 modern-card max-w-xs">
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-gray-900">Luxury Brick Estate</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Stunning two-story home with premium brick exterior and complex roofline design.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-indigo-600">$750,000</span>
                      <div className="flex space-x-2">
                        <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <ArrowLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}