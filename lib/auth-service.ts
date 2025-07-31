"use client"

import type { User, LoginCredentials } from "./types"
import { apiClient } from "./axiosInstance"

// Get current user from session
export const getCurrentUser = (): User | null => {
  const userSession = localStorage.getItem("currentUser")
  return userSession ? JSON.parse(userSession) : null
}

// Login function
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    // First, try to authenticate with the backend
    const response = await apiClient.post("/auth/login", credentials)
    const loginResponse = response.data

    if (loginResponse.success && loginResponse.user) {
      // Store user session (excluding password)
      const { password, ...userSession } = loginResponse.user
      localStorage.setItem("currentUser", JSON.stringify(userSession))
      
      // Store credentials for future requests (in a real app, use a more secure method)
      localStorage.setItem("authCredentials", JSON.stringify({
        username: credentials.username,
        password: credentials.password
      }))
      
      // Update the axios instance to include authentication for future requests
      const auth = btoa(`${credentials.username}:${credentials.password}`)
      apiClient.defaults.headers.common['Authorization'] = `Basic ${auth}`
      
      return userSession
    } else {
      throw new Error(loginResponse.message || "Login failed")
    }
  } catch (error: any) {
    console.error("Login error:", error)
    
    // Fallback to local authentication if backend is not available
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.warn("Backend unavailable, falling back to local authentication")
      return await localLogin(credentials)
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Login failed")
  }
}

// Local login fallback
const localLogin = async (credentials: LoginCredentials): Promise<User> => {
  // Demo users for fallback
  const DEMO_USERS: (User & { password: string })[] = [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      email: "admin@ministry.gov.et",
      fullName: "አድሚን ተስፋዬ",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: "2",
      username: "manager",
      password: "manager123",
      email: "manager@ministry.gov.et",
      fullName: "ማናጀር አበበ",
      role: "manager",
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: "3",
      username: "operator",
      password: "operator123",
      email: "operator@ministry.gov.et",
      fullName: "ኦፐሬተር ሰላም",
      role: "operator",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]

  const user = DEMO_USERS.find(
    (u) => u.username === credentials.username && u.password === credentials.password && u.isActive,
  )

  if (!user) {
    throw new Error("Invalid username or password")
  }

  // Store user session (excluding password)
  const { password, ...userSession } = user
  localStorage.setItem("currentUser", JSON.stringify(userSession))

  return userSession
}

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Try to logout from backend
    await apiClient.post("/auth/logout")
  } catch (error) {
    console.warn("Backend logout failed, continuing with local logout")
  }
  
  // Always clear local session
  localStorage.removeItem("currentUser")
  localStorage.removeItem("authCredentials")
  
  // Clear authentication header
  delete apiClient.defaults.headers.common['Authorization']
}

// Restore authentication from stored credentials
export const restoreAuth = (): boolean => {
  try {
    const authCredentials = localStorage.getItem("authCredentials")
    const currentUser = localStorage.getItem("currentUser")
    
    if (authCredentials && currentUser) {
      const credentials = JSON.parse(authCredentials)
      const auth = btoa(`${credentials.username}:${credentials.password}`)
      apiClient.defaults.headers.common['Authorization'] = `Basic ${auth}`
      return true
    }
  } catch (error) {
    console.error("Error restoring auth:", error)
  }
  return false
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

// Check if user has required role
export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser()
  if (!user) return false

  // Normalize roles to lowercase for comparison
  const userRole = user.role?.toLowerCase() || ""
  const normalizedRequiredRole = requiredRole.toLowerCase()

  console.log("hasRole - User role:", user.role)
  console.log("hasRole - Normalized user role:", userRole)
  console.log("hasRole - Required role:", requiredRole)
  console.log("hasRole - Normalized required role:", normalizedRequiredRole)

  const roleHierarchy = { admin: 3, manager: 2, operator: 1 }
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[normalizedRequiredRole as keyof typeof roleHierarchy] || 0

  console.log("hasRole - User level:", userLevel)
  console.log("hasRole - Required level:", requiredLevel)
  console.log("hasRole - Result:", userLevel >= requiredLevel)

  return userLevel >= requiredLevel
}

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get("/users")
    return response.data
  } catch (error: any) {
    console.error("Error fetching users:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to fetch users")
  }
}

// Create user
export const createUser = async (userData: Omit<User, "id" | "createdAt"> & { password: string }): Promise<User> => {
  try {
    const response = await apiClient.post("/users", userData)
    return response.data
  } catch (error: any) {
    console.error("Error creating user:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to create user")
  }
}

// Update user
export const updateUser = async (id: string, updates: Partial<User & { password?: string }>): Promise<User> => {
  try {
    const response = await apiClient.put(`/users/${id}`, updates)
    return response.data
  } catch (error: any) {
    console.error("Error updating user:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to update user")
  }
}

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`)
  } catch (error: any) {
    console.error("Error deleting user:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to delete user")
  }
}

// Toggle user active status
export const toggleUserStatus = async (id: string): Promise<User> => {
  try {
    const response = await apiClient.patch(`/users/${id}/toggle`)
    return response.data
  } catch (error: any) {
    console.error("Error toggling user status:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to toggle user status")
  }
}
