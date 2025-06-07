import MealSelector from "@/components/meal-selector"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/protected-route"

export default function Home() {
  return (
    <ProtectedRoute requiredRole="operator">
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Cafeteria Access System</h1>
            <p className="mt-2 text-lg text-gray-600">Select a meal type to begin scanning</p>
          </div>

          <MealSelector />
        </div>
        <Toaster />
      </main>
    </ProtectedRoute>
  )
}
