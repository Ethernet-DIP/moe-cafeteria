'use client'
import { Suspense, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import CafeteriaScanner from "@/components/cafeteria-scanner"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Minus, Printer } from "lucide-react"
import Link from "next/link"
import { getMealCategoryById, getMealCategoriesByType } from "@/lib/meal-service"
import { getMealItemsByCategory } from "@/lib/meal-item-service"
import ProtectedRoute from "@/components/protected-route"
import { MealCategory, MealItem, OrderItem, Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ScanPage({ params }: { params: { mealCategoryId: string } }) {
  const [mealCategory, setMealCategory] = useState<MealCategory | null>()
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([])
  const [mealItems, setMealItems] = useState<MealItem[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([params.mealCategoryId])
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order>({
    items: [],
    totalPrice: 0,
    employeeId: "",
    mealCategoryId: params.mealCategoryId
  })
  const router = useRouter()
  
  useEffect(() => {
    fetchData(params.mealCategoryId)
  }, [params.mealCategoryId])
  
  const fetchData = async (mealCategoryId: string) => {
    setLoading(true)
    try {
      // Fetch meal category to validate it exists and is enabled
      const mealCat = await getMealCategoryById(mealCategoryId)
      
      if (!mealCat.isActive) {
        notFound()
      }
      setMealCategory(mealCat)
      
      // Fetch all meal categories for the same meal type
      const categories = await getMealCategoriesByType(mealCat.mealTypeId)
      setMealCategories(categories.filter(cat => cat.isActive))
      
      // Fetch meal items for the selected category
      const items = await getMealItemsByCategory(mealCategoryId)
      setMealItems(items)
      
      // Reset order for new category
      setOrder({
        items: [],
        totalPrice: 0,
        employeeId: "",
        mealCategoryId: mealCategoryId
      })
    } catch (err) {
      console.log(err)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    router.push(`/scan/${categoryId}`)
  }

  const addItemToOrder = (item: MealItem) => {
    if (!mealCategory) return
    
    const currentItemCount = order.items.reduce((total, orderItem) => total + orderItem.quantity, 0)
    if (currentItemCount >= mealCategory.allowedCount) {
      alert(`You can only select ${mealCategory.allowedCount} item(s) from this category.`)
      return
    }

    const existingItem = order.items.find(orderItem => orderItem.item.id === item.id)
    
    if (existingItem) {
      // Increase quantity if item already in order
      if (existingItem.quantity < item.totalAvailable) {
        setOrder(prev => ({
          ...prev,
          items: prev.items.map(orderItem =>
            orderItem.item.id === item.id
              ? { ...orderItem, quantity: orderItem.quantity + 1 }
              : orderItem
          ),
          totalPrice: prev.totalPrice + mealCategory.normalPrice
        }))
      } else {
        alert(`Maximum available quantity (${item.totalAvailable}) reached for ${item.name}`)
      }
    } else {
      // Add new item to order
      const newOrderItem: OrderItem = {
        item,
        quantity: 1,
        price: mealCategory.normalPrice
      }
      
      setOrder(prev => ({
        ...prev,
        items: [...prev.items, newOrderItem],
        totalPrice: prev.totalPrice + mealCategory.normalPrice
      }))
    }
  }

  const removeItemFromOrder = (itemId: string) => {
    setOrder(prev => {
      const itemToRemove = prev.items.find(orderItem => orderItem.item.id === itemId)
      if (!itemToRemove) return prev
      
      return {
        ...prev,
        items: prev.items.filter(orderItem => orderItem.item.id !== itemId),
        totalPrice: prev.totalPrice - (itemToRemove.price * itemToRemove.quantity)
      }
    })
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId)
      return
    }

    const item = mealItems.find(item => item.id === itemId)
    if (newQuantity > (item?.totalAvailable || 0)) {
      alert(`Maximum available quantity (${item?.totalAvailable}) reached for ${item?.name}`)
      return
    }

    setOrder(prev => {
      const orderItem = prev.items.find(orderItem => orderItem.item.id === itemId)
      if (!orderItem) return prev
      
      const quantityDiff = newQuantity - orderItem.quantity
      
      return {
        ...prev,
        items: prev.items.map(orderItem =>
          orderItem.item.id === itemId
            ? { ...orderItem, quantity: newQuantity }
            : orderItem
        ),
        totalPrice: prev.totalPrice + (orderItem.price * quantityDiff)
      }
    })
  }

  const handlePrint = () => {
    if (order.items.length === 0) {
      alert("No items in order to print")
      return
    }

    const printContent = `
      =================================
      CAFETERIA ORDER RECEIPT
      =================================
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      Category: ${mealCategory?.name || 'Unknown'}
      
      ITEMS:
      ${order.items.map(item => 
        `${item.item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} ETB`
      ).join('\n')}
      
      =================================
      TOTAL: ${order.totalPrice.toFixed(2)} ETB
      =================================
      
      Thank you for your order!
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cafeteria Order Receipt</title>
            <style>
              body { font-family: monospace; margin: 20px; }
              .receipt { white-space: pre-line; }
            </style>
          </head>
          <body>
            <div class="receipt">${printContent}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="operator">
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading scanner...</p>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="operator">
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Meal Selection
            </Button>
          </Link>
        </div>

        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Left Side - Meal Categories and Items (40%) */}
          <div className="w-2/5 flex-shrink-0">
            <Card className="bg-sidebar border-sidebar-border mb-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Meal Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs 
                  value={params.mealCategoryId} 
                  onValueChange={(value) => handleCategorySelect(value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-4 h-10">
                    {mealCategories.map((category) => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className="text-xs py-1 data-[state=active]:bg-[#2050a0] data-[state=active]:text-white data-[state=active]:border-[#2050a0]"
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-xs">{category.name}</span>
                          <span className="text-xs opacity-70">
                            {category.normalPrice} ETB • {category.allowedCount} items
                          </span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {mealCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-2">
                      <div className="space-y-2">
                        <div className="text-center p-1 bg-muted rounded">
                          <div className="text-xs font-medium">
                            {category.name} - {category.category === 'fasting' ? 'Fasting' : 'Non-Fasting'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {category.normalPrice} ETB • {category.allowedCount} item(s) allowed
                          </div>
                        </div>
                        
                        {/* Meal Items for this category */}
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Package className="h-3 w-3" />
                            <span className="text-xs font-medium">Available Items</span>
                            <Badge variant="secondary" className="ml-auto text-xs px-1 py-0">
                              {order.items.reduce((total, item) => total + item.quantity, 0)}/{category.allowedCount}
                            </Badge>
                          </div>
                          
                          {mealItems.length > 0 ? (
                            <div className="grid grid-cols-4 gap-1">
                              {mealItems.map((item) => {
                                const orderItem = order.items.find(oi => oi.item.id === item.id)
                                const isSelected = !!orderItem
                                
                                return (
                                  <div
                                    key={item.id}
                                    className={`p-1 rounded border cursor-pointer transition-colors ${
                                      isSelected 
                                        ? 'border-primary bg-primary/10' 
                                        : 'border-sidebar-border bg-sidebar-accent'
                                    }`}
                                    onClick={() => addItemToOrder(item)}
                                  >
                                    {/* Item Image */}
                                    <div className="relative w-full h-12 mb-1 rounded overflow-hidden bg-gray-100">
                                      {item.imageUrl ? (
                                        <Image
                                          src={item.imageUrl}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 768px) 25vw, 10vw"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                          <Package className="h-4 w-4 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1 mb-1">
                                      <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                      />
                                      <span className="text-xs font-medium truncate">{item.name}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground">
                                        {item.totalAvailable}
                                      </span>
                                      {isSelected && (
                                        <div className="flex items-center gap-0.5">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-4 w-4 p-0"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              updateItemQuantity(item.id, orderItem.quantity - 1)
                                            }}
                                          >
                                            <Minus className="h-1.5 w-1.5" />
                                          </Button>
                                          <span className="text-xs font-medium min-w-[12px] text-center">
                                            {orderItem.quantity}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-4 w-4 p-0"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              updateItemQuantity(item.id, orderItem.quantity + 1)
                                            }}
                                          >
                                            <Plus className="h-1.5 w-1.5" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              <Package className="h-6 w-6 mx-auto mb-1 opacity-50" />
                              <p className="text-xs">No items available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Order Summary */}
            {order.items.length > 0 && (
              <Card className="bg-sidebar border-sidebar-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {order.items.map((orderItem) => (
                      <div key={orderItem.item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="text-xs font-medium">{orderItem.item.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            x{orderItem.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">
                            {(orderItem.price * orderItem.quantity).toFixed(2)} ETB
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-red-500"
                            onClick={() => removeItemFromOrder(orderItem.item.id)}
                          >
                            <Minus className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-sm">Total:</span>
                        <span className="text-sm">{order.totalPrice.toFixed(2)} ETB</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePrint} 
                      className="w-full h-8 text-xs"
                      disabled={order.items.length === 0}
                    >
                      <Printer className="mr-1 h-3 w-3" />
                      Print Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Scanner (60%) */}
          <div className="w-3/5 flex-shrink-0">
            <Suspense fallback={<div className="text-center">Loading scanner...</div>}>
              <CafeteriaScanner mealCategoryId={params.mealCategoryId} />
            </Suspense>
          </div>
        </div>
        
        <Toaster />
      </main>
    </ProtectedRoute>
  )
}
