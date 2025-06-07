"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coffee, Utensils, Moon } from "lucide-react"
import { useRouter } from "next/navigation"
import type { MealType } from "@/lib/types"
import { getEnabledMealTypes } from "@/lib/meal-service"

export default function MealSelector() {
  const router = useRouter()
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const enabledMealTypes = await getEnabledMealTypes()
        setMealTypes(enabledMealTypes)
      } catch (error) {
        console.error("Error fetching meal types:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealTypes()
  }, [])

  const handleMealSelection = (mealTypeId: string) => {
    router.push(`/scan/${mealTypeId}`)
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
    <div className="grid gap-6 md:grid-cols-3">
      {mealTypes.map((meal) => (
        <Card key={meal.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className={`${meal.color} py-4`}>
            <CardTitle className="flex items-center justify-center gap-2">
              {getMealIcon(meal.icon)}
              <span>{meal.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-2 text-center text-gray-600">{meal.name}</p>
            <p className="mb-6 text-center font-bold">{meal.price.toFixed(2)} ETB</p>
            <Button className="w-full" onClick={() => handleMealSelection(meal.id)}>
              Select {meal.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
