"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Eye, EyeOff, LogIn } from "lucide-react"
import Image from "next/image"
import { login, getCurrentUser } from "@/lib/auth-service"
import type { LoginCredentials } from "@/lib/types"

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
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

    setLoading(true)

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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24">
                <Image
                  src="/images/ministry-logo.png"
                  alt="Ministry of Education Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Cafeteria Management System</CardTitle>
            <p className="text-gray-600 mt-2">Ministry of Education</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter your username"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  <strong>Admin:</strong> admin / admin123
                </p>
                <p>
                  <strong>Manager:</strong> manager / manager123
                </p>
                <p>
                  <strong>Operator:</strong> operator / operator123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
