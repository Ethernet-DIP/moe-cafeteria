"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Wifi, CreditCard, Hash, CheckCircle } from "lucide-react"
import type { Employee } from "@/lib/types"
import { assignCardToEmployee } from "@/lib/employee-service"

interface EmployeeAssignmentModalProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EmployeeAssignmentModal({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EmployeeAssignmentModalProps) {
  const [cardId, setCardId] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open && employee) {
      setCardId(employee.cardId || "")
      setShortCode(employee.shortCode || "")
      setScanSuccess(false)
      setIsScanning(false)

      // Generate new 4-digit code if employee doesn't have one
      if (!employee.shortCode) {
        generateShortCode()
      }
    }
  }, [open, employee])

  useEffect(() => {
    if (open && isScanning) {
      // Initialize NFC reader if available
      if ("NDEFReader" in window) {
        initializeNFC()
      }

      // Always keep input focused when scanning
      const focusInput = () => {
        if (inputRef.current && isScanning) {
          inputRef.current.focus()
        }
      }

      focusInput()
      const interval = setInterval(focusInput, 100)

      return () => clearInterval(interval)
    }
  }, [open, isScanning])

  const generateShortCode = () => {
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setShortCode(code)
  }

  const initializeNFC = async () => {
    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.scan()

      ndef.addEventListener("reading", ({ serialNumber }: { serialNumber: string }) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set the card ID and show success
        setCardId(serialNumber)
        setScanSuccess(true)
        setIsScanning(false)

        toast({
          title: "NFC Card Detected",
          description: `Card ID: ${serialNumber}`,
        })

        // Auto-hide success after 3 seconds
        timeoutRef.current = setTimeout(() => {
          setScanSuccess(false)
        }, 3000)
      })

      ndef.addEventListener("error", () => {
        toast({
          title: "NFC Error",
          description: "Error reading NFC card. Please try again.",
          variant: "destructive",
        })
        setIsScanning(false)
      })
    } catch (error) {
      console.log("NFC not available or permission denied")
      toast({
        title: "NFC Not Available",
        description: "NFC is not supported or permission was denied. Please enter the card ID manually.",
        variant: "destructive",
      })
      setIsScanning(false)
    }
  }

  const handleInputChange = (value: string) => {
    setCardId(value)
    setScanSuccess(false)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Auto-process after user stops typing (for manual entry)
    if (value.length >= 8) {
      timeoutRef.current = setTimeout(() => {
        setScanSuccess(true)
        setTimeout(() => setScanSuccess(false), 3000)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && cardId.trim()) {
      setScanSuccess(true)
      setTimeout(() => setScanSuccess(false), 3000)
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanSuccess(false)
    setCardId("")

    toast({
      title: "NFC Scanning Started",
      description: "Please tap your NFC card on the reader or enter the card ID manually.",
    })
  }

  const stopScanning = () => {
    setIsScanning(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employee || !cardId.trim() || !shortCode.trim()) {
      toast({
        title: "Error",
        description: "Please provide both card ID and short code",
        variant: "destructive",
      })
      return
    }

    if (shortCode.length !== 4 || !/^\d{4}$/.test(shortCode)) {
      toast({
        title: "Error",
        description: "Short code must be exactly 4 digits",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await assignCardToEmployee(employee.id, cardId.trim(), shortCode.trim())

      toast({
        title: "Success",
        description: "Card assigned successfully to employee",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error assigning card:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign card",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign NFC Card - {employee.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.department}</p>
                <p className="text-sm text-muted-foreground">ID: {employee.employeeId}</p>
              </div>
            </CardContent>
          </Card>

          {/* NFC Scanning Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">NFC Card Assignment</Label>
              {!isScanning ? (
                <Button type="button" variant="outline" size="sm" onClick={startScanning}>
                  <Wifi className="mr-2 h-4 w-4" />
                  Start NFC Scan
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={stopScanning}>
                  Stop Scanning
                </Button>
              )}
            </div>

            {/* Card ID Input */}
            <div className="space-y-2">
              <Label htmlFor="cardId">Card ID</Label>
              <div className="relative">
                <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  id="cardId"
                  value={cardId}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isScanning ? "Scanning for NFC card..." : "Enter card ID or scan NFC card"}
                  className={`pl-8 ${isScanning ? "animate-pulse" : ""} ${scanSuccess ? "border-green-500" : ""}`}
                  disabled={loading}
                />
                {scanSuccess && <CheckCircle className="absolute right-2.5 top-2.5 h-4 w-4 text-green-500" />}
                {isScanning && (
                  <div className="absolute right-2.5 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {isScanning && (
                <p className="text-xs text-blue-600 flex items-center">
                  <Wifi className="mr-1 h-3 w-3" />
                  Ready to scan NFC card or enter manually
                </p>
              )}
            </div>

            {/* Short Code Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="shortCode">4-Digit Access Code</Label>
                <Button type="button" variant="ghost" size="sm" onClick={generateShortCode}>
                  <Hash className="mr-1 h-3 w-3" />
                  Generate New
                </Button>
              </div>
              <Input
                id="shortCode"
                value={shortCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setShortCode(value)
                }}
                placeholder="4-digit code"
                maxLength={4}
                className="text-center text-lg font-mono"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">This code can be used as an alternative to the NFC card</p>
            </div>
          </div>

          {/* Current Assignment Info */}
          {(employee.cardId || employee.shortCode) && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Current Assignment:</h4>
                  {employee.cardId && (
                    <p className="text-sm text-muted-foreground">
                      Card ID: <span className="font-mono">{employee.cardId}</span>
                    </p>
                  )}
                  {employee.shortCode && (
                    <p className="text-sm text-muted-foreground">
                      Short Code: <span className="font-mono">{employee.shortCode}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !cardId.trim() || !shortCode.trim()}>
              {loading ? "Assigning..." : "Assign Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
