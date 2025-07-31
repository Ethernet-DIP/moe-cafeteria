"use client"

import { useEffect } from "react"
import { restoreAuth } from "@/lib/auth-service"

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Restore authentication on component mount
    restoreAuth()
  }, [])

  return <>{children}</>
} 