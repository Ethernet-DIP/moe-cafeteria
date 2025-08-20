"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMealCategories, getMealTypes, toggleMealCategoryActive, deleteMealCategory } from "@/lib/meal-service"
import type { MealCategory, MealType } from "@/lib/types"
import MealCategoryForm from "@/components/meal-category-form"
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

export default function MealCategoriesPage() {
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([])
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<MealCategory | null>(null)
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [categoriesData, typesData] = await Promise.all([getMealCategories(), getMealTypes()])
      setMealCategories(categoriesData)
      setMealTypes(typesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load meal categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(undefined)
    setCategoryFormOpen(true)
  }

  const handleEditCategory = (category: MealCategory) => {
    setSelectedCategory(category)
    setCategoryFormOpen(true)
  }

  const handleDeleteCategory = (category: MealCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      await deleteMealCategory(categoryToDelete.id)
      toast({
        title: "Success",
        description: "Meal category deleted successfully",
      })
      fetchData()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete meal category",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleToggleCategory = async (category: MealCategory) => {
    try {
      await toggleMealCategoryActive(category.id)
      toast({
        title: "Success",
        description: `Meal category ${category.isActive ? "disabled" : "enabled"} successfully`,
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling category:", error)
      toast({
        title: "Error",
        description: "Failed to update meal category",
        variant: "destructive",
      })
    }
  }

  const getMealTypeName = (mealTypeId: string) => {
    const mealType = mealTypes.find((mt) => mt.id === mealTypeId)
    return mealType?.name || "Unknown"
  }

  const getCategoryBadge = (category: "fasting" | "non_fasting") => {
    return category === "fasting" ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        ጾም
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        የፍስግ
      </Badge>
    )
  }

  // Filter categories based on selected filters
  const filteredCategories = mealCategories.filter((category) => {
    const matchesMealType = mealTypeFilter === "all" || category.mealTypeId === mealTypeFilter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && category.isActive) || 
      (statusFilter === "inactive" && !category.isActive)
    
    return matchesMealType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Meal Categories</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Meal Categories</CardTitle>
          <Button onClick={handleAddCategory} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Meal Type:</label>
              <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {mealTypes.map((mealType) => (
                    <SelectItem key={mealType.id} value={mealType.id}>
                      {mealType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">
                Showing {filteredCategories.length} of {mealCategories.length} categories
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading meal categories...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Normal Price</TableHead>
                    <TableHead>Supported Price</TableHead>
                    <TableHead>Allowed Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        {mealCategories.length === 0 ? "No meal categories found" : "No categories match the selected filters"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{getMealTypeName(category.mealTypeId)}</TableCell>
                        <TableCell>{getCategoryBadge(category.category)}</TableCell>
                        <TableCell>{category.normalPrice.toFixed(2)} ETB</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {category.supportedPrice.toFixed(2)} ETB
                        </TableCell>
                        <TableCell className="text-center">
                          {category.allowedCount || 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch checked={category.isActive} onCheckedChange={() => handleToggleCategory(category)} />
                            <span className="flex items-center">
                              {category.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              {category.isActive ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category)}>
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

      <MealCategoryForm
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        category={selectedCategory}
        mealTypes={mealTypes}
        onSuccess={fetchData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Delete Meal Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the meal category "{categoryToDelete?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
