"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { addEmployee } from "@/lib/employee-service"
import { useToast } from "@/components/ui/use-toast"
import type { Employee } from "@/lib/types"

interface EmployeeAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EmployeeAddModal({ open, onOpenChange, onSuccess }: EmployeeAddModalProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    department: "",
    salary: "",
    cardId: "",
    shortCode: "",
    photoUrl: "/placeholder.jpg",
    isActive: true,
  })

  const departments = [
    "ኢንጂነሪንግ",
    "አስተዳደር",
    "ፋይናንስ",
    "ጥበብ እና ስፖርት",
    "ጤና እና ማህበረሰብ ማሳተሚያ",
    "መረጃ እና ቴክኖሎጂ",
    "ሕግ እና ደህንነት",
    "መምህራን ማሰልጠኛ ኮሌጅ",
    "ሌሎች",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const employeeData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        cardId: formData.cardId || undefined,
        shortCode: formData.shortCode || undefined,
      }

      await addEmployee(employeeData)
      
      toast({
        title: "Success",
        description: "Employee added successfully",
      })

      // Reset form
      setFormData({
        employeeId: "",
        name: "",
        department: "",
        salary: "",
        cardId: "",
        shortCode: "",
        photoUrl: "/placeholder.jpg",
        isActive: true,
      })

      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error adding employee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                placeholder="EMP001"
                required
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="የሚስተር አበበ"
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange("department", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="salary">Salary (ETB)</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                placeholder="4500.00"
              />
            </div>

            {/* Card ID */}
            <div className="space-y-2">
              <Label htmlFor="cardId">Card ID</Label>
              <Input
                id="cardId"
                value={formData.cardId}
                onChange={(e) => handleInputChange("cardId", e.target.value)}
                placeholder="04A2B3C4D5"
              />
            </div>

            {/* Short Code */}
            <div className="space-y-2">
              <Label htmlFor="shortCode">Short Code</Label>
              <Input
                id="shortCode"
                value={formData.shortCode}
                onChange={(e) => handleInputChange("shortCode", e.target.value)}
                placeholder="1234"
                maxLength={4}
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 