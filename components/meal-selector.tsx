"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getActiveMealTypes, getMealCategoriesByType } from "@/lib/meal-service"
import type { MealType, MealCategory } from "@/lib/types"

interface MealSelectorProps {
  onMealSelect: (mealCategory: MealCategory) => void
  selectedMealType?: string
}

export function MealSelector({ onMealSelect, selectedMealType }: MealSelectorProps) {
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(selectedMealType || null)
  const [categories, setCategories] = useState<MealCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMealTypes = async () => {
      try {
        const enabledMealTypes = await getActiveMealTypes()
        setMealTypes(enabledMealTypes)
        if (enabledMealTypes.length > 0 && !selectedType) {
          setSelectedType(enabledMealTypes[0].id)
        }
      } catch (error) {
        console.error("Error loading meal types:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMealTypes()
  }, [selectedType])

  useEffect(() => {
    const loadCategories = async () => {
      if (selectedType) {
        try {
          const mealCategories = await getMealCategoriesByType(selectedType)
          setCategories(mealCategories)
        } catch (error) {
          console.error("Error loading meal categories:", error)
        }
      }
    }

    loadCategories()
  }, [selectedType])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Meal Type Selection */}
      <div className="flex flex-wrap gap-2">
        {mealTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            onClick={() => setSelectedType(type.id)}
            className="flex items-center gap-2"
          >
            <span className={`text-lg ${type.icon === "coffee" ? "☕" : type.icon === "utensils" ? "🍽️" : "🌙"}`}></span>
            {type.name}
          </Button>
        ))}
      </div>

      {/* Meal Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <Badge variant={category.category === "fasting" ? "secondary" : "default"}>
                  {category.category === "fasting" ? "ጾም" : "የፍስግ"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Normal Price:</span>
                  <span className="font-semibold">${category.normalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Supported Price:</span>
                  <span className="font-semibold text-green-600">${category.supportedPrice}</span>
                </div>
                <Button
                  onClick={() => onMealSelect(category)}
                  className="w-full mt-4"
                >
                  Select Meal
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
