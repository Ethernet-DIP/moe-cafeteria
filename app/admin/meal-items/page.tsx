"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { MealItem, MealCategory } from "@/lib/types"
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
      await createMealItem(formData)
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
      await updateMealItem(editingItem.id, formData)
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
  }

  const filteredItems = mealItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Meal Items</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal Item
            </Button>
          </DialogTrigger>
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
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Meal Items</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search meal items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
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
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleActive(item.id)}
                      />
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
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
                              <Label htmlFor="edit-imageUrl">Image URL</Label>
                              <Input
                                id="edit-imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              />
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 