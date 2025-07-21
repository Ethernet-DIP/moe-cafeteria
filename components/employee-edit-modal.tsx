"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateEmployee } from "@/lib/employee-service"
import type { Employee } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface EmployeeEditModalProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EmployeeEditModal({ employee, open, onOpenChange, onSuccess }: EmployeeEditModalProps) {
  const [name, setName] = useState(employee?.name || "")
  const [department, setDepartment] = useState(employee?.department || "")
  const [salary, setSalary] = useState<number | string>(employee?.salary || "")
  const [isActive, setIsActive] = useState(employee?.isActive || false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (employee) {
      setName(employee.name)
      setDepartment(employee.department)
      setSalary(employee.salary !== undefined ? employee.salary : "")
      setIsActive(employee.isActive)
    } else {
      // Reset form when no employee is selected (e.g., for "Add Employee" if this modal were reused)
      setName("")
      setDepartment("")
      setSalary("")
      setIsActive(false)
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    setLoading(true)
    try {
      await updateEmployee(employee.id, {
        name,
        department,
        salary: typeof salary === "string" && salary === "" ? undefined : Number(salary),
        isActive,
      })
      toast({
        title: "Success",
        description: "Employee updated successfully.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update employee.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? `Edit Employee: ${employee.name}` : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Make changes to the employee's profile here." : "Add a new employee to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salary" className="text-right">
              Salary (ETB)
            </Label>
            <Input
              id="salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="col-span-3"
              step="0.01"
              min="0"
              placeholder="e.g., 5000.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
