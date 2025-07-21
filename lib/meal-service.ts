"use client"

import type { MealType, MealCategory } from "./types"

// Default meal types
const DEFAULT_MEAL_TYPES: MealType[] = [
  {
    id: "breakfast",
    name: "ቁርስ",
    icon: "coffee",
    enabled: true,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "lunch",
    name: "ምሳ",
    icon: "utensils",
    enabled: true,
    color: "bg-emerald-100 text-emerald-700",
  },
 
]

// Default meal categories with fasting/non-fasting variants
const DEFAULT_MEAL_CATEGORIES: MealCategory[] = [
  // Breakfast categories
  {
    id: "breakfast-fasting",
    mealTypeId: "breakfast",
    category: "fasting",
    name: "ቁርስ - ጾም",
    normalPrice: 30,
    supportedPrice: 20,
    enabled: true,
  },
  {
    id: "breakfast-non-fasting",
    mealTypeId: "breakfast",
    category: "non_fasting",
    name: "ቁርስ - የፍስግ",
    normalPrice: 40,
    supportedPrice: 30,
    enabled: true,
  },
  // Lunch categories
  {
    id: "lunch-fasting",
    mealTypeId: "lunch",
    category: "fasting",
    name: "ምሳ - ጾም",
    normalPrice: 50,
    supportedPrice: 40,
    enabled: true,
  },
  {
    id: "lunch-non-fasting",
    mealTypeId: "lunch",
    category: "non_fasting",
    name: "ምሳ - የፍስግ",
    normalPrice: 60,
    supportedPrice: 50,
    enabled: true,
  },

]

// Get all meal types
export const getMealTypes = async (): Promise<MealType[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const storedMealTypes = localStorage.getItem("mealTypes")
  return storedMealTypes ? JSON.parse(storedMealTypes) : DEFAULT_MEAL_TYPES
}

// Get all meal categories
export const getMealCategories = async (): Promise<MealCategory[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const storedCategories = localStorage.getItem("mealCategories")
  return storedCategories ? JSON.parse(storedCategories) : DEFAULT_MEAL_CATEGORIES
}

// Get enabled meal categories
export const getEnabledMealCategories = async (): Promise<MealCategory[]> => {
  const categories = await getMealCategories()
  return categories.filter((category) => category.enabled)
}

// Get meal categories by meal type
export const getMealCategoriesByType = async (mealTypeId: string): Promise<MealCategory[]> => {
  const categories = await getMealCategories()
  return categories.filter((category) => category.mealTypeId === mealTypeId && category.enabled)
}

// Get meal category by ID
export const getMealCategoryById = async (id: string): Promise<MealCategory> => {
  const categories = await getMealCategories()
  console.log(categories)
  const category = categories.find((cat) => cat.id === id)

  if (!category) {
    throw new Error(`Meal category with ID ${id} not found`)
  }

  return category
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

// Add meal category
export const addMealCategory = async (category: Omit<MealCategory, "id">): Promise<MealCategory> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const categories = await getMealCategories()
  const id = `${category.mealTypeId}-${category.category}-${Date.now()}`

  const newCategory: MealCategory = {
    ...category,
    id,
  }

  categories.push(newCategory)
  localStorage.setItem("mealCategories", JSON.stringify(categories))

  return newCategory
}

// Update meal category
export const updateMealCategory = async (id: string, updates: Partial<MealCategory>): Promise<MealCategory> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const categories = await getMealCategories()
  const index = categories.findIndex((cat) => cat.id === id)

  if (index === -1) {
    throw new Error(`Meal category with ID ${id} not found`)
  }

  const updatedCategory = {
    ...categories[index],
    ...updates,
  }

  categories[index] = updatedCategory
  localStorage.setItem("mealCategories", JSON.stringify(categories))

  return updatedCategory
}

// Delete meal category
export const deleteMealCategory = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const categories = await getMealCategories()
  const filteredCategories = categories.filter((cat) => cat.id !== id)

  localStorage.setItem("mealCategories", JSON.stringify(filteredCategories))
}

// Toggle meal category enabled status
export const toggleMealCategoryEnabled = async (id: string): Promise<MealCategory> => {
  const category = await getMealCategoryById(id)
  return updateMealCategory(id, { enabled: !category.enabled })
}

// Add meal type
export const addMealType = async (mealType: Omit<MealType, "id">): Promise<MealType> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mealTypes = await getMealTypes()
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
