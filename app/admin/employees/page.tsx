"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Eye, Search, Filter, X, CreditCard, CheckCircle, XCircle, Pencil, Plus } from "lucide-react"
import { getAllEmployees, toggleEmployeeStatus } from "@/lib/employee-service"
import type { Employee } from "@/lib/types"
import EmployeeUsageModal from "@/components/employee-usage-modal"
import EmployeeAssignmentModal from "@/components/employee-assignment-modal"
import EmployeeEditModal from "@/components/employee-edit-modal" // Import the new modal
import EmployeeAddModal from "@/components/employee-add-modal"
import Pagination from "@/components/pagination"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { toast } = useToast()

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [supportFilter, setSupportFilter] = useState("all") // New filter for support status
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const empData = await getAllEmployees()
      setEmployees(empData)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((emp) => emp.department))].sort()
    return depts
  }, [employees])

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => {
      const matchesSearch =
        searchTerm === "" ||
        `${employee.employeeId} ${employee.name} ${employee.department} ${employee.cardId} ${employee.shortCode}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? employee.isActive : !employee.isActive)
      const matchesSupport =
        supportFilter === "all" ||
        (supportFilter === "eligible" ? employee.eligibleForSupport : !employee.eligibleForSupport)

      return matchesSearch && matchesDepartment && matchesStatus && matchesSupport
    })

    // Sort employees
    filtered.sort((a, b) => {
      let aValue: string | number | undefined
      let bValue: string | number | undefined

      switch (sortBy) {
        case "employeeId":
          aValue = a.employeeId
          bValue = b.employeeId
          break
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "department":
          aValue = a.department
          bValue = b.department
          break
        case "cardId":
          aValue = a.cardId || ""
          bValue = b.cardId || ""
          break
        case "shortCode":
          aValue = a.shortCode || ""
          bValue = b.shortCode || ""
          break
        case "salary":
          aValue = a.salary || 0
          bValue = b.salary || 0
          break
        default:
          aValue = a.name
          bValue = b.name
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
  }, [employees, searchTerm, departmentFilter, statusFilter, supportFilter, sortBy, sortOrder])

  // Paginate employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedEmployees.slice(startIndex, endIndex)
  }, [filteredAndSortedEmployees, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / pageSize)

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setUsageModalOpen(true)
  }

  const handleAssignCard = (employee: Employee) => {
    setSelectedEmployee(employee) // Use selectedEmployee for assignment modal
    setAssignmentModalOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditModalOpen(true)
  }

  const handleToggleStatus = async (employee: Employee) => {
    try {
      await toggleEmployeeStatus(employee.id)
      toast({
        title: "Success",
        description: `Employee ${employee.isActive ? "disabled" : "enabled"} successfully`,
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling employee status:", error)
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const clearFilters = () => {
    setSearchTerm("")
    setDepartmentFilter("all")
    setStatusFilter("all")
    setSupportFilter("all")
    setSortBy("name")
    setSortOrder("asc")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    departmentFilter !== "all" ||
    statusFilter !== "all" ||
    supportFilter !== "all" ||
    sortBy !== "name" ||
    sortOrder !== "asc"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Employees</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Employee Directory ({filteredAndSortedEmployees.length} employees)</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
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
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
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
                  value={departmentFilter}
                  onValueChange={(value) => {
                    setDepartmentFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={supportFilter}
                  onValueChange={(value) => {
                    setSupportFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by support" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Support Status</SelectItem>
                    <SelectItem value="eligible">Eligible for Support</SelectItem>
                    <SelectItem value="not_eligible">Not Eligible for Support</SelectItem>
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
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="employeeId-asc">Employee ID (A-Z)</SelectItem>
                    <SelectItem value="employeeId-desc">Employee ID (Z-A)</SelectItem>
                    <SelectItem value="department-asc">Department (A-Z)</SelectItem>
                    <SelectItem value="department-desc">Department (Z-A)</SelectItem>
                  
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow suppressHydrationWarning>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Support Status</TableHead>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Short Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmployees.length === 0 ? (
                      <TableRow suppressHydrationWarning>
                        <TableCell colSpan={9} className="text-center py-8">
                          {filteredAndSortedEmployees.length === 0 ? "No employees found" : "No employees on this page"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEmployees.map((employee) => (
                        <TableRow key={employee.id} suppressHydrationWarning>
                          <TableCell className="font-medium">{employee.employeeId}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>
                            <Badge
                              variant={employee.eligibleForSupport ? "default" : "destructive"}
                              className={employee.eligibleForSupport ? "bg-green-500" : "bg-red-500"}
                            >
                              {employee.supportStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {employee.cardId || <span className="text-muted-foreground italic">Not assigned</span>}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {employee.shortCode || <span className="text-muted-foreground italic">Not assigned</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={employee.isActive}
                                onCheckedChange={() => handleToggleStatus(employee)}
                              />
                              <span className="flex items-center">
                                {employee.isActive ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                {employee.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewEmployee(employee)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEmployee(employee)}
                                className="flex items-center gap-1"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignCard(employee)}
                                className="flex items-center gap-1"
                              >
                                <CreditCard className="h-4 w-4" />
                                Assign
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredAndSortedEmployees.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredAndSortedEmployees.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeUsageModal employee={selectedEmployee} open={usageModalOpen} onOpenChange={setUsageModalOpen} />

      <EmployeeAssignmentModal
        employee={selectedEmployee}
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
        onSuccess={fetchData}
      />

      <EmployeeEditModal
        employee={selectedEmployee}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchData}
      />

      <EmployeeAddModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchData}
      />
    </div>
  )
}
