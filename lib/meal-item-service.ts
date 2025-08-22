"use client"

import type { MealItem } from "./types"
import { apiClient } from "./axiosInstance"

// Get all meal items
export const getMealItems = async (): Promise<MealItem[]> => {
  try {
    const response = await apiClient.get("/meal-items")
    return response.data
  } catch (error) {
    console.error("Error fetching meal items:", error)
    throw new Error("Failed to fetch meal items")
  }
}

// Get active meal items
export const getActiveMealItems = async (): Promise<MealItem[]> => {
  try {
    const response = await apiClient.get("/meal-items/active")
    return response.data
  } catch (error) {
    console.error("Error fetching active meal items:", error)
    throw new Error("Failed to fetch active meal items")
  }
}

// Get meal items by category
export const getMealItemsByCategory = async (mealCategoryId: string): Promise<MealItem[]> => {
  try {
    const response = await apiClient.get(`/meal-items/by-category/${mealCategoryId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meal items by category:", error)
    throw new Error("Failed to fetch meal items by category")
  }
}

// Get meal item by ID
export const getMealItemById = async (id: string): Promise<MealItem> => {
  try {
    const response = await apiClient.get(`/meal-items/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meal item:", error)
    throw new Error(`Meal item with ID ${id} not found`)
  }
}

// Create meal item
export const createMealItem = async (mealItem: Omit<MealItem, "id" | "createdAt" | "updatedAt"> & { file?: File }): Promise<MealItem> => {
  try {
    const form = new FormData()
    form.append('name', mealItem.name)
    if (mealItem.description) form.append('description', mealItem.description)
    form.append('mealCategoryId', mealItem.mealCategoryId)
    if (mealItem.color) form.append('color', mealItem.color)
    form.append('totalAvailable', String(mealItem.totalAvailable ?? 0))
    form.append('isActive', String(mealItem.isActive ?? true))
    if ((mealItem as any).file) form.append('file', (mealItem as any).file as File)
    const response = await apiClient.post("/meal-items", form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  } catch (error) {
    console.error("Error creating meal item:", error)
    throw new Error("Failed to create meal item")
  }
}

// Update meal item
export const updateMealItem = async (id: string, updates: Partial<MealItem> & { file?: File }): Promise<MealItem> => {
  try {
    const form = new FormData()
    if (updates.name) form.append('name', updates.name)
    if (updates.description) form.append('description', updates.description)
    if (updates.mealCategoryId) form.append('mealCategoryId', updates.mealCategoryId)
    if (updates.color) form.append('color', updates.color)
    if (typeof updates.totalAvailable === 'number') form.append('totalAvailable', String(updates.totalAvailable))
    if (typeof updates.isActive === 'boolean') form.append('isActive', String(updates.isActive))
    if ((updates as any).file) form.append('file', (updates as any).file as File)
    const response = await apiClient.put(`/meal-items/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  } catch (error) {
    console.error("Error updating meal item:", error)
    throw new Error("Failed to update meal item")
  }
}

// Toggle meal item active status
export const toggleMealItemActive = async (id: string): Promise<boolean> => {
  try {
    const response = await apiClient.patch(`/meal-items/${id}/toggle`)
    return response.data
  } catch (error) {
    console.error("Error toggling meal item status:", error)
    throw new Error("Failed to toggle meal item status")
  }
}

// Update meal item availability
export const updateMealItemAvailability = async (id: string, totalAvailable: number): Promise<boolean> => {
  try {
    const response = await apiClient.patch(`/meal-items/${id}/availability`, totalAvailable)
    return response.data
  } catch (error) {
    console.error("Error updating meal item availability:", error)
    throw new Error("Failed to update meal item availability")
  }
}

// Delete meal item
export const deleteMealItem = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/meal-items/${id}`)
  } catch (error) {
    console.error("Error deleting meal item:", error)
    throw new Error("Failed to delete meal item")
  }
} 