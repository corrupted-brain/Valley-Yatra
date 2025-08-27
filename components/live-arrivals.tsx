"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { realTimeService } from "@/lib/real-time-service"
import { Clock, Bus, Users, RefreshCw, Wifi, WifiOff } from "lucide-react"

interface LiveArrival {
  route_number: string
  bus_number: string
  estimated_minutes: number
  delay_minutes: number
  occupancy_level: "low" | "medium" | "high" | "full"
  is_real_time: boolean
}

interface LiveArrivalsProps {
  stopId: number
  stopName: string
}

export function LiveArrivals({ stopId, stopName }: LiveArrivalsProps) {
  const [arrivals, setArrivals] = useState<LiveArrival[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadArrivals = async () => {
    try {
      setIsLoading(true)
      const liveArrivals = await realTimeService.getLiveArrivals(stopId)
      setArrivals(liveArrivals)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading live arrivals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadArrivals()
  }, [stopId])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadArrivals()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, stopId])

  const getOccupancyColor = (level: string): string => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "full":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getOccupancyLabel = (level: string): string => {
    switch (level) {
      case "low":
        return "Seats Available"
      case "medium":
        return "Half Full"
      case "high":
        return "Nearly Full"
      case "full":
        return "Standing Room"
      default:
        return "Unknown"
    }
  }

  const formatLastUpdated = (): string => {
    if (!lastUpdated) return ""
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000)

    if (diffSeconds < 60) return "Just now"
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    return `${Math.floor(diffSeconds / 3600)}h ago`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Live Arrivals - {stopName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "text-green-600" : "text-muted-foreground"}
            >
              {autoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={loadArrivals} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {lastUpdated && <p className="text-xs text-muted-foreground">Last updated: {formatLastUpdated()}</p>}
      </CardHeader>

      <CardContent>
        {isLoading && arrivals.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading live arrivals...</p>
          </div>
        ) : arrivals.length === 0 ? (
          <div className="text-center py-8">
            <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No buses currently tracked for this stop</p>
            <p className="text-xs text-muted-foreground mt-1">Check back in a few minutes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {arrivals.map((arrival, index) => (
              <div
                key={`${arrival.route_number}-${arrival.bus_number}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 font-bold">
                      {arrival.route_number}
                    </Badge>
                    {arrival.is_real_time ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <Wifi className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                        Scheduled
                      </Badge>
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-sm">
                      {arrival.estimated_minutes === 0
                        ? "Arriving now"
                        : arrival.estimated_minutes === 1
                          ? "1 minute"
                          : `${arrival.estimated_minutes} minutes`}
                    </div>
                    <div className="text-xs text-muted-foreground">Bus {arrival.bus_number}</div>
                    {arrival.delay_minutes > 0 && (
                      <div className="text-xs text-orange-600">+{arrival.delay_minutes}m delay</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="outline" className={`${getOccupancyColor(arrival.occupancy_level)} text-xs`}>
                    <Users className="h-3 w-3 mr-1" />
                    {getOccupancyLabel(arrival.occupancy_level)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Auto-refresh: {autoRefresh ? "On" : "Off"}</span>
            <span>Updates every 30 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
