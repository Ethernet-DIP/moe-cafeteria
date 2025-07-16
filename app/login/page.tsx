"use client"

import type React from "react"
import { login, getCurrentUser } from "@/lib/auth-service"

import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import type { LoginCredentials } from "@/lib/types"
import {Toaster} from "@/components/ui/toaster"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: "", password: "" })

  const router = useRouter()


  useEffect(() => {
    // Redirect if already logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      router.push("/admin")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await login(credentials)
      toast({
        title: "Success",
        description: "Login successful",
      })
      router.push("/admin")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
               <div className="relative h-20 w-20">
                <Image
                                  src="/images/ministry-logo.png"
                                  alt="Ministry of Education Logo"
                                  fill
                                  className="object-contain"
                                />
              </div>
           
             
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Moe Cafeteria System</h2>
            <p className="text-gray-600">Login to continue</p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                  Remember me
                </Label>
              </div>

              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 underline">
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Cafe Illustration */}
      <div className="hidden lg:block lg:flex-1 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-full h-full max-w-2xl max-h-2xl"
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="800" height="600" fill="url(#gradient1)" />

            {/* Cafe Building */}
            <rect x="150" y="200" width="500" height="300" fill="#8B4513" rx="10" />
            <rect x="170" y="220" width="460" height="260" fill="#D2691E" />

            {/* Roof */}
            <polygon points="100,200 400,100 700,200" fill="#654321" />
            <polygon points="120,200 400,120 680,200" fill="#8B4513" />

            {/* Windows */}
            <rect x="200" y="250" width="80" height="100" fill="#87CEEB" rx="5" />
            <rect x="320" y="250" width="80" height="100" fill="#87CEEB" rx="5" />
            <rect x="440" y="250" width="80" height="100" fill="#87CEEB" rx="5" />
            <rect x="560" y="250" width="80" height="100" fill="#87CEEB" rx="5" />

            {/* Window frames */}
            <rect x="195" y="245" width="90" height="110" fill="none" stroke="#654321" strokeWidth="3" rx="5" />
            <rect x="315" y="245" width="90" height="110" fill="none" stroke="#654321" strokeWidth="3" rx="5" />
            <rect x="435" y="245" width="90" height="110" fill="none" stroke="#654321" strokeWidth="3" rx="5" />
            <rect x="555" y="245" width="90" height="110" fill="none" stroke="#654321" strokeWidth="3" rx="5" />

            {/* Door */}
            <rect x="360" y="380" width="80" height="120" fill="#8B4513" rx="5" />
            <circle cx="420" cy="440" r="3" fill="#FFD700" />

            {/* Cafe Sign */}
            <rect x="300" y="180" width="200" height="40" fill="#FF6347" rx="20" />
            <text
              x="400"
              y="205"
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
            >
              CAFE
            </text>

            {/* Coffee Cup Steam */}
            <path
              d="M 250 150 Q 255 140 250 130 Q 245 120 250 110"
              stroke="#D3D3D3"
              strokeWidth="3"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 260 150 Q 265 140 260 130 Q 255 120 260 110"
              stroke="#D3D3D3"
              strokeWidth="3"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 270 150 Q 275 140 270 130 Q 265 120 270 110"
              stroke="#D3D3D3"
              strokeWidth="3"
              fill="none"
              opacity="0.7"
            />

            {/* Coffee Cup */}
            <ellipse cx="260" cy="170" rx="15" ry="8" fill="#8B4513" />
            <rect x="245" y="162" width="30" height="20" fill="#D2691E" />
            <ellipse cx="260" cy="162" rx="15" ry="8" fill="#654321" />
            <path d="M 275 167 Q 285 167 285 177 Q 285 187 275 187" stroke="#8B4513" strokeWidth="3" fill="none" />

            {/* Trees */}
            <ellipse cx="80" cy="350" rx="40" ry="60" fill="#228B22" />
            <rect x="75" y="380" width="10" height="40" fill="#8B4513" />

            <ellipse cx="720" cy="330" rx="35" ry="50" fill="#228B22" />
            <rect x="715" y="355" width="10" height="35" fill="#8B4513" />

            {/* Clouds */}
            <ellipse cx="150" cy="80" rx="30" ry="20" fill="white" opacity="0.8" />
            <ellipse cx="170" cy="75" rx="25" ry="15" fill="white" opacity="0.8" />
            <ellipse cx="180" cy="85" rx="20" ry="12" fill="white" opacity="0.8" />

            <ellipse cx="600" cy="60" rx="35" ry="25" fill="white" opacity="0.8" />
            <ellipse cx="625" cy="55" rx="30" ry="20" fill="white" opacity="0.8" />
            <ellipse cx="640" cy="65" rx="25" ry="15" fill="white" opacity="0.8" />

            {/* Sun */}
            <circle cx="700" cy="100" r="30" fill="#FFD700" opacity="0.9" />
            <path d="M 700 40 L 700 60" stroke="#FFD700" strokeWidth="4" />
            <path d="M 760 100 L 740 100" stroke="#FFD700" strokeWidth="4" />
            <path d="M 700 140 L 700 160" stroke="#FFD700" strokeWidth="4" />
            <path d="M 640 100 L 660 100" stroke="#FFD700" strokeWidth="4" />
            <path d="M 742 58 L 728 72" stroke="#FFD700" strokeWidth="4" />
            <path d="M 742 142 L 728 128" stroke="#FFD700" strokeWidth="4" />
            <path d="M 658 58 L 672 72" stroke="#FFD700" strokeWidth="4" />
            <path d="M 658 142 L 672 128" stroke="#FFD700" strokeWidth="4" />

            {/* Outdoor Tables */}
            <ellipse cx="120" cy="450" rx="25" ry="15" fill="#8B4513" />
            <rect x="115" y="435" width="10" height="30" fill="#654321" />

            <ellipse cx="680" cy="470" rx="25" ry="15" fill="#8B4513" />
            <rect x="675" y="455" width="10" height="30" fill="#654321" />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#E0F6FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-300 rounded-full opacity-15"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-blue-400 rounded-full opacity-10"></div>
      </div>
      <Toaster/>
    </div>
  )
}
