import { Suspense } from "react"
import { notFound } from "next/navigation"
import CafeteriaScanner from "@/components/cafeteria-scanner"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getMealTypeById } from "@/lib/meal-service"
import ProtectedRoute from "@/components/protected-route"

export default async function ScanPage({ params }: { params: { mealTypeId: string } }) {
  try {
    // Fetch meal type to validate it exists and is enabled
    const mealType = await getMealTypeById(params.mealTypeId)

    if (!mealType.enabled) {
      notFound()
    }

    return (
      <ProtectedRoute requiredRole="operator">
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Meal Selection
                </Button>
              </Link>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{mealType.name} Scanning</h1>
              <p className="mt-2 text-lg text-gray-600">Scan your employee card to access the cafeteria</p>
            </div>

            <Suspense fallback={<div className="text-center">Loading scanner...</div>}>
              <CafeteriaScanner mealTypeId={params.mealTypeId} />
            </Suspense>
          </div>
          <Toaster />
        </main>
      </ProtectedRoute>
    )
  } catch (error) {
    notFound()
  }
}
