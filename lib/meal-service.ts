"use client"

import type { MealType, MealCategory } from "./types"
import { apiClient } from "./axiosInstance"

// Get all meal types
export const getMealTypes = async (): Promise<MealType[]> => {
  try {
    const response = await apiClient.get("/meal-types")
    return response.data
  } catch (error) {
    console.error("Error fetching meal types:", error)
    throw new Error("Failed to fetch meal types")
  }
}

// Get all meal categories
export const getMealCategories = async (): Promise<MealCategory[]> => {
  try {
    const response = await apiClient.get("/meal-categories")
    return response.data
  } catch (error) {
    console.error("Error fetching meal categories:", error)
    throw new Error("Failed to fetch meal categories")
  }
}

// Get active meal categories
export const getActiveMealCategories = async (): Promise<MealCategory[]> => {
  try {
    const response = await apiClient.get("/meal-categories/active")
    return response.data
  } catch (error) {
    console.error("Error fetching active meal categories:", error)
    throw new Error("Failed to fetch active meal categories")
  }
}

// Get meal categories by meal type
export const getMealCategoriesByType = async (mealTypeId: string): Promise<MealCategory[]> => {
  try {
    const response = await apiClient.get(`/meal-categories/by-type/${mealTypeId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meal categories by type:", error)
    throw new Error("Failed to fetch meal categories by type")
  }
}

// Get meal category by ID
export const getMealCategoryById = async (id: string): Promise<MealCategory> => {
  try {
    const response = await apiClient.get(`/meal-categories/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meal category:", error)
    throw new Error(`Meal category with ID ${id} not found`)
  }
}

// Get active meal types
export const getActiveMealTypes = async (): Promise<MealType[]> => {
  try {
    const response = await apiClient.get("/meal-types/active")
    return response.data
  } catch (error) {
    console.error("Error fetching active meal types:", error)
    throw new Error("Failed to fetch active meal types")
  }
}

// Get meal type by ID
export const getMealTypeById = async (id: string): Promise<MealType> => {
  try {
    const response = await apiClient.get(`/meal-types/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meal type:", error)
    throw new Error(`Meal type with ID ${id} not found`)
  }
}

// Add meal category
export const addMealCategory = async (category: Omit<MealCategory, "id">): Promise<MealCategory> => {
  try {
    const response = await apiClient.post("/meal-categories", category)
    return response.data
  } catch (error) {
    console.error("Error adding meal category:", error)
    throw new Error("Failed to add meal category")
  }
}

// Update meal category
export const updateMealCategory = async (id: string, updates: Partial<MealCategory>): Promise<MealCategory> => {
  try {
    const response = await apiClient.put(`/meal-categories/${id}`, updates)
    return response.data
  } catch (error) {
    console.error("Error updating meal category:", error)
    throw new Error("Failed to update meal category")
  }
}

// Delete meal category
export const deleteMealCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/meal-categories/${id}`)
  } catch (error) {
    console.error("Error deleting meal category:", error)
    throw new Error("Failed to delete meal category")
  }
}

// Toggle meal category active status
export const toggleMealCategoryActive = async (id: string): Promise<MealCategory> => {
  try {
    const response = await apiClient.patch(`/meal-categories/${id}/toggle`)
    return response.data
  } catch (error) {
    console.error("Error toggling meal category status:", error)
    throw new Error("Failed to toggle meal category status")
  }
}

// Add meal type
export const addMealType = async (mealType: Omit<MealType, "id">): Promise<MealType> => {
  try {
    const response = await apiClient.post("/meal-types", mealType)
    return response.data
  } catch (error) {
    console.error("Error adding meal type:", error)
    throw new Error("Failed to add meal type")
  }
}

// Update meal type
export const updateMealType = async (id: string, updates: Partial<MealType>): Promise<MealType> => {
  try {
    const response = await apiClient.put(`/meal-types/${id}`, updates)
    return response.data
  } catch (error) {
    console.error("Error updating meal type:", error)
    throw new Error("Failed to update meal type")
  }
}

// Delete meal type
export const deleteMealType = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/meal-types/${id}`)
  } catch (error) {
    console.error("Error deleting meal type:", error)
    throw new Error("Failed to delete meal type")
  }
}

// Toggle meal type active status
export const toggleMealTypeActive = async (id: string): Promise<MealType> => {
  try {
    const response = await apiClient.patch(`/meal-types/${id}/toggle`)
    return response.data
  } catch (error) {
    console.error("Error toggling meal type status:", error)
    throw new Error("Failed to toggle meal type status")
  }
}
