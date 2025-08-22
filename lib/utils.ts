import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get the proper image URL for uploaded files
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it's a relative path starting with /uploads/, construct the full URL
  if (imageUrl.startsWith('/uploads/')) {
    // Use the API base URL since uploads are served under /api/uploads/
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
    return `${baseUrl}${imageUrl}`
  }
  
  // If it's just a filename or other path, return as is
  return imageUrl
}
