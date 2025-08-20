export interface MealType {
  id: string
  name: string
  icon: string
  isActive: boolean
  color: string
}

export interface MealCategory {
  id: string
  mealTypeId: string
  category: "fasting" | "non_fasting"
  name: string
  normalPrice: number
  supportedPrice: number
  allowedCount: number
  isActive: boolean
}

export interface MealItem {
  id: string
  mealCategoryId: string
  name: string
  description?: string
  imageUrl?: string
  color: string
  totalAvailable: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  item: MealItem
  quantity: number
  price: number
}

export interface Order {
  items: OrderItem[]
  totalPrice: number
  employeeId: string
  mealCategoryId: string
}

export interface Employee {
  id: string
  employeeId: string
  cardId: string
  shortCode: string
  name: string
  department: string
  salary?: number
  photoUrl?: string
  isActive: boolean
  eligibleForSupport?: boolean
  supportStatus?: string
}

export interface MealRecord {
  id: string
  employeeId: string
  cardId: string
  mealTypeId: string
  mealCategoryId: string
  mealName: string
  category: "fasting" | "non_fasting"
  priceType: "normal" | "supported"
  normalPrice: number
  supportedPrice: number
  actualPrice: number
  supportAmount: number
  employeeSalary?: number
  timestamp: string
  createdAt: string
  orderNumber?: string
  // User information
  recordedByUserId?: string
  recordedByUsername?: string
  recordedByFullName?: string
}

export interface EmployeeUsageStats {
  totalMeals: number
  totalAmount: number
  totalSubsidy: number
  totalSavings: number
  mealCounts: {
    [mealTypeId: string]: number
  }
  mealAmounts: {
    [mealTypeId: string]: number
  }
  supportedMeals: number
  normalMeals: number
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: "admin" | "manager" | "operator"
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface Coupon {
  id: string
  code: string
  batchNumber: string
  title: string
  mealTypeId: string
  mealCategoryId?: string
  mealTypeName: string
  category?: "fasting" | "non_fasting"
  isUsed: boolean
  isActive: boolean
  color: string
  generatedBy: string
  generatedAt: string
  usedBy?: string
  usedAt?: string
}

export interface CouponBatch {
  batchNumber: string
  title: string
  mealTypeId: string
  mealCategoryId?: string
  mealTypeName: string
  category?: "fasting" | "non_fasting"
  totalCoupons: number
  usedCoupons: number
  isActive: boolean
  color: string
  generatedBy: string
  generatedAt: string
}

export interface SupportConfig {
  id: string
  maxSalaryForSupport: number
  isActive: boolean
}

export interface SupportSummary {
  totalMeals: number
  supportedMeals: number
  normalMeals: number
  totalRevenue: number
  totalSubsidy: number
  potentialRevenue: number
  supportedEmployees: number
  totalEmployees: number
  supportPercentage: number
}

export interface DepartmentSupportAnalysis {
  department: string
  totalEmployees: number
  eligibleEmployees: number
  employeesUsingSupport: number
  totalMeals: number
  supportedMeals: number
  totalRevenue: number
  totalSubsidy: number
  avgDepartmentSalary: number
  eligibilityPercentage: number
}
