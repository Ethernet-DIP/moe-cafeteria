export interface MealType {
  id: string
  name: string
  price: number
  icon: string
  enabled: boolean
  color: string
}

export interface Employee {
  id: string
  employeeId: string
  cardId: string
  shortCode: string
  name: string
  department: string
  photoUrl?: string
  isActive: boolean
}

export interface MealRecord {
  id: string
  employeeId: string
  cardId: string
  mealTypeId: string
  mealName: string
  price: number
  timestamp: string
}

export interface EmployeeUsageStats {
  totalMeals: number
  totalAmount: number
  mealCounts: {
    [mealTypeId: string]: number
  }
  mealAmounts: {
    [mealTypeId: string]: number
  }
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
  mealTypeName: string
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
  mealTypeName: string
  totalCoupons: number
  usedCoupons: number
  isActive: boolean
  color: string
  generatedBy: string
  generatedAt: string
}
