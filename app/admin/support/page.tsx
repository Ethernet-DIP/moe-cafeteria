"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingDown, Users, DollarSign, PieChart, Download, Utensils, FileSpreadsheet } from "lucide-react"
import type { SupportSummary, DepartmentSupportAnalysis, MealCategoryUsage } from "@/lib/types"
import { getSupportSummary, getDepartmentAnalysis, getPaginatedDepartmentAnalysis, getMealCategoryUsage, type PaginatedDepartmentAnalysis } from "@/lib/support-report-service"
import { toast } from "@/hooks/use-toast"
import Pagination from "@/components/pagination"

export default function SupportReportsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [supportSummary, setSupportSummary] = useState<SupportSummary | null>(null)
  const [departmentAnalysis, setDepartmentAnalysis] = useState<DepartmentSupportAnalysis[]>([])
  const [categoryUsage, setCategoryUsage] = useState<MealCategoryUsage[]>([])
  
  // Date selection state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exportLoading, setExportLoading] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchData = async (period: string, page: number = 0, size: number = 10) => {
    setLoading(true)
    try {
      const [summary, paginatedAnalysis, categories] = await Promise.all([
        getSupportSummary(period),
        getPaginatedDepartmentAnalysis(period, page, size),
        getMealCategoryUsage(period)
      ])
      setSupportSummary(summary)
      setDepartmentAnalysis(paginatedAnalysis.content)
      setCategoryUsage(categories)
      setTotalPages(paginatedAnalysis.totalPages)
      setTotalElements(paginatedAnalysis.totalElements)
      setCurrentPage(paginatedAnalysis.currentPage)
      setPageSize(paginatedAnalysis.pageSize)
    } catch (error) {
      console.error("Error fetching support reports:", error)
      toast({
        title: "Error",
        description: "Failed to load support reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedPeriod, currentPage, pageSize)
  }, [selectedPeriod])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchData(selectedPeriod, page, pageSize)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(0)
    fetchData(selectedPeriod, 0, newPageSize)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExportToExcel = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates for export.",
        variant: "destructive",
      })
      return
    }

    setExportLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
      const response = await fetch(`${apiUrl}/support-reports/export/excel?startDate=${startDate}&endDate=${endDate}`)
      
      if (!response.ok) {
        throw new Error('Failed to export Excel file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `support_report_${startDate}_to_${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Excel file exported successfully!",
      })
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast({
        title: "Error",
        description: "Failed to export Excel file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  if (loading || !supportSummary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Support Reports</h1>
        <div className="text-center py-8">Loading support reports...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Support Reports</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setCurrentPage(0)
              fetchData(selectedPeriod, 0, pageSize)
            }}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Selection and Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button 
              onClick={handleExportToExcel}
              disabled={exportLoading || !startDate || !endDate}
              className="flex items-center gap-2"
            >
              {exportLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportSummary.totalMeals.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="mr-2">
                {supportSummary.supportedMeals} supported
              </Badge>
              <Badge variant="outline">{supportSummary.normalMeals} normal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(supportSummary.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              {formatCurrency(supportSummary.totalSubsidy)} subsidy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supported Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportSummary.supportedEmployees}</div>
            <div className="text-xs text-muted-foreground">of {supportSummary.totalEmployees} total employees</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(supportSummary.supportPercentage)}</div>
            <div className="text-xs text-muted-foreground">of all meals are subsidized</div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Potential Revenue</div>
              <div className="text-2xl font-bold text-gray-600">{formatCurrency(supportSummary.potentialRevenue)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Actual Revenue</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(supportSummary.totalRevenue)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Subsidy</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(supportSummary.totalSubsidy)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Category Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Category Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table grouped by meal type */}
          <div className="space-y-6">
            {Object.entries(categoryUsage.reduce((acc: Record<string, MealCategoryUsage[]>, item) => {
              const key = item.mealTypeName || item.mealTypeId || 'Other'
              if (!acc[key]) acc[key] = []
              acc[key].push(item)
              return acc
            }, {})).map(([mealTypeName, items]) => (
              <div key={mealTypeName}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">{mealTypeName}</h3>
                  <Badge variant="outline">{items.reduce((s, i) => s + i.totalMeals, 0)} meals</Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meal Category</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Supported</TableHead>
                        <TableHead className="text-right">Normal</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Subsidy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((cat) => (
                        <TableRow key={cat.mealCategoryId}>
                          <TableCell className="font-medium">{cat.mealCategoryName}</TableCell>
                          <TableCell className="text-right">{cat.totalMeals}</TableCell>
                          <TableCell className="text-right">{cat.supportedMeals}</TableCell>
                          <TableCell className="text-right">{cat.normalMeals}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cat.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cat.totalSubsidy)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department Support Analysis</CardTitle>
            {totalElements > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {departmentAnalysis.length} of {totalElements} departments
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentAnalysis.map((dept) => (
              <div key={dept.department} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{dept.department}</h3>
                  <Badge variant={dept.eligibilityPercentage > 50 ? "destructive" : "secondary"}>
                    {formatPercentage(dept.eligibilityPercentage)} eligible
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Employees</div>
                    <div className="font-medium">
                      {dept.eligibleEmployees}/{dept.totalEmployees}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Using Support</div>
                    <div className="font-medium">{dept.employeesUsingSupport}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Supported Meals</div>
                    <div className="font-medium">
                      {dept.supportedMeals}/{dept.totalMeals}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Subsidy Amount</div>
                    <div className="font-medium text-red-600">{formatCurrency(dept.totalSubsidy)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalElements > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalElements}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
