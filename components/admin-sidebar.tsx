"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Utensils,
  ClipboardList,
  Ticket,
  LogOut,
  Coffee,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth-service"
import { useRouter } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Employees",
    href: "/admin/employees",
    icon: UserCheck,
  },
  {
    name: "Meal Types",
    href: "/admin/meal-types",
    icon: Utensils,
  },
  {
    name: "Meal Categories",
    href: "/admin/meal-categories",
    icon: Coffee,
  },
  {
    name: "Records",
    href: "/admin/records",
    icon: ClipboardList,
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    name: "Support Reports",
    href: "/admin/support",
    icon: TrendingUp,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-white">Cafeteria Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
