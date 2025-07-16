"use client"

import {remoteAxiosInstance} from "./axiosInstance";
import type { User, LoginCredentials } from "./types"

// Demo users - in a real app, this would come from a database
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    email: "cafe-admin@ethernet.edu.et",
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
    email: "manager@ethernet.edu.et",
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
    email: "operator@ethernet.edu.et",
    fullName: "ኦፐሬተር ሰላም",
    role: "operator",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

// Get all users
const getUsers = async(): Promise<(User&{password: string;})[]> => {
    return remoteAxiosInstance.get("/users").then(response =>response.data).catch(err=> console.log(err));
  
  // const storedUsers = localStorage.getItem("users")
  // return storedUsers ? JSON.parse(storedUsers) : DEMO_USERS
}

// Save users
const saveUsers = (users: (User & { password: string })[]) => {
  localStorage.setItem("users", JSON.stringify(users))
}

// Get current user from session
export const getCurrentUser = (): User | null => {
  const userSession = localStorage.getItem("currentUser")
  return userSession ? JSON.parse(userSession) : null
}

// Login function
export const login = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const users = await getUsers()
  const user = users.find(
    (u) => u.username === credentials.username && u.password === credentials.password && u.isActive,
  )

  if (!user) {
    throw new Error("Invalid username or password")
  }

  // Update last login
  user.lastLogin = new Date().toISOString()
  saveUsers(users)

  // Store user session (excluding password)
  const { password, ...userSession } = user
  localStorage.setItem("currentUser", JSON.stringify(userSession))

  return userSession
}

// Logout function
export const logout = async (): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  localStorage.removeItem("currentUser")
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

// Check if user has required role
export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser()
  if (!user) return false

  const roleHierarchy = { admin: 3, manager: 2, operator: 1 }
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!hasRole("admin")) {
    throw new Error("Unauthorized")
  }

  const users = await getUsers()
  return users.map(({ password, ...user }) => user)
}

// Create user
export const createUser = async (userData: Omit<User, "id" | "createdAt"> & { password: string }): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!hasRole("admin")) {
    throw new Error("Unauthorized")
  }

  const users = await getUsers()

  // Check if username already exists
  if (users.some((u) => u.username === userData.username)) {
    throw new Error("Username already exists")
  }

  // Check if email already exists
  if (users.some((u) => u.email === userData.email)) {
    throw new Error("Email already exists")
  }

  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  const { password, ...userResponse } = newUser
  // remoteAxiosInstance.post("/users", newUser)
  return userResponse
}

// Update user
export const updateUser = async (id: string, updates: Partial<User & { password?: string }>): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!hasRole("admin")) {
    throw new Error("Unauthorized")
  }

  const users = await getUsers()
  const userIndex = users.findIndex((u) => u.id === id)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Check if username already exists (excluding current user)
  if (updates.username && users.some((u) => u.id !== id && u.username === updates.username)) {
    throw new Error("Username already exists")
  }

  // Check if email already exists (excluding current user)
  if (updates.email && users.some((u) => u.id !== id && u.email === updates.email)) {
    throw new Error("Email already exists")
  }

  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser
  saveUsers(users)

  const { password, ...userResponse } = updatedUser
  return userResponse
}

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!hasRole("admin")) {
    throw new Error("Unauthorized")
  }

  const users = await getUsers()
  const filteredUsers = users.filter((u) => u.id !== id)

  await remoteAxiosInstance.delete(`/users/${id}`);
  if (filteredUsers.length === users.length) {
    throw new Error("User not found")
  }

  saveUsers(filteredUsers)
}

// Toggle user active status
export const toggleUserStatus = async (id: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!hasRole("admin")) {
    throw new Error("Unauthorized")
  }

  const users = await getUsers()
  const userIndex = users.findIndex((u) => u.id === id)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  users[userIndex].isActive = !users[userIndex].isActive
  saveUsers(users)

  const { password, ...userResponse } = users[userIndex]
  return userResponse
}
