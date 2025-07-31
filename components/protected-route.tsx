"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, hasRole } from "@/lib/auth-service"
import type { User } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole = "operator" }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    console.log("ProtectedRoute - Current user:", currentUser)
    console.log("ProtectedRoute - Required role:", requiredRole)

    if (!currentUser) {
      console.log("ProtectedRoute - No user found, redirecting to login")
      router.push("/login")
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      console.log("ProtectedRoute - User doesn't have required role, redirecting to unauthorized")
      console.log("ProtectedRoute - User role:", currentUser.role)
      console.log("ProtectedRoute - Required role:", requiredRole)
      console.log("ProtectedRoute - Has role result:", hasRole(requiredRole))
      router.push("/unauthorized")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
