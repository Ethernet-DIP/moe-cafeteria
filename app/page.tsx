"use client"

import { MealSelector } from "@/components/meal-selector"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/protected-route"
import { useRouter } from "next/navigation"
import type { MealCategory } from "@/lib/types"

export default function Home() {
  const router = useRouter()

  const handleMealSelect = (mealCategory: MealCategory) => {
    // Navigate to the scan page with the selected meal category
    router.push(`/scan/${mealCategory.id}`)
  }

  return (
    <ProtectedRoute requiredRole="operator">
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Cafeteria Access System</h1>
            <p className="mt-2 text-lg text-gray-600">Select a meal type to begin scanning</p>
          </div>

          <MealSelector onMealSelect={handleMealSelect} />
        </div>
        <Toaster />
      </main>
    </ProtectedRoute>
  )
}
