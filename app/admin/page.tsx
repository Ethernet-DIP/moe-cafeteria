"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, Coffee, Utensils, Moon, TrendingUp, Users } from "lucide-react"
import { getAllMealRecords } from "@/lib/employee-service"
import { getMealTypes } from "@/lib/meal-service"
import type { MealRecord, MealType } from "@/lib/types"
import { ChartContainer } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts"

export default function AdminDashboard() {
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([])
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [recordData, mealTypeData] = await Promise.all([getAllMealRecords(), getMealTypes()])
        setMealRecords(recordData || [])
        setMealTypes(mealTypeData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setMealRecords([])
        setMealTypes([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTodayStats = () => {
    if (!mealRecords || !Array.isArray(mealRecords)) {
      return {
        total: 0,
        totalAmount: 0,
        mealCounts: {},
      }
    }

    const today = new Date().toISOString().split("T")[0]
    const todayRecords = mealRecords.filter((record) => record?.timestamp?.startsWith(today))

    // Calculate total amount
    const totalAmount = todayRecords.reduce((sum, record) => sum + (record?.price || 0), 0)

    // Group by meal type
    const mealCounts: { [key: string]: { count: number; amount: number } } = {}

    todayRecords.forEach((record) => {
      if (!record?.mealTypeId) return

      if (!mealCounts[record.mealTypeId]) {
        mealCounts[record.mealTypeId] = { count: 0, amount: 0 }
      }
      mealCounts[record.mealTypeId].count++
      mealCounts[record.mealTypeId].amount += record.price || 0
    })

    return {
      total: todayRecords.length,
      totalAmount,
      mealCounts,
    }
  }

  const getMealIcon = (iconName: string) => {
    switch (iconName) {
      case "coffee":
        return <Coffee className="h-4 w-4" />
      case "utensils":
        return <Utensils className="h-4 w-4" />
      case "moon":
        return <Moon className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  // Prepare data for charts with null checks
  const prepareMealTypeDistribution = () => {
    if (!mealTypes || !Array.isArray(mealTypes) || !mealRecords || !Array.isArray(mealRecords)) {
      return []
    }

    return mealTypes.map((mealType) => {
      const count = mealRecords.filter((record) => record?.mealTypeId === mealType?.id).length
      return {
        name: mealType.name || "Unknown",
        value: count,
        color: mealType.id === "breakfast" ? "#f59e0b" : mealType.id === "lunch" ? "#10b981" : "#6366f1",
      }
    })
  }

  const prepareWeeklyData = () => {
    if (!mealRecords || !Array.isArray(mealRecords)) {
      return []
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayRecords = mealRecords.filter((record) => record?.timestamp?.startsWith(date))

      const breakfast = dayRecords.filter((r) => r?.mealTypeId === "breakfast").length
      const lunch = dayRecords.filter((r) => r?.mealTypeId === "lunch").length
      const dinner = dayRecords.filter((r) => r?.mealTypeId === "dinner").length

      return {
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        breakfast,
        lunch,
        dinner,
        total: dayRecords.length,
      }
    })
  }

  const prepareRevenueData = () => {
    if (!mealRecords || !Array.isArray(mealRecords)) {
      return []
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayRecords = mealRecords.filter((record) => record?.timestamp?.startsWith(date))
      const revenue = dayRecords.reduce((sum, record) => sum + (record?.price || 0), 0)

      return {
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        revenue,
      }
    })
  }

  // Only calculate stats and chart data when not loading and data is available
  const stats = loading ? { total: 0, totalAmount: 0, mealCounts: {} } : getTodayStats()
  const mealTypeData = loading ? [] : prepareMealTypeDistribution()
  const weeklyData = loading ? [] : prepareWeeklyData()
  const revenueData = loading ? [] : prepareRevenueData()

  // Calculate unique employees safely
  const uniqueEmployees =
    loading || !mealRecords || !Array.isArray(mealRecords)
      ? 0
      : new Set(mealRecords.map((record) => record?.employeeId).filter(Boolean)).size

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Meals Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Banknote className="mr-2 h-4 w-4" />
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAmount.toFixed(2)} ETB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Total Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mealRecords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Unique Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueEmployees}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Meal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {weeklyData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="font-medium">{payload[0]?.payload?.date}</p>
                                {payload.map((entry, index) => (
                                  <p key={`item-${index}`} className="text-sm">
                                    <span style={{ color: entry.color }}>{entry.name}: </span>
                                    {entry.value}
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="breakfast" stackId="a" fill="#f59e0b" name="Breakfast" />
                      <Bar dataKey="lunch" stackId="a" fill="#10b981" name="Lunch" />
                      <Bar dataKey="dinner" stackId="a" fill="#6366f1" name="Dinner" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {mealTypeData.length > 0 && mealTypeData.some((item) => item.value > 0) ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mealTypeData.filter((item) => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mealTypeData
                          .filter((item) => item.value > 0)
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="font-medium">{payload[0]?.name}</p>
                                <p className="text-sm">Count: {payload[0]?.value}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    {mealTypeData
                      .filter((item) => item.value > 0)
                      .map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm text-muted-foreground">{entry.name}</span>
                        </div>
                      ))}
                  </div>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No meal data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {revenueData.length > 0 ? (
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="font-medium">{payload[0]?.payload?.date}</p>
                              <p className="text-sm">Revenue: {payload[0]?.value?.toFixed(2)} ETB</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (ETB)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No revenue data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
