"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bus, Calculator, MapPin, Home, Search, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Journey planner and overview",
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
    description: "Find routes and plan trips",
  },
  {
    name: "Bus Stops",
    href: "/stops",
    icon: MapPin,
    description: "Find nearby bus stops",
  },
  {
    name: "Fare Calculator",
    href: "/fare",
    icon: Calculator,
    description: "Calculate journey costs",
  },
  // Added live transit information page to navigation
  {
    name: "Live",
    href: "/live",
    icon: Activity,
    description: "Real-time arrivals and alerts",
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Bus className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-bold text-foreground">KTM Transit</h1>
            </Link>

            <nav className="flex items-center gap-6">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile spacing for bottom nav */}
      <div className="md:hidden h-20" />
    </>
  )
}
