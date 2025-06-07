"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { MealType } from "@/lib/types"
import { addMealType, updateMealType } from "@/lib/meal-service"

interface MealTypeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType?: MealType
  onSuccess: () => void
}

export default function MealTypeForm({ open, onOpenChange, mealType, onSuccess }: MealTypeFormProps) {
  const [name, setName] = useState(mealType?.name || "")
  const [price, setPrice] = useState(mealType?.price.toString() || "")
  const [icon, setIcon] = useState(mealType?.icon || "utensils")
  const [color, setColor] = useState(mealType?.color || "bg-emerald-100 text-emerald-700")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const priceValue = Number.parseFloat(price)

      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Price must be a positive number")
      }

      if (mealType) {
        // Update existing meal type
        await updateMealType(mealType.id, {
          name,
          price: priceValue,
          icon,
          color,
        })
        toast({
          title: "Success",
          description: "Meal type updated successfully",
        })
      } else {
        // Add new meal type
        await addMealType({
          name,
          price: priceValue,
          icon,
          enabled: true,
          color,
        })
        toast({
          title: "Success",
          description: "Meal type added successfully",
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving meal type:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save meal type",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mealType ? "Edit Meal Type" : "Add Meal Type"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter meal name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (ETB)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coffee">Breakfast</SelectItem>
                <SelectItem value="utensils">Lunch</SelectItem>
                <SelectItem value="moon">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color Theme</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg-amber-100 text-amber-700">Amber</SelectItem>
                <SelectItem value="bg-emerald-100 text-emerald-700">Emerald</SelectItem>
                <SelectItem value="bg-indigo-100 text-indigo-700">Indigo</SelectItem>
                <SelectItem value="bg-rose-100 text-rose-700">Rose</SelectItem>
                <SelectItem value="bg-blue-100 text-blue-700">Blue</SelectItem>
                <SelectItem value="bg-purple-100 text-purple-700">Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mealType ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
