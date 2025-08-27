"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiveArrivals } from "@/components/live-arrivals"
import { ServiceAlerts } from "@/components/service-alerts"
import { SystemStatus } from "@/components/system-status"
import { Activity, MapPin, AlertTriangle } from "lucide-react"

const mockBusStops = [
  { id: 1, name: "Ratna Park", code: "RNP001" },
  { id: 2, name: "New Bus Park", code: "NBP001" },
  { id: 3, name: "Bhaktapur Durbar Square", code: "BDS001" },
  { id: 4, name: "Patan Dhoka", code: "PTD001" },
  { id: 5, name: "Maharajgunj", code: "MRG001" },
  { id: 6, name: "Kirtipur Campus", code: "KTC001" },
]

export default function LivePage() {
  const [selectedStopId, setSelectedStopId] = useState<number>(1)

  const selectedStop = mockBusStops.find((stop) => stop.id === selectedStopId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Live Transit Information</h1>
          <p className="text-muted-foreground">Real-time bus arrivals, service alerts, and system status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stop Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Select Bus Stop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedStopId.toString()}
                  onValueChange={(value) => setSelectedStopId(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bus stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBusStops.map((stop) => (
                      <SelectItem key={stop.id} value={stop.id.toString()}>
                        {stop.name} ({stop.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Live Arrivals */}
            {selectedStop && <LiveArrivals stopId={selectedStop.id} stopName={selectedStop.name} />}

            {/* Service Alerts */}
            <ServiceAlerts maxAlerts={3} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <SystemStatus />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-accent" />
                  Live Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Buses on Route</span>
                  <span className="font-bold text-accent">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Delay</span>
                  <span className="font-bold text-orange-600">3.2 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">On-time Performance</span>
                  <span className="font-bold text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Routes</span>
                  <span className="font-bold text-foreground">5</span>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Features Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-time Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Live bus tracking with GPS</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Accurate arrival predictions</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p>Instant service alerts</p>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p>Bus occupancy levels</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
