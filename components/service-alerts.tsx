"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { realTimeService } from "@/lib/real-time-service"
import { AlertTriangle, Info, Construction, Cloud, Car, X } from "lucide-react"

interface ServiceAlert {
  id: string
  type: "delay" | "disruption" | "maintenance" | "weather" | "accident"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  affected_routes: string[]
  affected_stops: string[]
  start_time: string
  end_time?: string
  is_active: boolean
}

interface ServiceAlertsProps {
  routeNumbers?: string[]
  maxAlerts?: number
}

export function ServiceAlerts({ routeNumbers, maxAlerts = 5 }: ServiceAlertsProps) {
  const [alerts, setAlerts] = useState<ServiceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      const serviceAlerts = await realTimeService.getServiceAlerts(routeNumbers)
      setAlerts(serviceAlerts.slice(0, maxAlerts))
    } catch (error) {
      console.error("Error loading service alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    // Refresh alerts every 2 minutes
    const interval = setInterval(loadAlerts, 120000)
    return () => clearInterval(interval)
  }, [routeNumbers, maxAlerts])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "delay":
        return <AlertTriangle className="h-4 w-4" />
      case "disruption":
        return <AlertTriangle className="h-4 w-4" />
      case "maintenance":
        return <Construction className="h-4 w-4" />
      case "weather":
        return <Cloud className="h-4 w-4" />
      case "accident":
        return <Car className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAlertColor = (type: string, severity: string): string => {
    if (severity === "critical") return "border-l-red-500 bg-red-50"
    if (severity === "high") return "border-l-orange-500 bg-orange-50"
    if (severity === "medium") return "border-l-yellow-500 bg-yellow-50"
    return "border-l-blue-500 bg-blue-50"
  }

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]))
  }

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id))

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading service alerts...</p>
        </CardContent>
      </Card>
    )
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-green-600" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">
              <Info className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm font-medium text-green-800">All services running normally</p>
            <p className="text-xs text-muted-foreground mt-1">No active alerts or disruptions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Service Alerts ({visibleAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleAlerts.map((alert) => (
          <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.type, alert.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getAlertIcon(alert.type)}
                  <span className="font-medium text-sm">{alert.title}</span>
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

                <div className="space-y-2">
                  {alert.affected_routes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Affected Routes:</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.affected_routes.map((route) => (
                          <Badge key={route} variant="outline" className="text-xs">
                            {route}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.affected_stops.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Affected Stops:</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.affected_stops.slice(0, 3).map((stop) => (
                          <Badge key={stop} variant="outline" className="text-xs">
                            {stop}
                          </Badge>
                        ))}
                        {alert.affected_stops.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{alert.affected_stops.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Started: {formatTime(alert.start_time)}</span>
                    {alert.end_time && <span>Expected end: {formatTime(alert.end_time)}</span>}
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)} className="ml-2 h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">Alerts update automatically every 2 minutes</p>
        </div>
      </CardContent>
    </Card>
  )
}
