"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/admin-sidebar"
import ProtectedRoute from "@/components/protected-route"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="manager">
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
              <div className="mb-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Scanner
                  </Button>
                </Link>
              </div>
              {children}
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </ProtectedRoute>
  )
}
