"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UtensilsCrossed,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react"
import { logout, getCurrentUser } from "@/lib/auth-service"
import type { User } from "@/lib/types"

export default function AdminSidebar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true
    }
    if (path !== "/admin" && pathname.startsWith(path)) {
      return true
    }
    return false
  }

  const menuItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
      href: "/admin",
      role: "manager",
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Meal Records",
      href: "/admin/records",
      role: "manager",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Employees",
      href: "/admin/employees",
      role: "manager",
    },
    {
      icon: <UtensilsCrossed className="h-4 w-4" />,
      label: "Meal Types",
      href: "/admin/meal-types",
      role: "manager",
    },
    {
      icon: <Ticket className="h-4 w-4" />,
      label: "Coupons",
      href: "/admin/coupons",
      role: "manager",
    },
    {
      icon: <UserCog className="h-4 w-4" />,
      label: "User Management",
      href: "/admin/users",
      role: "admin",
    },
  ]

  const hasAccess = (requiredRole: string) => {
    if (!currentUser) return false
    const roleHierarchy = { admin: 3, manager: 2, operator: 1 }
    const userLevel = roleHierarchy[currentUser.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
    return userLevel >= requiredLevel
  }

  return (
    <Sidebar collapsible={collapsed ? "icon" : "none"}>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/images/ministry-logo.png"
                  alt="Ministry of Education Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Cafeteria</h2>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(
            (item) =>
              hasAccess(item.role) && (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={collapsed ? item.label : undefined}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && currentUser && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium">{currentUser.fullName}</p>
            <p className="text-xs text-muted-foreground">{currentUser.role}</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
