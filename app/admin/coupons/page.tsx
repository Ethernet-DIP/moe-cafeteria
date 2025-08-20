"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, X, Download, Printer, Trash2, CheckCircle, XCircle, Hash } from "lucide-react"
import { getCoupons, getCouponBatches, deleteCouponBatch, toggleBatchStatus, deleteCoupon, deleteBatch } from "@/lib/coupon-service"
import type { Coupon, CouponBatch } from "@/lib/types"
import CouponGeneratorModal from "@/components/coupon-generator-modal"
import Pagination from "@/components/pagination"
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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [batches, setBatches] = useState<CouponBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: "coupon" | "batch"; id: string } | null>(null)
  const { toast } = useToast()

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [batchFilter, setBatchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [usageFilter, setUsageFilter] = useState("all")
  const [sortBy, setSortBy] = useState("generatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // View mode
  const [viewMode, setViewMode] = useState<"coupons" | "batches">("coupons")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [couponData, batchData] = await Promise.all([getCoupons(), getCouponBatches()])
      setCoupons(couponData)
      setBatches(batchData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load coupon data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get unique batch numbers for filter
  const batchNumbers = useMemo(() => {
    return [...new Set(coupons.map((coupon) => coupon.batchNumber))].sort()
  }, [coupons])

  // Filter and sort coupons
  const filteredAndSortedCoupons = useMemo(() => {
    const filtered = coupons.filter((coupon) => {
      const matchesSearch =
        searchTerm === "" ||
        `${coupon.code} ${coupon.title} ${coupon.mealTypeName} ${coupon.batchNumber} ${coupon.generatedBy}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesBatch = batchFilter === "all" || coupon.batchNumber === batchFilter
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? coupon.isActive : !coupon.isActive)
      const matchesUsage = usageFilter === "all" || (usageFilter === "used" ? coupon.isUsed : !coupon.isUsed)

      return matchesSearch && matchesBatch && matchesStatus && matchesUsage
    })

    // Sort coupons
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "code":
          aValue = a.code
          bValue = b.code
          break
        case "title":
          aValue = a.title
          bValue = b.title
          break
        case "mealTypeName":
          aValue = a.mealTypeName
          bValue = b.mealTypeName
          break
        case "batchNumber":
          aValue = a.batchNumber
          bValue = b.batchNumber
          break
        case "generatedBy":
          aValue = a.generatedBy
          bValue = b.generatedBy
          break
        case "generatedAt":
          aValue = new Date(a.generatedAt).getTime()
          bValue = new Date(b.generatedAt).getTime()
          break
        default:
          aValue = new Date(a.generatedAt).getTime()
          bValue = new Date(b.generatedAt).getTime()
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
  }, [coupons, searchTerm, batchFilter, statusFilter, usageFilter, sortBy, sortOrder])

  // Paginate items
  const paginatedItems = useMemo(() => {
    const items = viewMode === "coupons" ? filteredAndSortedCoupons : batches
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [viewMode, filteredAndSortedCoupons, batches, currentPage, pageSize])

  const totalPages = Math.ceil((viewMode === "coupons" ? filteredAndSortedCoupons.length : batches.length) / pageSize)

  const handleToggleBatchStatus = async (batchNumber: string) => {
    try {
      await toggleBatchStatus(batchNumber)
      toast({
        title: "Success",
        description: "Batch status updated successfully",
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling batch status:", error)
      toast({
        title: "Error",
        description: "Failed to update batch status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = (type: "coupon" | "batch", id: string) => {
    setItemToDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === "coupon") {
        await deleteCoupon(itemToDelete.id)
        toast({
          title: "Success",
          description: "Coupon deleted successfully",
        })
      } else {
        await deleteBatch(itemToDelete.id)
        toast({
          title: "Success",
          description: "Batch deleted successfully",
        })
      }
      fetchData()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}`,
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handlePrintCoupons = (batchNumber?: string) => {
    const couponsToPrint = batchNumber ? coupons.filter((c) => c.batchNumber === batchNumber) : filteredAndSortedCoupons

    if (couponsToPrint.length === 0) {
      toast({
        title: "No Coupons",
        description: "No coupons to print",
        variant: "destructive",
      })
      return
    }

    // Create print content
    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Coupons - ${batchNumber || "Filtered Results"}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .coupon { 
            border: 2px dashed #333; 
            margin: 10px 0; 
            padding: 20px; 
            page-break-inside: avoid;
            width: 300px;
            display: inline-block;
            margin-right: 20px;
            vertical-align: top;
            text-align: center;
          }
          .coupon-logo { 
            width: 40px; 
            height: 40px; 
            margin: 0 auto 10px auto; 
            background-image: url('/images/ministry-logo.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
          .coupon-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .coupon-code { font-size: 24px; font-weight: bold; font-family: monospace; margin: 10px 0; }
          .coupon-details { font-size: 14px; margin: 5px 0; }
          .coupon-footer { font-size: 12px; color: #666; margin-top: 15px; }
          .ministry-text { font-size: 10px; color: #888; margin-top: 10px; }
          @media print {
            body { margin: 0; }
            .coupon { margin: 5px; }
          }
        </style>
      </head>
      <body>
        ${couponsToPrint
          .map(
            (coupon) => `
          <div class="coupon">
            <div class="coupon-logo"></div>
            <div class="coupon-header">${coupon.title}</div>
            <div class="coupon-code">${coupon.code}</div>
            <div class="coupon-details">Meal: ${coupon.mealTypeName}</div>
            <div class="coupon-details">Batch: ${coupon.batchNumber}</div>
            <div class="coupon-footer">
              Generated: ${new Date(coupon.generatedAt).toLocaleDateString()}<br>
              Valid for one meal only
            </div>
            <div class="ministry-text">Ministry of Education</div>
          </div>
        `,
          )
          .join("")}
      </body>
    </html>
  `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadCoupons = (batchNumber?: string) => {
    const couponsToDownload = batchNumber
      ? coupons.filter((c) => c.batchNumber === batchNumber)
      : filteredAndSortedCoupons

    if (couponsToDownload.length === 0) {
      toast({
        title: "No Coupons",
        description: "No coupons to download",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["Code", "Title", "Meal Type", "Batch Number", "Status", "Used", "Generated By", "Generated At"]
    const csvContent = [
      headers.join(","),
      ...couponsToDownload.map((coupon) =>
        [
          coupon.code,
          `"${coupon.title}"`,
          `"${coupon.mealTypeName}"`,
          coupon.batchNumber,
          coupon.isActive ? "Active" : "Inactive",
          coupon.isUsed ? "Used" : "Unused",
          `"${coupon.generatedBy}"`,
          new Date(coupon.generatedAt).toLocaleString(),
        ].join(","),
      ),
    ].join("\n")

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `coupons-${batchNumber || "filtered"}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setBatchFilter("all")
    setStatusFilter("all")
    setUsageFilter("all")
    setSortBy("generatedAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    batchFilter !== "all" ||
    statusFilter !== "all" ||
    usageFilter !== "all" ||
    sortBy !== "generatedAt" ||
    sortOrder !== "desc"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
        <Button onClick={() => setGeneratorModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate Coupons
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "coupons" ? "default" : "outline"}
          onClick={() => {
            setViewMode("coupons")
            setCurrentPage(1)
          }}
        >
          Individual Coupons
        </Button>
        <Button
          variant={viewMode === "batches" ? "default" : "outline"}
          onClick={() => {
            setViewMode("batches")
            setCurrentPage(1)
          }}
        >
          Batch Overview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>
                {viewMode === "coupons"
                  ? `Coupons (${filteredAndSortedCoupons.length})`
                  : `Batches (${batches.length})`}
              </CardTitle>
              <div className="flex gap-2">
                {hasActiveFilters && viewMode === "coupons" && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
                {viewMode === "coupons" && filteredAndSortedCoupons.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handlePrintCoupons()}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Filtered
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadCoupons()}>
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Search and Filters - Only for coupons view */}
            {viewMode === "coupons" && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coupons..."
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
                    value={batchFilter}
                    onValueChange={(value) => {
                      setBatchFilter(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batchNumbers.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
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
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={usageFilter}
                    onValueChange={(value) => {
                      setUsageFilter(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="unused">Unused</SelectItem>
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
                      <SelectItem value="generatedAt-desc">Newest First</SelectItem>
                      <SelectItem value="generatedAt-asc">Oldest First</SelectItem>
                      <SelectItem value="code-asc">Code (A-Z)</SelectItem>
                      <SelectItem value="code-desc">Code (Z-A)</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                      <SelectItem value="batchNumber-desc">Batch (Newest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {viewMode === "coupons" ? (
                        <>
                          <TableHead>Code</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Meal Type</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Generated By</TableHead>
                          <TableHead>Generated At</TableHead>
                          <TableHead>Actions</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Batch Number</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Meal Type</TableHead>
                          <TableHead>Total Coupons</TableHead>
                          <TableHead>Used</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Generated By</TableHead>
                          <TableHead>Generated At</TableHead>
                          <TableHead>Actions</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          {viewMode === "coupons" ? "No coupons found" : "No batches found"}
                        </TableCell>
                      </TableRow>
                    ) : viewMode === "coupons" ? (
                      (paginatedItems as Coupon[]).map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                          <TableCell>{coupon.title}</TableCell>
                          <TableCell>{coupon.mealTypeName}</TableCell>
                          <TableCell className="font-mono text-sm">{coupon.batchNumber}</TableCell>
                          <TableCell>
                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                              {coupon.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={coupon.isUsed ? "destructive" : "outline"}>
                              {coupon.isUsed ? "Used" : "Unused"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{coupon.generatedBy}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(coupon.generatedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintCoupons(coupon.batchNumber)}
                                title="Print batch"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem("coupon", coupon.id)}
                                disabled={coupon.isUsed}
                                title={coupon.isUsed ? "Cannot delete used coupon" : "Delete coupon"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      (paginatedItems as CouponBatch[]).map((batch) => (
                        <TableRow key={batch.batchNumber}>
                          <TableCell className="font-mono font-medium">{batch.batchNumber}</TableCell>
                          <TableCell>{batch.title}</TableCell>
                          <TableCell>{batch.mealTypeName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              {batch.totalCoupons}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {batch.usedCoupons} / {batch.totalCoupons}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(batch.usedCoupons / batch.totalCoupons) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={batch.isActive}
                                onCheckedChange={() => handleToggleBatchStatus(batch.batchNumber)}
                              />
                              <span className="flex items-center">
                                {batch.isActive ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                {batch.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{batch.generatedBy}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(batch.generatedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintCoupons(batch.batchNumber)}
                                title="Print batch"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadCoupons(batch.batchNumber)}
                                title="Download batch"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem("batch", batch.batchNumber)}
                                disabled={batch.usedCoupons > 0}
                                title={batch.usedCoupons > 0 ? "Cannot delete batch with used coupons" : "Delete batch"}
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

              {(viewMode === "coupons" ? filteredAndSortedCoupons.length : batches.length) > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={viewMode === "coupons" ? filteredAndSortedCoupons.length : batches.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize)
                    setCurrentPage(1)
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CouponGeneratorModal open={generatorModalOpen} onOpenChange={setGeneratorModalOpen} onSuccess={fetchData} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type === "coupon" ? "Coupon" : "Batch"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
              {itemToDelete?.type === "batch" && " All coupons in this batch will be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
