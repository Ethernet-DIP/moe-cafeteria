"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth-service"

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoBack} variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={handleLogout} variant="default">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
