"use client"

import type { Employee, MealRecord, EmployeeUsageStats } from "./types"
import { getMealTypeById } from "./meal-service"
import {remoteAxiosInstance} from "./axiosInstance"

// Demo data - in a real app, this would come from a database
const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "1",
    employeeId: "EMP001",
    cardId: "04A2B3C4D5",
    shortCode: "1234",
    name: "አበበ ቢቂላ",
    department: "ኢንጂነሪንግ",
    photoUrl: "/placeholder.svg?height=200&width=200&text=አበ",
    isActive: true,
  },
  {
    id: "2",
    employeeId: "EMP002",
    cardId: "15F6E7D8C9",
    shortCode: "5678",
    name: "ሰላም ታደሰ",
    department: "ማርኬቲንግ",
    photoUrl: "/placeholder.svg?height=200&width=200&text=ሰላ",
    isActive: true,
  },
  {
    id: "3",
    employeeId: "EMP003",
    cardId: "26A7B8C9D0",
    shortCode: "9012",
    name: "ፍቃዱ ተስፋዬ",
    department: "ፋይናንስ",
    photoUrl: "/placeholder.svg?height=200&width=200&text=ፍቃ",
    isActive: false,
  },
]

// Get employees from localStorage or use demo data
const getEmployees = (): Promise<Employee[]> => {
  return remoteAxiosInstance.get("/employees").then(response =>response.data).catch(err=> console.log(err));
  // const storedEmployees = localStorage.getItem("employees")
  // return storedEmployees ? JSON.parse(storedEmployees) : DEMO_EMPLOYEES
}

// Save employees to localStorage
const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem("employees", JSON.stringify(employees))
}

// In a real app, this would be stored in a database
const getMealRecords = (): MealRecord[] => {
  const storedRecords = localStorage.getItem("mealRecords")
  return storedRecords ? JSON.parse(storedRecords) : []
}

const saveMealRecords = (records: MealRecord[]) => {
  localStorage.setItem("mealRecords", JSON.stringify(records))
}

// Get an employee by their card ID or short code
export const getEmployeeByCardId = async (input: string): Promise<Employee> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = await getEmployees()
  const employee = employees.find((emp) => emp.isActive && (emp.cardId === input || emp.shortCode === input))

  if (!employee) {
    throw new Error("Employee not found or inactive")
  }
  return employee
}

// Check if an employee has already used a meal type today
export const hasUsedMeal = async (cardId: string, mealTypeId: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = getMealRecords()
  const today = new Date().toISOString().split("T")[0]

  return records.some(
    (record) => record.cardId === cardId && record.mealTypeId === mealTypeId && record.timestamp.startsWith(today),
  )
}

// Record a meal for an employee
export const recordMeal = async (cardId: string, mealTypeId: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  const employee = await getEmployeeByCardId(cardId)
  const mealType = await getMealTypeById(mealTypeId)
  const records = getMealRecords()

  const newRecord: MealRecord = {
    id: Date.now().toString(),
    employeeId: employee.employeeId,
    cardId: cardId,
    mealTypeId: mealTypeId,
    mealName: mealType.name,
    price: mealType.price,
    timestamp: new Date().toISOString(),
  }

  records.push(newRecord)
  saveMealRecords(records)
}

// Get all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getEmployees()
}

// Get all meal records
export const getAllMealRecords = async (): Promise<MealRecord[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getMealRecords()
}

// Get employee usage statistics
export const getEmployeeUsageStats = async (employeeId: string): Promise<EmployeeUsageStats> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = getMealRecords()
  const employeeRecords = records.filter((record) => record.employeeId === employeeId)

  const mealCounts: { [mealTypeId: string]: number } = {}
  const mealAmounts: { [mealTypeId: string]: number } = {}
  let totalAmount = 0

  employeeRecords.forEach((record) => {
    // Count meals by type
    if (!mealCounts[record.mealTypeId]) {
      mealCounts[record.mealTypeId] = 0
    }
    mealCounts[record.mealTypeId]++

    // Sum amounts by type
    if (!mealAmounts[record.mealTypeId]) {
      mealAmounts[record.mealTypeId] = 0
    }
    mealAmounts[record.mealTypeId] += record.price
    totalAmount += record.price
  })

  const stats: EmployeeUsageStats = {
    totalMeals: employeeRecords.length,
    totalAmount,
    mealCounts,
    mealAmounts,
  }

  return stats
}

// Get employee meal records
export const getEmployeeMealRecords = async (employeeId: string): Promise<MealRecord[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = getMealRecords()
  return records
    .filter((record) => record.employeeId === employeeId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Toggle employee active status
export const toggleEmployeeStatus = async (employeeId: string): Promise<Employee> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = await getEmployees()
  const employeeIndex = employees.findIndex((emp) => emp.id === employeeId)

  if (employeeIndex === -1) {
    throw new Error("Employee not found")
  }

  employees[employeeIndex].isActive = !employees[employeeIndex].isActive
  saveEmployees(employees)

  return employees[employeeIndex]
}

// Assign card to employee
export const assignCardToEmployee = async (
  employeeId: string,
  cardId: string,
  shortCode: string,
): Promise<Employee> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = await getEmployees()
  const employeeIndex = employees.findIndex((emp) => emp.id === employeeId)

  if (employeeIndex === -1) {
    throw new Error("Employee not found")
  }

  // Check if card ID is already assigned to another employee
  const existingCardEmployee = employees.find((emp) => emp.id !== employeeId && emp.cardId === cardId)
  if (existingCardEmployee) {
    throw new Error(`Card ID is already assigned to ${existingCardEmployee.name}`)
  }

  // Check if short code is already assigned to another employee
  const existingCodeEmployee = employees.find((emp) => emp.id !== employeeId && emp.shortCode === shortCode)
  if (existingCodeEmployee) {
    throw new Error(`Short code is already assigned to ${existingCodeEmployee.name}`)
  }

  // Assign the card and code
  employees[employeeIndex].cardId = cardId
  employees[employeeIndex].shortCode = shortCode
  saveEmployees(employees)

  return employees[employeeIndex]
}

// Get employee by ID
export const getEmployeeById = async (employeeId: string): Promise<Employee> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const employees =  await getEmployees()
  const employee = employees.find((emp) => emp.id === employeeId)

  if (!employee) {
    throw new Error("Employee not found")
  }

  return employee
}
