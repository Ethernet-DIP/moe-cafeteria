"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { MealCategory, MealType } from "@/lib/types"
import { addMealCategory, updateMealCategory } from "@/lib/meal-service"

interface MealCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: MealCategory
  mealTypes: MealType[]
  onSuccess: () => void
}

export default function MealCategoryForm({
  open,
  onOpenChange,
  category,
  mealTypes,
  onSuccess,
}: MealCategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [mealTypeId, setMealTypeId] = useState(category?.mealTypeId || "")
  const [categoryType, setCategoryType] = useState<"fasting" | "non_fasting">(category?.category || "fasting")
  const [normalPrice, setNormalPrice] = useState(category?.normalPrice.toString() || "")
  const [supportedPrice, setSupportedPrice] = useState(category?.supportedPrice.toString() || "")
  const [allowedCount, setAllowedCount] = useState(category?.allowedCount?.toString() || "1")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Update form fields when category prop changes
  useEffect(() => {
    if (category) {
      setName(category.name || "")
      setMealTypeId(category.mealTypeId || "")
      setCategoryType(category.category || "fasting")
      setNormalPrice(category.normalPrice?.toString() || "")
      setSupportedPrice(category.supportedPrice?.toString() || "")
      setAllowedCount(category.allowedCount?.toString() || "1")
    } else {
      // Reset form for new category
      setName("")
      setMealTypeId("")
      setCategoryType("fasting")
      setNormalPrice("")
      setSupportedPrice("")
      setAllowedCount("1")
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !mealTypeId || !normalPrice || !supportedPrice || !allowedCount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const normalPriceValue = Number.parseFloat(normalPrice)
      const supportedPriceValue = Number.parseFloat(supportedPrice)

      if (isNaN(normalPriceValue) || normalPriceValue <= 0) {
        throw new Error("Normal price must be a positive number")
      }

      if (isNaN(supportedPriceValue) || supportedPriceValue <= 0) {
        throw new Error("Supported price must be a positive number")
      }

      if (supportedPriceValue >= normalPriceValue) {
        throw new Error("Supported price must be less than normal price")
      }

      const allowedCountValue = Number.parseInt(allowedCount)
      if (isNaN(allowedCountValue) || allowedCountValue <= 0) {
        throw new Error("Allowed count must be a positive number")
      }

      if (category) {
        // Update existing category
        await updateMealCategory(category.id, {
          name,
          mealTypeId,
          category: categoryType,
          normalPrice: normalPriceValue,
          supportedPrice: supportedPriceValue,
          allowedCount: allowedCountValue,
        })
        toast({
          title: "Success",
          description: "Meal category updated successfully",
        })
      } else {
        // Add new category
        await addMealCategory({
          name,
          mealTypeId,
          category: categoryType,
          normalPrice: normalPriceValue,
          supportedPrice: supportedPriceValue,
          allowedCount: allowedCountValue,
          isActive: true,
        })
        toast({
          title: "Success",
          description: "Meal category added successfully",
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving meal category:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save meal category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Meal Category" : "Add Meal Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealTypeId} onValueChange={setMealTypeId}>
              <SelectTrigger id="mealType">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((mealType) => (
                  <SelectItem key={mealType.id} value={mealType.id}>
                    {mealType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryType} onValueChange={(value: "fasting" | "non_fasting") => setCategoryType(value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fasting">ጾም (Fasting)</SelectItem>
                <SelectItem value="non_fasting">የፍስግ (Non-Fasting)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="normalPrice">Normal Price (ETB)</Label>
              <Input
                id="normalPrice"
                type="number"
                step="0.01"
                min="0"
                value={normalPrice}
                onChange={(e) => setNormalPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportedPrice">Supported Price (ETB)</Label>
              <Input
                id="supportedPrice"
                type="number"
                step="0.01"
                min="0"
                value={supportedPrice}
                onChange={(e) => setSupportedPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedCount">Allowed Count</Label>
            <Input
              id="allowedCount"
              type="number"
              min="1"
              value={allowedCount}
              onChange={(e) => setAllowedCount(e.target.value)}
              placeholder="1"
              required
            />
            <p className="text-sm text-gray-500">Maximum number of items allowed from this category</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : category ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
