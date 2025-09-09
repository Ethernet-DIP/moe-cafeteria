"use client"

import type { Employee, MealRecord, EmployeeUsageStats, SupportConfig } from "./types"
import { getMealCategoryById } from "./meal-service"
import { apiClient } from "./axiosInstance"

// Check if employee is eligible for support
export const isEligibleForSupport = (employee: Employee): boolean => {
  return employee.eligibleForSupport || false
}

// Get meal pricing for employee
export const getMealPricing = async (employee: Employee, mealCategoryId: string) => {
  const category = await getMealCategoryById(mealCategoryId)
  const eligible = isEligibleForSupport(employee)

  return {
    normalPrice: category.normalPrice,
    supportedPrice: category.supportedPrice,
    applicablePrice: eligible ? category.supportedPrice : category.normalPrice,
    priceType: eligible ? ("supported" as const) : ("normal" as const),
    supportAmount: eligible ? category.normalPrice - category.supportedPrice : 0,
    eligibleForSupport: eligible,
  }
}

// Get an employee by their card ID or short code
export const getEmployeeByCardId = async (input: string): Promise<Employee> => {
  try {
    const response = await apiClient.get(`/employees/by-card/${input}`)
    return response.data
  } catch (error) {
    console.error("Error fetching employee by card:", error)
    throw new Error("Employee not found or inactive")
  }
}

// Get an employee by their short code
export const getEmployeeByCode = async (code: string): Promise<Employee> => {
  try {
    const response = await apiClient.get(`/employees/by-code/${code}`)
    return response.data
  } catch (error) {
    console.error("Error fetching employee by code:", error)
    throw new Error("Employee not found or inactive")
  }
}

// Check if an employee has already used a meal type today
export const hasUsedMeal = async (cardId: string, mealTypeId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/meal-records/check-duplicate`, {
      params: { cardId, mealTypeId }
    })
    return response.data.hasUsedToday
  } catch (error) {
    console.error("Error checking meal usage:", error)
    return false
  }
}

// Record a meal for an employee
export const recordMeal = async (cardId: string, mealCategoryId: string): Promise<MealRecord> => {
  try {
    const response = await apiClient.post("/meal-records/record", {
      cardId,
      mealCategoryId
    })
    return response.data
  } catch (error: any) {
    console.error("Error recording meal:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error("Failed to record meal")
  }
}

// Record a meal for an employee with selected items
export const recordMealWithItems = async (
  cardId: string, 
  mealCategoryId: string, 
  selectedItems: Array<{ mealItemId: string; quantity: number }>
): Promise<MealRecord> => {
  try {
    const response = await apiClient.post("/meal-records/record-with-items", {
      cardId,
      mealCategoryId,
      selectedItems
    })
    return response.data
  } catch (error: any) {
    console.error("Error recording meal with items:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error("Failed to record meal with items")
  }
}

// Attach selected items to an existing meal record
export const saveItemsForMealRecord = async (
  mealRecordId: string,
  selectedItems: Array<{ mealItemId: string; quantity: number }>
): Promise<MealRecord> => {
  try {
    const response = await apiClient.post(`/meal-records/${mealRecordId}/items`, {
      selectedItems
    })
    return response.data
  } catch (error: any) {
    console.error("Error saving items for record:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error("Failed to save items for record")
  }
}

// Get all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await apiClient.get("/employees")
    return response.data
  } catch (error) {
    console.error("Error fetching employees:", error)
    throw new Error("Failed to fetch employees")
  }
}

// Get support eligible employees
export const getSupportEligibleEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await apiClient.get("/employees/support-eligible")
    return response.data
  } catch (error) {
    console.error("Error fetching support eligible employees:", error)
    throw new Error("Failed to fetch support eligible employees")
  }
}

// Get all meal records
export const getAllMealRecords = async (): Promise<MealRecord[]> => {
  try {
    const response = await apiClient.get("/meal-records")
    return response.data
  } catch (error) {
    console.error("Error fetching meal records:", error)
    throw new Error("Failed to fetch meal records")
  }
}

// Get meal records by date range
export const getMealRecordsByDateRange = async (startDate: string, endDate: string): Promise<MealRecord[]> => {
  try {
    const response = await apiClient.get("/meal-records/by-date-range", {
      params: { startDate, endDate }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching meal records by date range:", error)
    throw new Error("Failed to fetch meal records by date range")
  }
}

// Get meal records by department
export const getMealRecordsByDepartment = async (department: string): Promise<MealRecord[]> => {
  try {
    const response = await apiClient.get("/meal-records/by-department", {
      params: { department }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching meal records by department:", error)
    throw new Error("Failed to fetch meal records by department")
  }
}

// Get employee usage statistics
export const getEmployeeUsageStats = async (employeeId: string): Promise<EmployeeUsageStats> => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/usage-stats`)
    return response.data
  } catch (error) {
    console.error("Error fetching employee usage stats:", error)
    throw new Error("Failed to fetch employee usage statistics")
  }
}

// Get employee meal records
export const getEmployeeMealRecords = async (employeeId: string): Promise<MealRecord[]> => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/meal-records`)
    return response.data
  } catch (error) {
    console.error("Error fetching employee meal records:", error)
    throw new Error("Failed to fetch employee meal records")
  }
}

// Toggle employee active status
export const toggleEmployeeStatus = async (employeeId: string): Promise<Employee> => {
  try {
    const response = await apiClient.patch(`/employees/${employeeId}/toggle`)
    return response.data
  } catch (error) {
    console.error("Error toggling employee status:", error)
    throw new Error("Failed to toggle employee status")
  }
}

// Update employee
export const updateEmployee = async (employeeId: string, updates: Partial<Employee>): Promise<Employee> => {
  try {
    const response = await apiClient.put(`/employees/${employeeId}`, updates)
    return response.data
  } catch (error) {
    console.error("Error updating employee:", error)
    throw new Error("Failed to update employee")
  }
}

// Add new employee
export const addEmployee = async (employee: Omit<Employee, "id">): Promise<Employee> => {
  try {
    const response = await apiClient.post("/employees", employee)
    return response.data
  } catch (error) {
    console.error("Error adding employee:", error)
    throw new Error("Failed to add employee")
  }
}

// Delete employee
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  try {
    await apiClient.delete(`/employees/${employeeId}`)
  } catch (error) {
    console.error("Error deleting employee:", error)
    throw new Error("Failed to delete employee")
  }
}

// Assign card to employee
export const assignCardToEmployee = async (
  employeeId: string,
  cardId: string,
  shortCode: string,
): Promise<Employee> => {
  try {
    const response = await apiClient.post(`/employees/${employeeId}/assign-card`, {
      cardId,
      shortCode
    })
    return response.data
  } catch (error: any) {
    console.error("Error assigning card to employee:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to assign card to employee")
  }
}

// Get employee by ID
export const getEmployeeById = async (employeeId: string): Promise<Employee> => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching employee:", error)
    throw new Error("Employee not found")
  }
}

// Get support configuration
export const getSupportConfiguration = async (): Promise<SupportConfig> => {
  try {
    const response = await apiClient.get("/support-config")
    return response.data
  } catch (error) {
    console.error("Error fetching support configuration:", error)
    throw new Error("Failed to fetch support configuration")
  }
}

// Update support configuration
export const updateSupportConfiguration = async (maxSalary: number): Promise<SupportConfig> => {
  try {
    const response = await apiClient.put("/support-config", {
      maxSalaryForSupport: maxSalary
    })
    return response.data
  } catch (error) {
    console.error("Error updating support configuration:", error)
    throw new Error("Failed to update support configuration")
  }
}
