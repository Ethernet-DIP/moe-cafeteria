"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Coffee, Utensils, Moon, TrendingUp, Banknote } from "lucide-react"
import type { Employee, MealRecord, EmployeeUsageStats, MealType } from "@/lib/types"
import { getEmployeeUsageStats, getEmployeeMealRecords } from "@/lib/employee-service"
import { getMealTypes } from "@/lib/meal-service"

interface EmployeeUsageModalProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeUsageModal({ employee, open, onOpenChange }: EmployeeUsageModalProps) {
  const [stats, setStats] = useState<EmployeeUsageStats | null>(null)
  const [records, setRecords] = useState<MealRecord[]>([])
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (employee && open) {
      fetchEmployeeData()
    }
  }, [employee, open])

  const fetchEmployeeData = async () => {
    if (!employee) return

    setLoading(true)
    try {
      const [statsData, recordsData, mealTypesData] = await Promise.all([
        getEmployeeUsageStats(employee.employeeId),
        getEmployeeMealRecords(employee.employeeId),
        getMealTypes(),
      ])
      setStats(statsData)
      setRecords(recordsData)
      setMealTypes(mealTypesData)
    } catch (error) {
      console.error("Error fetching employee data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getMealIcon = (mealTypeId: string) => {
    const mealType = mealTypes.find((mt) => mt.id === mealTypeId)

    if (!mealType) return <Utensils className="h-4 w-4" />

    switch (mealType.icon) {
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

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Usage History - {employee.name}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading usage data...</div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Total Meals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalMeals}</div>
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
                      <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} ETB</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {mealTypes.map((mealType) => {
                    const count = stats.mealCounts[mealType.id] || 0
                    const amount = stats.mealAmounts[mealType.id] || 0

                    return (
                      <Card key={mealType.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                            {getMealIcon(mealType.id)}
                            <span className="ml-2">{mealType.name}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-gray-500">{amount.toFixed(2)} ETB</div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}

            {/* Usage History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meal Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No meal records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="flex items-center">
                            {getMealIcon(record.mealTypeId)}
                            <span className="ml-2">{record.mealName}</span>
                          </TableCell>
                          <TableCell>{record.actualPrice.toFixed(2)} ETB</TableCell>
                          <TableCell>{formatDate(record.timestamp)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
