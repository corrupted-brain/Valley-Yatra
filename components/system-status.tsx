"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { realTimeService } from "@/lib/real-time-service"
import { Activity, Bus, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface SystemStatus {
  total_buses_tracked: number
  active_alerts: number
  system_health: "good" | "degraded" | "poor"
  last_updated: string
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStatus = async () => {
    try {
      const systemStatus = await realTimeService.getSystemStatus()
      setStatus(systemStatus)
    } catch (error) {
      console.error("Error loading system status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()

    // Refresh status every minute
    const interval = setInterval(loadStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (health: string): string => {
    switch (health) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200"
      case "degraded":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "poor":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "poor":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const formatLastUpdated = (): string => {
    if (!status) return ""
    const lastUpdated = new Date(status.last_updated)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000)

    if (diffSeconds < 60) return "Just now"
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    return `${Math.floor(diffSeconds / 3600)}h ago`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading system status...</p>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Unable to load system status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-accent" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">System Health</span>
          <div className="flex items-center gap-2">
            {getHealthIcon(status.system_health)}
            <Badge variant="outline" className={getHealthColor(status.system_health)}>
              {status.system_health.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded">
            <Bus className="h-6 w-6 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{status.total_buses_tracked}</div>
            <div className="text-xs text-muted-foreground">Buses Tracked</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded">
            <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{status.active_alerts}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">Last updated: {formatLastUpdated()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
