"use client"

import type { Coupon, CouponBatch } from "./types"
import { apiClient } from "./axiosInstance"

// Get all coupon batches
export const getCouponBatches = async (): Promise<CouponBatch[]> => {
  try {
    const response = await apiClient.get("/coupon-batches")
    return response.data
  } catch (error) {
    console.error("Error fetching coupon batches:", error)
    throw new Error("Failed to fetch coupon batches")
  }
}

// Get coupon batch by ID
export const getCouponBatchById = async (id: string): Promise<CouponBatch> => {
  try {
    const response = await apiClient.get(`/coupon-batches/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching coupon batch:", error)
    throw new Error("Coupon batch not found")
  }
}

// Create new coupon batch
export const createCouponBatch = async (batch: Omit<CouponBatch, "id">): Promise<CouponBatch> => {
  try {
    const response = await apiClient.post("/coupon-batches", batch)
    return response.data
  } catch (error) {
    console.error("Error creating coupon batch:", error)
    throw new Error("Failed to create coupon batch")
  }
}

// Update coupon batch
export const updateCouponBatch = async (id: string, updates: Partial<CouponBatch>): Promise<CouponBatch> => {
  try {
    const response = await apiClient.put(`/coupon-batches/${id}`, updates)
    return response.data
  } catch (error) {
    console.error("Error updating coupon batch:", error)
    throw new Error("Failed to update coupon batch")
  }
}

// Delete coupon batch
export const deleteCouponBatch = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/coupon-batches/${id}`)
  } catch (error) {
    console.error("Error deleting coupon batch:", error)
    throw new Error("Failed to delete coupon batch")
  }
}

// Get all coupons
export const getCoupons = async (): Promise<Coupon[]> => {
  try {
    const response = await apiClient.get("/coupons")
    return response.data
  } catch (error) {
    console.error("Error fetching coupons:", error)
    throw new Error("Failed to fetch coupons")
  }
}

// Get coupons by batch ID
export const getCouponsByBatch = async (batchId: string): Promise<Coupon[]> => {
  try {
    const response = await apiClient.get(`/coupons/by-batch/${batchId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching coupons by batch:", error)
    throw new Error("Failed to fetch coupons by batch")
  }
}

// Get coupon by code
export const getCouponByCode = async (code: string): Promise<Coupon> => {
  try {
    const response = await apiClient.get(`/coupons/by-code/${code}`)
    return response.data
  } catch (error) {
    console.error("Error fetching coupon by code:", error)
    throw new Error("Coupon not found")
  }
}

// Redeem coupon
export const redeemCoupon = async (code: string, employeeId: string): Promise<Coupon> => {
  try {
    const response = await apiClient.post(`/coupons/${code}/redeem`, {
      employeeId
    })
    return response.data
  } catch (error: any) {
    console.error("Error redeeming coupon:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to redeem coupon")
  }
}

// Generate coupons for a batch
export const generateCoupons = async (batchId: string, count: number): Promise<Coupon[]> => {
  try {
    const response = await apiClient.post(`/coupon-batches/${batchId}/generate-coupons`, {
      count
    })
    return response.data
  } catch (error) {
    console.error("Error generating coupons:", error)
    throw new Error("Failed to generate coupons")
  }
}

// Get coupon statistics
export const getCouponStats = async (batchId?: string): Promise<any> => {
  try {
    const url = batchId ? `/coupons/stats?batchId=${batchId}` : "/coupons/stats"
    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching coupon statistics:", error)
    throw new Error("Failed to fetch coupon statistics")
  }
}
