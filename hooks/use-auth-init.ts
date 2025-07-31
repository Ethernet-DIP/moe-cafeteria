"use client"

import { useEffect } from "react"
import { restoreAuth } from "@/lib/auth-service"

export const useAuthInit = () => {
  useEffect(() => {
    // Restore authentication on component mount
    restoreAuth()
  }, [])
} 