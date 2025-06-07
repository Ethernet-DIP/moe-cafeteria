"use client"

import type { MealType } from "./types"

// Default meal types
const DEFAULT_MEAL_TYPES: MealType[] = [
  {
    id: "breakfast",
    name: "ቁርስ",
    price: 80,
    icon: "coffee",
    enabled: true,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "lunch",
    name: "ምሳ",
    price: 150,
    icon: "utensils",
    enabled: true,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "dinner",
    name: "እራት",
    price: 120,
    icon: "moon",
    enabled: true,
    color: "bg-indigo-100 text-indigo-700",
  },
]

// Get all meal types
export const getMealTypes = async (): Promise<MealType[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const storedMealTypes = localStorage.getItem("mealTypes")
  return storedMealTypes ? JSON.parse(storedMealTypes) : DEFAULT_MEAL_TYPES
}

// Get enabled meal types
export const getEnabledMealTypes = async (): Promise<MealType[]> => {
  const mealTypes = await getMealTypes()
  return mealTypes.filter((mealType) => mealType.enabled)
}

// Get meal type by ID
export const getMealTypeById = async (id: string): Promise<MealType> => {
  const mealTypes = await getMealTypes()
  const mealType = mealTypes.find((mt) => mt.id === id)

  if (!mealType) {
    throw new Error(`Meal type with ID ${id} not found`)
  }

  return mealType
}

// Add meal type
export const addMealType = async (mealType: Omit<MealType, "id">): Promise<MealType> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mealTypes = await getMealTypes()

  // Generate a unique ID
  const id = Date.now().toString()

  const newMealType: MealType = {
    ...mealType,
    id,
  }

  mealTypes.push(newMealType)
  localStorage.setItem("mealTypes", JSON.stringify(mealTypes))

  return newMealType
}

// Update meal type
export const updateMealType = async (id: string, updates: Partial<MealType>): Promise<MealType> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mealTypes = await getMealTypes()
  const index = mealTypes.findIndex((mt) => mt.id === id)

  if (index === -1) {
    throw new Error(`Meal type with ID ${id} not found`)
  }

  const updatedMealType = {
    ...mealTypes[index],
    ...updates,
  }

  mealTypes[index] = updatedMealType
  localStorage.setItem("mealTypes", JSON.stringify(mealTypes))

  return updatedMealType
}

// Delete meal type
export const deleteMealType = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mealTypes = await getMealTypes()
  const filteredMealTypes = mealTypes.filter((mt) => mt.id !== id)

  localStorage.setItem("mealTypes", JSON.stringify(filteredMealTypes))
}

// Toggle meal type enabled status
export const toggleMealTypeEnabled = async (id: string): Promise<MealType> => {
  const mealType = await getMealTypeById(id)
  return updateMealType(id, { enabled: !mealType.enabled })
}
