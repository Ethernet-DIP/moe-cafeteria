"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle, Search, Filter, X } from "lucide-react"
import { getAllUsers, deleteUser, toggleUserStatus, getCurrentUser } from "@/lib/auth-service"
import type { User } from "@/lib/types"
import UserForm from "@/components/user-form"
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
import Pagination from "@/components/pagination"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("fullName")
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
      const userData = await getAllUsers()
      setUsers(userData)
      setCurrentUser(getCurrentUser())
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setUserFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setUserFormOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.id)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchData()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleToggleUser = async (user: User) => {
    try {
      await toggleUserStatus(user.id)
      toast({
        title: "Success",
        description: `User ${user.isActive ? "deactivated" : "activated"} successfully`,
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const searchString = `${user.username} ${user.fullName} ${user.email} ${user.role}`.toLowerCase()
      const matchesSearch = searchTerm === "" || searchString.includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })

    // Sort users
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "username":
          aValue = a.username
          bValue = b.username
          break
        case "fullName":
          aValue = a.fullName
          bValue = b.fullName
          break
        case "email":
          aValue = a.email
          bValue = b.email
          break
        case "role":
          aValue = a.role
          bValue = b.role
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "lastLogin":
          aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0
          bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0
          break
        default:
          aValue = a.fullName
          bValue = b.fullName
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
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder])

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedUsers.slice(startIndex, endIndex)
  }, [filteredAndSortedUsers, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setSortBy("fullName")
    setSortOrder("asc")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm !== "" || roleFilter !== "all" || statusFilter !== "all" || sortBy !== "fullName" || sortOrder !== "asc"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>System Users ({filteredAndSortedUsers.length} users)</CardTitle>
              <div className="flex gap-2">
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
                <Button onClick={handleAddUser} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
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
                    <SelectItem value="fullName-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="fullName-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="username-asc">Username (A-Z)</SelectItem>
                    <SelectItem value="username-desc">Username (Z-A)</SelectItem>
                    <SelectItem value="role-asc">Role (A-Z)</SelectItem>
                    <SelectItem value="role-desc">Role (Z-A)</SelectItem>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="lastLogin-desc">Recent Login</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow suppressHydrationWarning>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow suppressHydrationWarning>
                        <TableCell colSpan={7} className="text-center py-8">
                          {filteredAndSortedUsers.length === 0 ? "No users found" : "No users on this page"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id} suppressHydrationWarning>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-red-100 text-red-700"
                                  : user.role === "manager"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={() => handleToggleUser(user)}
                                disabled={user.id === currentUser?.id}
                              />
                              <span className="flex items-center">
                                {user.isActive ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.id === currentUser?.id}
                              >
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

              {filteredAndSortedUsers.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredAndSortedUsers.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <UserForm open={userFormOpen} onOpenChange={setUserFormOpen} user={selectedUser} onSuccess={fetchData} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{userToDelete?.fullName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
