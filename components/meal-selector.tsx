"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coffee, Utensils, Moon, Leaf, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import type { MealType, MealCategory } from "@/lib/types"
import { getEnabledMealTypes, getMealCategoriesByType } from "@/lib/meal-service"

export default function MealSelector() {
  const router = useRouter()
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [mealCategories, setMealCategories] = useState<{ [key: string]: MealCategory[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enabledMealTypes = await getEnabledMealTypes()
        setMealTypes(enabledMealTypes)

        // Fetch categories for each meal type
        const categoriesMap: { [key: string]: MealCategory[] } = {}
        for (const mealType of enabledMealTypes) {
          const categories = await getMealCategoriesByType(mealType.id)
          categoriesMap[mealType.id] = categories
        }
        setMealCategories(categoriesMap)
      } catch (error) {
        console.error("Error fetching meal data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleMealSelection = (mealCategoryId: string) => {
    router.push(`/scan/category/${mealCategoryId}`)
  }

  const getMealIcon = (iconName: string) => {
    switch (iconName) {
      case "coffee":
        return <Coffee className="h-8 w-8" />
      case "utensils":
        return <Utensils className="h-8 w-8" />
      case "moon":
        return <Moon className="h-8 w-8" />
      default:
        return <Utensils className="h-8 w-8" />
    }
  }

  const getCategoryIcon = (category: "fasting" | "non_fasting") => {
    return category === "fasting" ? <Leaf className="h-4 w-4" /> : <UtensilsCrossed className="h-4 w-4" />
  }

  const getCategoryLabel = (category: "fasting" | "non_fasting") => {
    return category === "fasting" ? "ጾም" : "የጾም"
  }

  if (loading) {
    return <div className="text-center py-12">Loading meal types...</div>
  }

  if (mealTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">No meal types are currently enabled.</p>
        <Button onClick={() => router.push("/admin")}>Go to Admin Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {mealTypes.map((mealType) => {
        const categories = mealCategories[mealType.id] || []

        if (categories.length === 0) return null

        return (
          <div key={mealType.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${mealType.color}`}>{getMealIcon(mealType.icon)}</div>
              <h2 className="text-2xl font-bold">{mealType.name}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className={`${mealType.color} py-4`}>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {getCategoryIcon(category.category)}
                      <span>{category.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Normal Price:</span>
                        <span className="font-bold text-lg">{category.normalPrice.toFixed(2)} ETB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Supported Price:</span>
                        <span className="font-bold text-lg text-green-600">
                          {category.supportedPrice.toFixed(2)} ETB
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 text-center mb-3">
                          Supported {(category.normalPrice - category.supportedPrice).toFixed(2)} ETB
                        </p>
                        <Button className="w-full" onClick={() => handleMealSelection(category.id)}>
                          Select {getCategoryLabel(category.category)}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
