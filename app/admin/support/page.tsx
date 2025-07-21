"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingDown, Users, DollarSign, PieChart, Download, Utensils } from "lucide-react"
import type { SupportSummary, DepartmentSupportAnalysis } from "@/lib/types"

// Mock data - in real app this would come from API
const mockSupportSummary: SupportSummary = {
  totalMeals: 1250,
  supportedMeals: 450,
  normalMeals: 800,
  totalRevenue: 52500,
  totalSubsidy: 6750,
  potentialRevenue: 59250,
  supportedEmployees: 85,
  totalEmployees: 200,
  supportPercentage: 36,
}

const mockDepartmentAnalysis: DepartmentSupportAnalysis[] = [
  {
    department: "IT Department",
    totalEmployees: 25,
    eligibleEmployees: 8,
    employeesUsingSupport: 6,
    totalMeals: 180,
    supportedMeals: 45,
    totalRevenue: 8250,
    totalSubsidy: 675,
    avgDepartmentSalary: 6500,
    eligibilityPercentage: 32,
  },
  {
    department: "HR Department",
    totalEmployees: 15,
    eligibleEmployees: 12,
    employeesUsingSupport: 10,
    totalMeals: 120,
    supportedMeals: 85,
    totalRevenue: 4800,
    totalSubsidy: 1275,
    avgDepartmentSalary: 3800,
    eligibilityPercentage: 80,
  },
  {
    department: "Finance Department",
    totalEmployees: 20,
    eligibleEmployees: 5,
    employeesUsingSupport: 4,
    totalMeals: 150,
    supportedMeals: 30,
    totalRevenue: 7200,
    totalSubsidy: 450,
    avgDepartmentSalary: 7200,
    eligibilityPercentage: 25,
  },
]

export default function SupportReportsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [supportSummary, setSupportSummary] = useState<SupportSummary>(mockSupportSummary)
  const [departmentAnalysis, setDepartmentAnalysis] = useState<DepartmentSupportAnalysis[]>(mockDepartmentAnalysis)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

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

  if (loading) {
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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

      {/* Department Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Department Support Analysis</CardTitle>
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
    </div>
  )
}
