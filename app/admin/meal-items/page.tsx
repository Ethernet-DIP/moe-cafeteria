"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle, Filter, Package } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { MealItem, MealCategory } from "@/lib/types"
import { getImageUrl } from "@/lib/utils"
import { 
  getMealItems, 
  createMealItem, 
  updateMealItem, 
  deleteMealItem, 
  toggleMealItemActive,
  updateMealItemAvailability 
} from "@/lib/meal-item-service"
import { getMealCategories } from "@/lib/meal-service"

export default function MealItemsPage() {
  const [mealItems, setMealItems] = useState<MealItem[]>([])
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MealItem | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mealCategoryId: "",
    imageUrl: "",
    color: "#3B82F6",
    totalAvailable: 0,
    isActive: true,
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getMealItems(),
        getMealCategories()
      ])
      setMealItems(itemsData)
      setMealCategories(categoriesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load meal items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await createMealItem({ ...formData, file: file ?? undefined })
      toast({
        title: "Success",
        description: "Meal item created successfully",
      })
      setIsCreateDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meal item",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingItem) return
    try {
      await updateMealItem(editingItem.id, { ...formData, file: file ?? undefined })
      toast({
        title: "Success",
        description: "Meal item updated successfully",
      })
      setEditingItem(null)
      resetForm()
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meal item",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal item?")) return
    try {
      await deleteMealItem(id)
      toast({
        title: "Success",
        description: "Meal item deleted successfully",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete meal item",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await toggleMealItemActive(id)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle meal item status",
        variant: "destructive",
      })
    }
  }

  const handleAvailabilityChange = async (id: string, totalAvailable: number) => {
    try {
      await updateMealItemAvailability(id, totalAvailable)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      mealCategoryId: "",
      imageUrl: "",
      color: "#3B82F6",
      totalAvailable: 0,
      isActive: true,
    })
    setFile(null)
  }

  const openEditDialog = (item: MealItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      mealCategoryId: item.mealCategoryId,
      imageUrl: item.imageUrl || "",
      color: item.color,
      totalAvailable: item.totalAvailable,
      isActive: item.isActive,
    })
    setFile(null)
  }

  const filteredItems = mealItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.mealCategoryId === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const getCategoryName = (categoryId: string) => {
    return mealCategories.find(cat => cat.id === categoryId)?.name || "Unknown"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Meal Items</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading meal items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Meal Items</h1>

      <Card>
                <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Meal Items</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search meal items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Category:</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mealCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">
                Showing {filteredItems.length} of {mealItems.length} items
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading meal items...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        {mealItems.length === 0 ? "No meal items found" : "No items match the search criteria"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {getImageUrl(item.imageUrl) ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden">
                              <Image
                                src={getImageUrl(item.imageUrl)!}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getCategoryName(item.mealCategoryId)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs">{item.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.totalAvailable}
                            onChange={(e) => handleAvailabilityChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch checked={item.isActive} onCheckedChange={() => handleToggleActive(item.id)} />
                            <span className="flex items-center">
                              {item.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              {item.isActive ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Meal Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., FirFir, Pizza, Burger"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of the meal item"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.mealCategoryId} onValueChange={(value) => setFormData({ ...formData, mealCategoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Image</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalAvailable">Total Available</Label>
                <Input
                  id="totalAvailable"
                  type="number"
                  value={formData.totalAvailable}
                  onChange={(e) => setFormData({ ...formData, totalAvailable: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Meal Item</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-category">Category</Label>
                              <Select value={formData.mealCategoryId} onValueChange={(value) => setFormData({ ...formData, mealCategoryId: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {mealCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-file">Image</Label>
                              <Input
                                id="edit-file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                              />
                              {file && (
                                <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
                              )}
                              {formData.imageUrl && !file && (
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">Current image:</p>
                                  <div className="w-20 h-20 relative rounded overflow-hidden border">
                                    {getImageUrl(formData.imageUrl) ? (
                                      <Image
                                        src={getImageUrl(formData.imageUrl)!}
                                        alt="Current image"
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-color">Color</Label>
                              <Input
                                id="edit-color"
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-totalAvailable">Total Available</Label>
                              <Input
                                id="edit-totalAvailable"
                                type="number"
                                value={formData.totalAvailable}
                                onChange={(e) => setFormData({ ...formData, totalAvailable: parseInt(e.target.value) || 0 })}
                                min="0"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="edit-isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                              />
                              <Label htmlFor="edit-isActive">Active</Label>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setEditingItem(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdate}>Update</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
    </div>
  )
} 