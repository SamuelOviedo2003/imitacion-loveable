import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/* Left side - House image */}
        <div className="relative bg-gradient-to-br from-green-800 to-green-900 p-8 flex flex-col justify-between min-h-[600px]">
          <div className="flex items-center text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back to website</span>
          </div>

          <div className="relative flex-1 flex items-center justify-center">
            <Image
              src="/images/house.png"
              alt="Beautiful modern house"
              width={400}
              height={300}
              className="rounded-lg shadow-lg object-cover"
              priority
            />
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Create account</h1>
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link href="/" className="text-green-800 hover:text-green-900 font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm text-slate-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-green-800 hover:text-green-900">
                    Terms & Conditions
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full h-12 bg-green-800 hover:bg-green-900 text-white font-medium">
                Create account
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
