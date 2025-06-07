"use client"

import type { Coupon, CouponBatch } from "./types"
import { getCurrentUser } from "./auth-service"
import { getMealTypeById } from "./meal-service"

// Get coupons from localStorage
const getCoupons = (): Coupon[] => {
  const storedCoupons = localStorage.getItem("coupons")
  return storedCoupons ? JSON.parse(storedCoupons) : []
}

// Save coupons to localStorage
const saveCoupons = (coupons: Coupon[]) => {
  localStorage.setItem("coupons", JSON.stringify(coupons))
}

// Generate a unique coupon code
const generateCouponCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a batch number
const generateBatchNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `BATCH-${timestamp}-${random}`
}

// Generate coupons
export const generateCoupons = async (
  count: number,
  mealTypeId: string,
  title: string,
  color: string,
): Promise<{ batchNumber: string; coupons: Coupon[] }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("User not authenticated")
  }

  const mealType = await getMealTypeById(mealTypeId)
  const batchNumber = generateBatchNumber()
  const timestamp = new Date().toISOString()
  const existingCoupons = getCoupons()
  const newCoupons: Coupon[] = []

  for (let i = 0; i < count; i++) {
    let couponCode: string
    let attempts = 0
    const maxAttempts = 100

    // Generate unique coupon code
    do {
      couponCode = generateCouponCode()
      attempts++
      if (attempts > maxAttempts) {
        throw new Error("Failed to generate unique coupon code")
      }
    } while (existingCoupons.some((c) => c.code === couponCode) || newCoupons.some((c) => c.code === couponCode))

    const coupon: Coupon = {
      id: `${batchNumber}-${i + 1}`,
      code: couponCode,
      batchNumber,
      title,
      mealTypeId,
      mealTypeName: mealType.name,
      isUsed: false,
      isActive: true,
      color,
      generatedBy: currentUser.fullName,
      generatedAt: timestamp,
    }

    newCoupons.push(coupon)
  }

  const allCoupons = [...existingCoupons, ...newCoupons]
  saveCoupons(allCoupons)

  return { batchNumber, coupons: newCoupons }
}

// Get all coupons
export const getAllCoupons = async (): Promise<Coupon[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return getCoupons()
}

// Get coupon batches
export const getCouponBatches = async (): Promise<CouponBatch[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const coupons = getCoupons()
  const batchMap = new Map<string, CouponBatch>()

  coupons.forEach((coupon) => {
    if (!batchMap.has(coupon.batchNumber)) {
      batchMap.set(coupon.batchNumber, {
        batchNumber: coupon.batchNumber,
        title: coupon.title,
        mealTypeId: coupon.mealTypeId,
        mealTypeName: coupon.mealTypeName,
        totalCoupons: 0,
        usedCoupons: 0,
        isActive: coupon.isActive,
        color: coupon.color,
        generatedBy: coupon.generatedBy,
        generatedAt: coupon.generatedAt,
      })
    }

    const batch = batchMap.get(coupon.batchNumber)!
    batch.totalCoupons++
    if (coupon.isUsed) {
      batch.usedCoupons++
    }
    // Update batch active status (all coupons in batch must be active for batch to be active)
    if (!coupon.isActive) {
      batch.isActive = false
    }
  })

  return Array.from(batchMap.values()).sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  )
}

// Toggle batch status
export const toggleBatchStatus = async (batchNumber: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const coupons = getCoupons()
  const batchCoupons = coupons.filter((c) => c.batchNumber === batchNumber)

  if (batchCoupons.length === 0) {
    throw new Error("Batch not found")
  }

  const newStatus = !batchCoupons[0].isActive

  // Update all coupons in the batch
  coupons.forEach((coupon) => {
    if (coupon.batchNumber === batchNumber) {
      coupon.isActive = newStatus
    }
  })

  saveCoupons(coupons)
}

// Delete coupon
export const deleteCoupon = async (couponId: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const coupons = getCoupons()
  const filteredCoupons = coupons.filter((c) => c.id !== couponId)

  if (filteredCoupons.length === coupons.length) {
    throw new Error("Coupon not found")
  }

  saveCoupons(filteredCoupons)
}

// Delete batch
export const deleteBatch = async (batchNumber: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const coupons = getCoupons()
  const filteredCoupons = coupons.filter((c) => c.batchNumber !== batchNumber)

  saveCoupons(filteredCoupons)
}

// Use coupon
export const useCoupon = async (couponCode: string, employeeId?: string): Promise<Coupon> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const coupons = getCoupons()
  const couponIndex = coupons.findIndex((c) => c.code === couponCode)

  if (couponIndex === -1) {
    throw new Error("Coupon not found")
  }

  const coupon = coupons[couponIndex]

  if (!coupon.isActive) {
    throw new Error("Coupon is not active")
  }

  if (coupon.isUsed) {
    throw new Error("Coupon has already been used")
  }

  // Mark coupon as used
  coupon.isUsed = true
  coupon.usedAt = new Date().toISOString()
  if (employeeId) {
    coupon.usedBy = employeeId
  }

  saveCoupons(coupons)
  return coupon
}

// Get coupons by batch
export const getCouponsByBatch = async (batchNumber: string): Promise<Coupon[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const coupons = getCoupons()
  return coupons.filter((c) => c.batchNumber === batchNumber)
}

// Validate coupon
export const validateCoupon = async (couponCode: string): Promise<Coupon> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const coupons = getCoupons()
  const coupon = coupons.find((c) => c.code === couponCode)

  if (!coupon) {
    throw new Error("Coupon not found")
  }

  if (!coupon.isActive) {
    throw new Error("Coupon is not active")
  }

  if (coupon.isUsed) {
    throw new Error("Coupon has already been used")
  }

  return coupon
}
