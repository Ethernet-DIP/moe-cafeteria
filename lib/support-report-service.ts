"use client"

import { apiClient } from "./axiosInstance"
import type { SupportSummary, DepartmentSupportAnalysis } from "./types"

export const getSupportSummary = async (period: string = "monthly"): Promise<SupportSummary> => {
  try {
    const response = await apiClient.get(`/support-reports/summary?period=${period}`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching support summary:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to fetch support summary")
  }
}

export const getDepartmentAnalysis = async (period: string = "monthly"): Promise<DepartmentSupportAnalysis[]> => {
  try {
    const response = await apiClient.get(`/support-reports/department-analysis?period=${period}`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching department analysis:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to fetch department analysis")
  }
}

export interface PaginatedDepartmentAnalysis {
  content: DepartmentSupportAnalysis[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export const getPaginatedDepartmentAnalysis = async (
  period: string = "monthly", 
  page: number = 0, 
  size: number = 10
): Promise<PaginatedDepartmentAnalysis> => {
  try {
    const response = await apiClient.get(`/support-reports/department-analysis/paginated?period=${period}&page=${page}&size=${size}`)
    return response.data
  } catch (error: any) {
    console.error("Error fetching paginated department analysis:", error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error("Failed to fetch paginated department analysis")
  }
} 