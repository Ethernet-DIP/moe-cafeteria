"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Coffee, Utensils, Moon, Search, Filter, X, Calendar } from "lucide-react"
import { getAllEmployees, getAllMealRecords } from "@/lib/employee-service"
import { getMealTypes } from "@/lib/meal-service"
import type { Employee, MealRecord, MealType } from "@/lib/types"
import Pagination from "@/components/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { toast } from "@/hooks/use-toast"

export default function MealRecordsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([])
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(true)

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [mealTypeFilter, setMealTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [empData, recordData, mealTypeData] = await Promise.all([
          getAllEmployees(),
          getAllMealRecords(),
          getMealTypes(),
        ])
        setEmployees(empData)
        setMealRecords(recordData)
        setMealTypes(mealTypeData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load meal records. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    const filtered = mealRecords.filter((record) => {
      const employee = employees.find((e) => e.employeeId === record.employeeId)
      const searchString =
        `${record.employeeId} ${employee?.name || ""} ${record.mealName} ${record.category}`.toLowerCase()
      const matchesSearch = searchTerm === "" || searchString.includes(searchTerm.toLowerCase())

      const matchesMealType = mealTypeFilter === "all" || record.mealTypeId === mealTypeFilter

      let matchesDate = true
      if (dateFilter !== "all") {
        const recordDate = new Date(record.timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)

        switch (dateFilter) {
          case "today":
            matchesDate = recordDate.toDateString() === today.toDateString()
            break
          case "yesterday":
            matchesDate = recordDate.toDateString() === yesterday.toDateString()
            break
          case "week":
            matchesDate = recordDate >= weekAgo
            break
          case "month":
            matchesDate = recordDate >= monthAgo
            break
        }
      }

      return matchesSearch && matchesMealType && matchesDate
    })

    // Sort records
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "employeeId":
          aValue = a.employeeId
          bValue = b.employeeId
          break
        case "mealName":
          aValue = a.mealName
          bValue = b.mealName
          break
        case "actualPrice": // Use actualPrice for sorting
          aValue = a.actualPrice
          bValue = b.actualPrice
          break
        case "timestamp":
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        default:
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue)
        return sortOrder === "asc" ? comparison : -comparison
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [mealRecords, employees, searchTerm, mealTypeFilter, dateFilter, sortBy, sortOrder])

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedRecords.slice(startIndex, endIndex)
  }, [filteredAndSortedRecords, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedRecords.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setMealTypeFilter("all")
    setDateFilter("all")
    setSortBy("timestamp")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    mealTypeFilter !== "all" ||
    dateFilter !== "all" ||
    sortBy !== "timestamp" ||
    sortOrder !== "desc"

  const handleCopyRecordId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: "Copied!",
      description: "Record ID copied to clipboard.",
    })
  }

  const handleViewDetails = (record: MealRecord) => {
    toast({
      title: "View Details",
      description: `Viewing details for record ID: ${record.id}`,
    })

  }

  const handleEditRecord = (record: MealRecord) => {
    toast({
      title: "Edit Record",
      description: `Editing record ID: ${record.id}`,
    })

  }

  const handleDeleteRecord = (record: MealRecord) => {
    toast({
      title: "Delete Record",
      description: `Deleting record ID: ${record.id}`,
      variant: "destructive",
    })

    // In a real app, you'd call an API to delete the record and then refresh the list
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Meal Records</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Recent Meal Records ({filteredAndSortedRecords.length} records)</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={mealTypeFilter}
                  onValueChange={(value) => {
                    setMealTypeFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meal Types</SelectItem>
                    {mealTypes.map((mealType) => (
                      <SelectItem key={mealType.id} value={mealType.id}>
                        {mealType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={dateFilter}
                  onValueChange={(value) => {
                    setDateFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-")
                    setSortBy(field)
                    setSortOrder(order as "asc" | "desc")
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp-desc">Newest First</SelectItem>
                    <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                    <SelectItem value="employeeId-asc">Employee ID (A-Z)</SelectItem>
                    <SelectItem value="employeeId-desc">Employee ID (Z-A)</SelectItem>
                    <SelectItem value="mealName-asc">Meal Type (A-Z)</SelectItem>
                    <SelectItem value="mealName-desc">Meal Type (Z-A)</SelectItem>
                    <SelectItem value="actualPrice-desc">Price (High-Low)</SelectItem> {/* Updated to actualPrice */}
                    <SelectItem value="actualPrice-asc">Price (Low-High)</SelectItem> {/* Updated to actualPrice */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading records...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow suppressHydrationWarning>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Meal Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Meal Items</TableHead>
                      <TableHead>Price Paid</TableHead>
                      <TableHead>Subsidy</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Recorded By</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.length === 0 ? (
                      <TableRow suppressHydrationWarning>
                        <TableCell colSpan={10} className="text-center py-8">
                          {filteredAndSortedRecords.length === 0 ? "No meal records found" : "No records on this page"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record) => {
                        const employee = employees.find((e) => e.employeeId === record.employeeId)
                        const mealType = mealTypes.find((mt) => mt.id === record.mealTypeId)

                        return (
                          <TableRow key={record.id} suppressHydrationWarning>
                            <TableCell className="font-medium">{record.employeeId}</TableCell>
                            <TableCell>{employee?.name || "Unknown"}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {mealType ? getMealIcon(mealType.icon) : null}
                                <span className="ml-2">{record.mealName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  record.category === "fasting" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {record.category === "fasting" ? "Fasting" : "Non-Fasting"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {record.mealItems && record.mealItems.length > 0 ? (
                                <div className="space-y-1">
                                  {record.mealItems.map((item, index) => (
                                    <div key={index} className="text-xs text-gray-600">
                                      {item.mealItemName} x{item.quantity}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">No items</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono">
                              {record.actualPrice.toFixed(2)} ETB
                            </TableCell>
                            <TableCell className="font-mono">
                              {record.supportAmount > 0 ? `${record.supportAmount.toFixed(2)} ETB` : "-"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(record.timestamp)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {record.recordedByFullName || record.recordedByUsername || "System"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <DotsHorizontalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCopyRecordId(record.id)}>
                                    Copy record ID
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditRecord(record)}>
                                    Edit record
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteRecord(record)}>
                                    Delete record
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredAndSortedRecords.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredAndSortedRecords.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
