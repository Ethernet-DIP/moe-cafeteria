"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, Utensils, Coffee, Moon, Leaf, UtensilsCrossed, DollarSign } from "lucide-react"
import Image from "next/image"
import type { Employee, MealCategory } from "@/lib/types"
import { getEmployeeByCardId, recordMeal, hasUsedMeal, getMealPricing } from "@/lib/employee-service"
import { getMealCategoryById } from "@/lib/meal-service"

interface CafeteriaScannerProps {
  mealCategoryId: string
}

export default function CafeteriaScanner({ mealCategoryId }: CafeteriaScannerProps) {
  const [inputValue, setInputValue] = useState("")
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [mealCategory, setMealCategory] = useState<MealCategory | null>(null)
  const [pricing, setPricing] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const errorAudioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    successAudioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3")
    errorAudioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3")

    // Always keep input focused
    const focusInput = () => {
      if (inputRef.current && !processing) {
        inputRef.current.focus()
      }
    }

    focusInput()
    const interval = setInterval(focusInput, 100)

    // Fetch meal category
    const fetchMealCategory = async () => {
      try {
        const category = await getMealCategoryById(mealCategoryId)
        setMealCategory(category)
      } catch (error) {
        console.error("Error fetching meal category:", error)
        toast({
          title: "Error",
          description: "Could not load meal information",
          variant: "destructive",
        })
      }
    }

    fetchMealCategory()

    return () => clearInterval(interval)
  }, [mealCategoryId, processing, toast])

  useEffect(() => {
    // Initialize NFC reader if available
    if ("NDEFReader" in window) {
      initializeNFC()
    }
  }, [])

  const initializeNFC = async () => {
    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.scan()

      ndef.addEventListener("reading", ({ serialNumber }: { serialNumber: string }) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set the input value and process after a short delay
        setInputValue(serialNumber)
        timeoutRef.current = setTimeout(() => {
          processInput(serialNumber)
        }, 500)
      })

      ndef.addEventListener("error", () => {
        toast({
          title: "NFC Error",
          description: "Error reading NFC card",
          variant: "destructive",
        })
      })
    } catch (error) {
      console.log("NFC not available or permission denied")
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Auto-process after user stops typing (for manual entry)
    if (value.length >= 4) {
      timeoutRef.current = setTimeout(() => {
        processInput(value)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      processInput(inputValue.trim())
    }
  }

  const processInput = async (input: string) => {
    if (processing || !input.trim() || !mealCategory) return

    setProcessing(true)
    setEmployee(null)
    setPricing(null)
    setError(null)
    setSuccess(false)

    try {
      const emp = await getEmployeeByCardId(input.trim())
      setEmployee(emp)

      // Get pricing information for this employee
      const pricingInfo = await getMealPricing(emp, mealCategoryId)
      setPricing(pricingInfo)

      const alreadyUsed = await hasUsedMeal(emp.cardId, mealCategory.mealTypeId)

      if (alreadyUsed) {
        setError(`${emp.name} has already used their ${mealCategory.name} allowance today.`)
        errorAudioRef.current?.play()
      } else {
        try {
          await recordMeal(emp.cardId, mealCategoryId)
          setSuccess(true)
          successAudioRef.current?.play()
        } catch (mealError: any) {
          // Handle meal recording specific errors
          setError(mealError.message || "Failed to record meal")
          errorAudioRef.current?.play()
        }
      }
    } catch (err: any) {
      // Handle employee lookup and other errors
      if (err.message && err.message.includes("Employee has already used")) {
        setError(err.message)
      } else {
        setError("Employee not found with this card or code.")
      }
      errorAudioRef.current?.play()
    } finally {
      setProcessing(false)
      setInputValue("")

      // Clear results after 10 seconds - REMOVED
      // setTimeout(() => {
      //   setEmployee(null)
      //   setPricing(null)
      //   setError(null)
      //   setSuccess(false)
      // }, 10000)
    }
  }

  const getMealIcon = () => {
    if (!mealCategory) return <Utensils className="h-6 w-6" />

    // Get the meal type icon from the meal category's meal type
    const iconMap = {
      breakfast: <Coffee className="h-6 w-6" />,
      lunch: <Utensils className="h-6 w-6" />,
      dinner: <Moon className="h-6 w-6" />,
    }

    return iconMap[mealCategory.mealTypeId as keyof typeof iconMap] || <Utensils className="h-6 w-6" />
  }

  const getCategoryIcon = () => {
    if (!mealCategory) return null
    return mealCategory.category === "fasting" ? <Leaf className="h-4 w-4" /> : <UtensilsCrossed className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {mealCategory && (
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gray-100">{getMealIcon()}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{mealCategory.name}</h2>
                    {getCategoryIcon()}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>Normal: {mealCategory.normalPrice.toFixed(2)} ETB</span>
                    <span className="text-green-600">Supported: {mealCategory.supportedPrice.toFixed(2)} ETB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan NFC card or enter 4-digit employee code..."
              className="text-center text-lg py-3"
              disabled={processing}
            />
            <p className="text-sm text-gray-500 text-center mt-2">
              {processing ? "Processing..." : "Ready to scan or type employee code"}
            </p>
          </div>

          {employee ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                <Image
                  src={employee.photoUrl || "/placeholder.svg?height=128&width=128"}
                  alt={employee.name}
                  fill
                  className="object-cover"
                />
                {(error || success) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    {error ? (
                      <AlertCircle className="h-16 w-16 text-red-500" />
                    ) : (
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    )}
                  </div>
                )}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold">{employee.name} - {employee.department}</h2>
                <p className="text-sm text-gray-400">ID: {employee.employeeId} - Code: {employee.shortCode}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.eligibleForSupport ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {employee.supportStatus}
                  </div>
                </div>
              </div>

              {pricing && (
                <div className="w-full max-w-sm">
                  <Card
                    className={`border-2 ${pricing.priceType === "supported" ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50"}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-semibold">
                          {pricing.priceType === "supported" ? "Supported Price" : "Normal Price"}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mb-2">{pricing.applicablePrice.toFixed(2)} ETB</div>
                      {pricing.priceType === "supported" && (
                        <div className="text-sm text-green-600">Subsidy {pricing.supportAmount.toFixed(2)} ETB</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {error ? (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-center w-full max-w-sm">{error}</div>
              ) : success && mealCategory && pricing ? (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-center w-full max-w-sm">
                  <p className="font-semibold">{mealCategory.name} access granted!</p>
                  <p className="text-sm mt-1">
                    Charged: {pricing.applicablePrice.toFixed(2)} ETB
                    {pricing.priceType === "supported" && (
                      <span className="block">Saved: {pricing.supportAmount.toFixed(2)} ETB</span>
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-8">
              {processing ? (
                <div className="space-y-4">
                  <div className="animate-pulse flex justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      {getMealIcon()}
                    </div>
                  </div>
                  <p>Processing...</p>
                </div>
              ) : (
                <p>Scan your card or enter your 4-digit code</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="link" onClick={() => (window.location.href = "/admin")}>
          Admin Dashboard
        </Button>
      </div>
    </div>
  )
}
