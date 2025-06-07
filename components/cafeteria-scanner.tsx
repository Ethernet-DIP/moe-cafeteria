"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, Utensils, Coffee, Moon } from "lucide-react"
import Image from "next/image"
import type { Employee, MealType } from "@/lib/types"
import { getEmployeeByCardId, recordMeal, hasUsedMeal } from "@/lib/employee-service"
import { getMealTypeById } from "@/lib/meal-service"

interface CafeteriaScannerProps {
  mealTypeId: string
}

export default function CafeteriaScanner({ mealTypeId }: CafeteriaScannerProps) {
  const [inputValue, setInputValue] = useState("")
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const errorAudioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // successAudioRef.current = new Audio("/success.mp3")
    // errorAudioRef.current = new Audio("/error.mp3")

    // Always keep input focused
    const focusInput = () => {
      if (inputRef.current && !processing) {
        inputRef.current.focus()
      }
    }

    focusInput()
    const interval = setInterval(focusInput, 100)

    // Fetch meal type
    const fetchMealType = async () => {
      try {
        const mt = await getMealTypeById(mealTypeId)
        setMealType(mt)
      } catch (error) {
        console.error("Error fetching meal type:", error)
        toast({
          title: "Error",
          description: "Could not load meal type information",
          variant: "destructive",
        })
      }
    }

    fetchMealType()

    return () => clearInterval(interval)
  }, [mealTypeId, processing, toast])

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
    if (processing || !input.trim() || !mealType) return

    setProcessing(true)
    setEmployee(null)
    setError(null)
    setSuccess(false)

    try {
      const emp = await getEmployeeByCardId(input.trim())
      setEmployee(emp)

      const alreadyUsed = await hasUsedMeal(emp.cardId, mealTypeId)

      if (alreadyUsed) {
        setError(`${emp.name} has already used their ${mealType.name} allowance today.`)
        // errorAudioRef.current?.play()
      } else {
        await recordMeal(emp.cardId, mealTypeId)
        setSuccess(true)
        // successAudioRef.current?.play()
      }
    } catch (err) {
      setError("Employee not found with this card or code.")
      // errorAudioRef.current?.play()
    } finally {
      setProcessing(false)
      setInputValue("")

      // Clear results after 3 seconds
      setTimeout(() => {
        setEmployee(null)
        setError(null)
        setSuccess(false)
      }, 3000)
    }
  }

  const getMealIcon = () => {
    if (!mealType) return <Utensils className="h-6 w-6" />

    switch (mealType.icon) {
      case "coffee":
        return <Coffee className="h-6 w-6" />
      case "utensils":
        return <Utensils className="h-6 w-6" />
      case "moon":
        return <Moon className="h-6 w-6" />
      default:
        return <Utensils className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {mealType && (
            <div className="flex items-center justify-center mb-6">
              <div className={`p-3 rounded-full ${mealType.color}`}>{getMealIcon()}</div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold">{mealType.name} Scanning</h2>
                <p className="text-sm text-gray-500">{mealType.price.toFixed(2)} ETB</p>
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
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-gray-500">{employee.department}</p>
                <p className="text-sm text-gray-400">ID: {employee.employeeId}</p>
                <p className="text-sm text-gray-400">Code: {employee.shortCode}</p>
              </div>

              {error ? (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-center">{error}</div>
              ) : success && mealType ? (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-center">
                  <p>{mealType.name} access granted!</p>
                  <p className="font-bold mt-1">{mealType.price.toFixed(2)} ETB</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-8">
              {processing ? (
                <div className="space-y-4">
                  <div className="animate-pulse flex justify-center">
                    <div
                      className={`w-16 h-16 ${mealType?.color || "bg-gray-100 text-gray-700"} rounded-full flex items-center justify-center`}
                    >
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
