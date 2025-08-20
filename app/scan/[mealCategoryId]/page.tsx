'use client'
import { Suspense, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import CafeteriaScanner from "@/components/cafeteria-scanner"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getMealCategoryById, getMealCategoriesByType } from "@/lib/meal-service"
import ProtectedRoute from "@/components/protected-route"
import { MealCategory } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ScanPage({ params }: { params: { mealCategoryId: string } }) {
  const [mealCategory, setMealCategory] = useState<MealCategory | null>()
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([params.mealCategoryId])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    fetchData(params.mealCategoryId)
  }, [params.mealCategoryId])
  
  const fetchData = async (mealCategoryId: string) => {
    setLoading(true)
    try {
      // Fetch meal category to validate it exists and is enabled
      const mealCat = await getMealCategoryById(mealCategoryId)
      
      if (!mealCat.isActive) {
        notFound()
      }
      setMealCategory(mealCat)
      
      // Fetch all meal categories for the same meal type
      const categories = await getMealCategoriesByType(mealCat.mealTypeId)
      setMealCategories(categories.filter(cat => cat.isActive))
    } catch (err) {
      console.log(err)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/scan/${categoryId}`)
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="operator">
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading scanner...</p>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="operator">
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Meal Selection
            </Button>
          </Link>
        </div>

        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Meal Categories */}
          <div className="w-80 flex-shrink-0">
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-lg">Meal Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mealCategories.map((category) => (
                  <div 
                    key={category.id} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategories.includes(category.id) 
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                        : 'border-sidebar-border bg-sidebar-accent'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className={`text-xs ${
                          selectedCategories.includes(category.id) 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {category.category === 'fasting' ? 'Fasting' : 'Non-Fasting'}
                        </span>
                      </div>
                      <div className={`text-xs mt-1 ${
                        selectedCategories.includes(category.id) 
                          ? 'text-primary-foreground/60' 
                          : 'text-muted-foreground'
                      }`}>
                        {category.normalPrice} ETB
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Scanner */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div className="text-center">Loading scanner...</div>}>
              <CafeteriaScanner mealCategoryId={params.mealCategoryId} />
            </Suspense>
          </div>
        </div>
        
        <Toaster />
      </main>
    </ProtectedRoute>
  )
}
