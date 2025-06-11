"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { getMealTypes, toggleMealTypeEnabled, deleteMealType } from "@/lib/meal-service"
import type { MealType } from "@/lib/types"
import MealTypeForm from "@/components/meal-type-form"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function MealTypesPage() {
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(true)
  const [mealTypeFormOpen, setMealTypeFormOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mealTypeToDelete, setMealTypeToDelete] = useState<MealType | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const mealTypeData = await getMealTypes()
      setMealTypes(mealTypeData)
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

  const handleAddMealType = () => {
    setSelectedMealType(undefined)
    setMealTypeFormOpen(true)
  }

  const handleEditMealType = (mealType: MealType) => {
    setSelectedMealType(mealType)
    setMealTypeFormOpen(true)
  }

  const handleDeleteMealType = (mealType: MealType) => {
    setMealTypeToDelete(mealType)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteMealType = async () => {
    if (!mealTypeToDelete) return

    try {
      await deleteMealType(mealTypeToDelete.id)
      toast({
        title: "Success",
        description: "Meal type deleted successfully",
      })
      fetchData()
    } catch (error) {
      console.error("Error deleting meal type:", error)
      toast({
        title: "Error",
        description: "Failed to delete meal type",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setMealTypeToDelete(null)
    }
  }

  const handleToggleMealType = async (mealType: MealType) => {
    try {
      await toggleMealTypeEnabled(mealType.id)
      toast({
        title: "Success",
        description: `Meal type ${mealType.enabled ? "disabled" : "enabled"} successfully`,
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling meal type:", error)
      toast({
        title: "Error",
        description: "Failed to update meal type",
        variant: "destructive",
      })
    }
  }

  const getMealIcon = (iconName: string) => {
    switch (iconName) {
      case "coffee":
        return "Breakfast"
      case "utensils":
        return "Lunch"
      case "moon":
        return "Dinner"
      default:
        return "Meal"
    }
  }

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-3xl font-bold tracking-tight">Meal Types</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Meal Types</CardTitle>
          <Button onClick={handleAddMealType} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Meal Type
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading meal types...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No meal types found
                      </TableCell>
                    </TableRow>
                  ) : (
                    mealTypes.map((mealType) => (
                      <TableRow key={mealType.id}>
                        <TableCell>
                          <div
                            className={`inline-block w-3 h-3 rounded-full mr-2 ${mealType.color.split(" ")[0]}`}
                          ></div>
                          {mealType.name}
                        </TableCell>
                        <TableCell>{getMealIcon(mealType.icon)}</TableCell>
                        <TableCell>{mealType.price.toFixed(2)} ETB</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch checked={mealType.enabled} onCheckedChange={() => handleToggleMealType(mealType)} />
                            <span className="flex items-center">
                              {mealType.enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              {mealType.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditMealType(mealType)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteMealType(mealType)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MealTypeForm
        open={mealTypeFormOpen}
        onOpenChange={setMealTypeFormOpen}
        mealType={selectedMealType}
        onSuccess={fetchData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Delete Meal Type
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the meal type "{mealTypeToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMealType} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
