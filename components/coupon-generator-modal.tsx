"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import { Ticket, Palette, Hash } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

import type { MealType } from "@/lib/types"
import { getMealTypes } from "@/lib/meal-service"
import { generateCoupons } from "@/lib/coupon-service"

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
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    count: "",
    mealTypeId: "",
    title: "",
    color: COUPON_COLORS[0].value,
  })

  /* ------------------------------------------------------------------------ */
  /* Data loading                                                             */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (open) {
      fetchMealTypes()
      // reset
      setFormData({
        count: "",
        mealTypeId: "",
        title: "",
        color: COUPON_COLORS[0].value,
      })
    }
  }, [open])

  async function fetchMealTypes() {
    setLoading(true)
    try {
      const data = await getMealTypes()
      setMealTypes(data.filter((m) => m.enabled))
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to load meal types",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Submit handler                                                           */
  /* ------------------------------------------------------------------------ */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!formData.count || !formData.mealTypeId || !formData.title.trim()) {
      toast({
        title: "Missing data",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const count = Number.parseInt(formData.count, 10)
    if (isNaN(count) || count <= 0 || count > 1000) {
      toast({
        title: "Invalid count",
        description: "Enter a number between 1 and 1000.",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const { batchNumber } = await generateCoupons(count, formData.mealTypeId, formData.title.trim(), formData.color)
      toast({
        title: "Success",
        description: `Generated ${count} coupons (batch ${batchNumber}).`,
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate coupons.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Derived selections                                                        */
  /* ------------------------------------------------------------------------ */
  const selectedColor = COUPON_COLORS.find((c) => c.value === formData.color) ?? COUPON_COLORS[0]
  const selectedMealType = mealTypes.find((m) => m.id === formData.mealTypeId)

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */
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
          {/* Number of coupons ------------------------------------------------ */}
          <div className="space-y-2">
            <Label htmlFor="count">Number of Coupons *</Label>
            <div className="relative">
              <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="count"
                type="number"
                min={1}
                max={1000}
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                placeholder="Enter quantity"
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Maximum 1000 coupons per batch</p>
          </div>

          {/* Meal type ------------------------------------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type *</Label>
            <Select
              value={formData.mealTypeId}
              onValueChange={(v) => setFormData({ ...formData, mealTypeId: v })}
              disabled={loading}
            >
              <SelectTrigger id="mealType">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title ----------------------------------------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="title">Coupon Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Staff Lunch Coupon"
              required
            />
          </div>

          {/* Color picker ---------------------------------------------------- */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Coupon Color
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {COUPON_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.color === c.value ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-200"
                  }`}
                >
                  <div className={`w-full h-8 rounded ${c.value}`} />
                  <p className="text-xs mt-1">{c.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview ---------------------------------------------------- */}
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

          {/* Footer ---------------------------------------------------------- */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
              Cancel
            </Button>
            <Button type="submit" disabled={generating || loading}>
              {generating ? (
                <div className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating…
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
