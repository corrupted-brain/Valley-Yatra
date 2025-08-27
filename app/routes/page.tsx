import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bus, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { DataService } from "@/lib/data-service"

export default function RoutesPage() {
  const routes = DataService.getBusRoutes()

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getBaseFare = (routeId: number): number => {
    const fareStructure = DataService.getFareStructure()
    const routeFare = fareStructure.find((fs) => fs.route_id === routeId)
    return routeFare?.base_fare || 20
  }

  const estimateDailyPassengers = (route: any): number => {
    const basePassengers = 1500
    const distanceMultiplier = Math.min(route.total_distance_km / 10, 2)
    const frequencyMultiplier = Math.max(30 / route.frequency_minutes, 0.5)
    return Math.round(basePassengers * distanceMultiplier * frequencyMultiplier)
  }

  const getPopularityLevel = (passengers: number): { label: string; color: string } => {
    if (passengers >= 3000) return { label: "Very Popular", color: "bg-red-100 text-red-800 border-red-200" }
    if (passengers >= 2500) return { label: "Popular", color: "bg-orange-100 text-orange-800 border-orange-200" }
    if (passengers >= 2000) return { label: "Moderate", color: "bg-blue-100 text-blue-800 border-blue-200" }
    return { label: "Light", color: "bg-green-100 text-green-800 border-green-200" }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bus Routes</h1>
          <p className="text-muted-foreground">Complete list of bus routes operating in Kathmandu Valley</p>
        </div>

        {/* Route Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Bus className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{routes.length}</div>
              <div className="text-sm text-muted-foreground">Active Routes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {routes.reduce((sum, route) => sum + route.total_distance_km, 0).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total KM</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {(routes.reduce((sum, route) => sum + estimateDailyPassengers(route), 0) / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-muted-foreground">Daily Passengers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {Math.round(routes.reduce((sum, route) => sum + route.frequency_minutes, 0) / routes.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Frequency (min)</div>
            </CardContent>
          </Card>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {routes.map((route) => {
            const dailyPassengers = estimateDailyPassengers(route)
            const popularity = getPopularityLevel(dailyPassengers)
            const baseFare = getBaseFare(route.id)

            return (
              <Card key={route.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 font-bold">
                          {route.route_number}
                        </Badge>
                        <Badge variant="outline" className={popularity.color}>
                          {popularity.label}
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{route.route_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {route.start_location} ↔ {route.end_location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">Rs. {baseFare}</div>
                      <div className="text-xs text-muted-foreground">Base Fare</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/30 rounded">
                      <div className="text-sm text-muted-foreground">Distance</div>
                      <div className="font-semibold">{route.total_distance_km} km</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold">{formatDuration(route.estimated_duration_minutes)}</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded">
                      <div className="text-sm text-muted-foreground">Frequency</div>
                      <div className="font-semibold">Every {route.frequency_minutes}m</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded">
                      <div className="text-sm text-muted-foreground">Operating Hours</div>
                      <div className="font-semibold text-xs">
                        {route.operating_hours_start} - {route.operating_hours_end}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2">
                    <Link href={`/routes/${route.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Route Map
                      </Button>
                    </Link>
                    <Link href={`/routes/${route.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Stops
                      </Button>
                    </Link>
                    <Link
                      href={`/search?from=${encodeURIComponent(route.start_location)}&to=${encodeURIComponent(route.end_location)}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        Plan Journey
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
