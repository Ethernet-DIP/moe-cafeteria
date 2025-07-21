"use client"

import type { Employee, MealRecord, EmployeeUsageStats, SupportConfig } from "./types"
import { getMealCategoryById } from "./meal-service"

// Demo data with salary information
const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "1",
    employeeId: "EMP001",
    cardId: "04A2B3C4D5",
    shortCode: "1234",
    name: "አበበ ቢቂላ",
    department: "ኢንጂነሪንግ",
    salary: 4500,
    photoUrl: "/placeholder.svg?height=200&width=200&text=አበ",
    isActive: true,
    eligibleForSupport: true,
    supportStatus: "Eligible",
  },
  {
    id: "2",
    employeeId: "EMP002",
    cardId: "15F6E7D8C9",
    shortCode: "5678",
    name: "ሰላም ታደሰ",
    department: "ማርኬቲንግ",
    salary: 3800,
    photoUrl: "/placeholder.svg?height=200&width=200&text=ሰላ",
    isActive: true,
    eligibleForSupport: true,
    supportStatus: "Eligible",
  },
  {
    id: "3",
    employeeId: "EMP003",
    cardId: "26A7B8C9D0",
    shortCode: "9012",
    name: "ፍቃዱ ተስፋዬ",
    department: "ፋይናንስ",
    salary: 4200,
    photoUrl: "/placeholder.svg?height=200&width=200&text=ፍቃ",
    isActive: false,
    eligibleForSupport: true,
    supportStatus: "Eligible",
  },
  {
    id: "4",
    employeeId: "EMP004",
    cardId: "37B8C9D0E1",
    shortCode: "3456",
    name: "ሄኖክ መንግስቱ",
    department: "ሰው ሃይል",
    salary: 6500,
    photoUrl: "/placeholder.svg?height=200&width=200&text=ሄኖ",
    isActive: true,
    eligibleForSupport: false,
    supportStatus: "Not Eligible",
  },
  {
    id: "5",
    employeeId: "EMP005",
    cardId: "48C9D0E1F2",
    shortCode: "7890",
    name: "ብርሃን አለሙ",
    department: "ኢንፎርሜሽን ቴክኖሎጂ",
    salary: 7200,
    photoUrl: "/placeholder.svg?height=200&width=200&text=ብር",
    isActive: true,
    eligibleForSupport: false,
    supportStatus: "Not Eligible",
  },
]

// Default support configuration
const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  id: "1",
  maxSalaryForSupport: 5000,
  isActive: true,
}

// Get employees from localStorage or use demo data
const getEmployees = (): Employee[] => {
  const storedEmployees = localStorage.getItem("employees")
  return storedEmployees ? JSON.parse(storedEmployees) : DEMO_EMPLOYEES
}

// Save employees to localStorage
const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem("employees", JSON.stringify(employees))
}

// Get support configuration
const getSupportConfig = (): SupportConfig => {
  const storedConfig = localStorage.getItem("supportConfig")
  return storedConfig ? JSON.parse(storedConfig) : DEFAULT_SUPPORT_CONFIG
}

// Save support configuration
const saveSupportConfig = (config: SupportConfig) => {
  localStorage.setItem("supportConfig", JSON.stringify(config))
}

// Get meal records
const getMealRecords = (): MealRecord[] => {
  const storedRecords = localStorage.getItem("mealRecords")
  return storedRecords ? JSON.parse(storedRecords) : []
}

const saveMealRecords = (records: MealRecord[]) => {
  localStorage.setItem("mealRecords", JSON.stringify(records))
}

// Check if employee is eligible for support
export const isEligibleForSupport = (employee: Employee): boolean => {
  const config = getSupportConfig()
  return employee.salary !== undefined && employee.salary < config.maxSalaryForSupport
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
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = getEmployees()
  const employee = employees.find((emp) => emp.isActive && (emp.cardId === input || emp.shortCode === input))

  if (!employee) {
    throw new Error("Employee not found or inactive")
  }
  return employee
}

// Check if an employee has already used a meal type today
export const hasUsedMeal = async (cardId: string, mealTypeId: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = getMealRecords()
  const today = new Date().toISOString().split("T")[0]

  return records.some(
    (record) => record.cardId === cardId && record.mealTypeId === mealTypeId && record.timestamp.startsWith(today),
  )
}

// Record a meal for an employee
export const recordMeal = async (cardId: string, mealCategoryId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const employee = await getEmployeeByCardId(cardId)
  const category = await getMealCategoryById(mealCategoryId)
  const pricing = await getMealPricing(employee, mealCategoryId)
  const records = getMealRecords()

  // Check if already used this meal type today
  const alreadyUsed = await hasUsedMeal(cardId, category.mealTypeId)
  if (alreadyUsed) {
    throw new Error("Employee has already used this meal type today")
  }

  const newRecord: MealRecord = {
    id: Date.now().toString(),
    employeeId: employee.employeeId,
    cardId: cardId,
    mealTypeId: category.mealTypeId,
    mealCategoryId: mealCategoryId,
    mealName: category.name,
    category: category.category,
    priceType: pricing.priceType,
    normalPrice: pricing.normalPrice,
    supportedPrice: pricing.supportedPrice,
    actualPrice: pricing.applicablePrice,
    supportAmount: pricing.supportAmount,
    employeeSalary: employee.salary,
    timestamp: new Date().toISOString(),
  }

  records.push(newRecord)
  saveMealRecords(records)
}

// Get all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const employees = getEmployees()

  // Update support eligibility for each employee
  return employees.map((employee) => ({
    ...employee,
    eligibleForSupport: isEligibleForSupport(employee),
    supportStatus: isEligibleForSupport(employee) ? "Eligible" : "Not Eligible",
  }))
}

// Get all meal records
export const getAllMealRecords = async (): Promise<MealRecord[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getMealRecords()
}

// Get employee usage statistics
export const getEmployeeUsageStats = async (employeeId: string): Promise<EmployeeUsageStats> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = getMealRecords()
  const employeeRecords = records.filter((record) => record.employeeId === employeeId)

  const mealCounts: { [mealTypeId: string]: number } = {}
  const mealAmounts: { [mealTypeId: string]: number } = {}
  let totalAmount = 0
  let totalSubsidy = 0
  let supportedMeals = 0
  let normalMeals = 0

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
    mealAmounts[record.mealTypeId] += record.actualPrice
    totalAmount += record.actualPrice
    totalSubsidy += record.supportAmount

    // Count by price type
    if (record.priceType === "supported") {
      supportedMeals++
    } else {
      normalMeals++
    }
  })

  const totalSavings = employeeRecords.reduce((sum, record) => sum + (record.normalPrice - record.actualPrice), 0)

  const stats: EmployeeUsageStats = {
    totalMeals: employeeRecords.length,
    totalAmount,
    totalSubsidy,
    totalSavings,
    mealCounts,
    mealAmounts,
    supportedMeals,
    normalMeals,
  }

  return stats
}

// Get employee meal records
export const getEmployeeMealRecords = async (employeeId: string): Promise<MealRecord[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = getMealRecords()
  return records
    .filter((record) => record.employeeId === employeeId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Toggle employee active status
export const toggleEmployeeStatus = async (employeeId: string): Promise<Employee> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = getEmployees()
  const employeeIndex = employees.findIndex((emp) => emp.id === employeeId)

  if (employeeIndex === -1) {
    throw new Error("Employee not found")
  }

  employees[employeeIndex].isActive = !employees[employeeIndex].isActive
  saveEmployees(employees)

  return employees[employeeIndex]
}

// Update employee
export const updateEmployee = async (employeeId: string, updates: Partial<Employee>): Promise<Employee> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = getEmployees()
  const employeeIndex = employees.findIndex((emp) => emp.id === employeeId)

  if (employeeIndex === -1) {
    throw new Error("Employee not found")
  }

  const updatedEmployee = {
    ...employees[employeeIndex],
    ...updates,
  }

  // Update support eligibility
  updatedEmployee.eligibleForSupport = isEligibleForSupport(updatedEmployee)
  updatedEmployee.supportStatus = updatedEmployee.eligibleForSupport ? "Eligible" : "Not Eligible"

  employees[employeeIndex] = updatedEmployee
  saveEmployees(employees)

  return updatedEmployee
}

// Assign card to employee
export const assignCardToEmployee = async (
  employeeId: string,
  cardId: string,
  shortCode: string,
): Promise<Employee> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = getEmployees()
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
  await new Promise((resolve) => setTimeout(resolve, 300))

  const employees = getEmployees()
  const employee = employees.find((emp) => emp.id === employeeId)

  if (!employee) {
    throw new Error("Employee not found")
  }

  return employee
}

// Get support configuration
export const getSupportConfiguration = async (): Promise<SupportConfig> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return getSupportConfig()
}

// Update support configuration
export const updateSupportConfiguration = async (maxSalary: number): Promise<SupportConfig> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const config: SupportConfig = {
    id: "1",
    maxSalaryForSupport: maxSalary,
    isActive: true,
  }

  saveSupportConfig(config)

  // Update all employees' support eligibility
  const employees = getEmployees()
  const updatedEmployees = employees.map((employee) => ({
    ...employee,
    eligibleForSupport: employee.salary !== undefined && employee.salary < maxSalary,
    supportStatus: employee.salary !== undefined && employee.salary < maxSalary ? "Eligible" : "Not Eligible",
  }))

  saveEmployees(updatedEmployees)

  return config
}
