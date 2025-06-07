"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Ticket, Palette, Hash } from "lucide-react"
import type { MealType } from "@/lib/types"
import { getMealTypes } from "@/lib/meal-service"
import { generateCoupons } from "@/lib/coupon-service"
import Image from "next/image"

interface CouponGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const COUPON_COLORS = [
  { name: "Blue", value: "bg-blue-500", preview: "bg-blue-100 border-blue-500 text-blue-700" },
  { name: "Green", value: "bg-green-500", preview: "bg-green-100 border-green-500 text-green-700" },
  { name: "Red", value: "bg-red-500", preview: "bg-red-100 border-red-500 text-red-700" },
  { name: "Purple", value: "bg-purple-500", preview: "bg-purple-100 border-purple-500 text-purple-700" },
  { name: "Orange", value: "bg-orange-500", preview: "bg-orange-100 border-orange-500 text-orange-700" },
  { name: "Pink", value: "bg-pink-500", preview: "bg-pink-100 border-pink-500 text-pink-700" },
  { name: "Indigo", value: "bg-indigo-500", preview: "bg-indigo-100 border-indigo-500 text-indigo-700" },
  { name: "Teal", value: "bg-teal-500", preview: "bg-teal-100 border-teal-500 text-teal-700" },
]

export default function CouponGeneratorModal({ open, onOpenChange, onSuccess }: CouponGeneratorModalProps) {
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [formData, setFormData] = useState({
    count: "",
    mealTypeId: "",
    title: "",
    color: COUPON_COLORS[0].value,
  })
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchMealTypes()
      // Reset form
      setFormData({
        count: "",
        mealTypeId: "",
        title: "",
        color: COUPON_COLORS[0].value,
      })
    }
  }, [open])

  const fetchMealTypes = async () => {
    setLoading(true)
    try {
      const mealTypeData = await getMealTypes()
      setMealTypes(mealTypeData.filter((mt) => mt.enabled))
    } catch (error) {
      console.error("Error fetching meal types:", error)
      toast({
        title: "Error",
        description: "Failed to load meal types",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.count || !formData.mealTypeId || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const count = Number.parseInt(formData.count)
    if (isNaN(count) || count <= 0 || count > 1000) {
      toast({
        title: "Error",
        description: "Please enter a valid number of coupons (1-1000)",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)

    try {
      const result = await generateCoupons(count, formData.mealTypeId, formData.title.trim(), formData.color)

      toast({
        title: "Success",
        description: `Generated ${count} coupons with batch number: ${result.batchNumber}`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error generating coupons:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate coupons",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const selectedColor = COUPON_COLORS.find((c) => c.value === formData.color) || COUPON_COLORS[0]
  const selectedMealType = mealTypes.find((mt) => mt.id === formData.mealTypeId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Generate Coupons
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon Count */}
          <div className="space-y-2">
            <Label htmlFor="count">Number of Coupons *</Label>
            <div className="relative">
              <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                placeholder="Enter number of coupons"
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Maximum 1000 coupons per batch</p>
          </div>

          {/* Meal Type */}
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type *</Label>
            <Select
              value={formData.mealTypeId}
              onValueChange={(value) => setFormData({ ...formData, mealTypeId: value })}
              disabled={loading}
            >
              <SelectTrigger id="mealType">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((mealType) => (
                  <SelectItem key={mealType.id} value={mealType.id}>
                    {mealType.name} - {mealType.price.toFixed(2)} ETB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coupon Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Coupon Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Staff Lunch Coupon, Guest Meal Voucher"
              required
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Coupon Color
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {COUPON_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.color === color.value ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-200"
                  }`}
                >
                  <div className={`w-full h-8 rounded ${color.value}`}></div>
                  <p className="text-xs mt-1">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {formData.title && selectedMealType && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className={`${selectedColor.preview} border-2 border-dashed`}>
                <CardContent className="p-4 text-center">
                  <div className="space-y-2">
                    <div className="flex justify-center mb-2">
                      <div className="relative w-12 h-12">
                        <Image
                          src="/images/ministry-logo.png"
                          alt="Ministry of Education"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{formData.title}</h3>
                    <p className="text-sm">{selectedMealType.name}</p>
                    <p className="text-xs font-mono">SAMPLE123</p>
                    <p className="text-xs opacity-75">Valid for one meal</p>
                    <p className="text-xs opacity-60">Ministry of Education</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
              Cancel
            </Button>
            <Button type="submit" disabled={generating || loading}>
              {generating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                "Generate Coupons"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
