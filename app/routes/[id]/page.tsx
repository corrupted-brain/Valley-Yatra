"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bus, Clock, MapPin, Users, Navigation, Star } from "lucide-react"
import Link from "next/link"
import RouteMap from "@/components/route-map"
import { DataService } from "@/lib/data-service"
import { useEffect, useState } from "react"

interface Route {
  id: number
  route_number: string
  route_name: string
  start_location: string
  end_location: string
  total_distance_km: number
  estimated_duration_minutes: number
  operating_hours_start: string
  operating_hours_end: string
  frequency_minutes: number
  base_fare: number
  is_active: boolean
  daily_passengers: number
}

interface BusStop {
  id: number
  stop_name: string
  location: string
  latitude: number
  longitude: number
  order_in_route: number
  estimated_time_from_start: number
}

export default function RouteDetailsPage() {
  const params = useParams()
  const routeId = Number.parseInt(params.id as string)
  const [route, setRoute] = useState<Route | null>(null)
  const [stops, setStops] = useState<BusStop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRouteData = async () => {
      try {
        const routes = DataService.getBusRoutes()
        const foundRoute = routes.find((r) => r.id === routeId)

        if (foundRoute) {
          setRoute({
            ...foundRoute,
            base_fare: 25, // Default base fare
            is_active: true,
            daily_passengers: Math.floor(foundRoute.total_distance_km * 150 + foundRoute.frequency_minutes * 50),
          })

          const stopsWithDetails = DataService.getStopsForRoute(routeId)
            .map((stop) => ({
              id: stop.id,
              stop_name: stop.stop_name,
              location: stop.address,
              latitude: stop.latitude,
              longitude: stop.longitude,
              order_in_route: stop.stop_sequence,
              estimated_time_from_start: stop.estimated_travel_time_minutes,
            }))
            .sort((a, b) => a.order_in_route - b.order_in_route)

          setStops(stopsWithDetails)
        }
      } catch (error) {
        console.error("Error loading route data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRouteData()
  }, [routeId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading route details...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Route Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested route could not be found.</p>
          <Link href="/routes">
            <Button>Back to Routes</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getPopularityLevel = (passengers: number): { label: string; color: string } => {
    if (passengers >= 3000) return { label: "Very Popular", color: "bg-red-100 text-red-800 border-red-200" }
    if (passengers >= 2500) return { label: "Popular", color: "bg-orange-100 text-orange-800 border-orange-200" }
    if (passengers >= 2000) return { label: "Moderate", color: "bg-blue-100 text-blue-800 border-blue-200" }
    return { label: "Light", color: "bg-green-100 text-green-800 border-green-200" }
  }

  const popularity = getPopularityLevel(route.daily_passengers)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/routes">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Routes
            </Button>
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant="outline"
                  className="bg-accent/20 text-accent border-accent/30 font-bold text-lg px-3 py-1"
                >
                  {route.route_number}
                </Badge>
                <Badge variant="outline" className={popularity.color}>
                  {popularity.label}
                </Badge>
                {route.is_active && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{route.route_name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {route.start_location} ↔ {route.end_location}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent">Rs. {route.base_fare}</div>
              <div className="text-sm text-muted-foreground">Base Fare</div>
            </div>
          </div>
        </div>

        {/* Route Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{route.total_distance_km}</div>
              <div className="text-sm text-muted-foreground">Total Distance (km)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(route.estimated_duration_minutes)}
              </div>
              <div className="text-sm text-muted-foreground">Journey Time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Bus className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{route.frequency_minutes}m</div>
              <div className="text-sm text-muted-foreground">Frequency</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{(route.daily_passengers / 1000).toFixed(1)}K</div>
              <div className="text-sm text-muted-foreground">Daily Passengers</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Route Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Route Map
              </CardTitle>
              <CardDescription>Visual representation of all stops along this route</CardDescription>
            </CardHeader>
            <CardContent>
              <RouteMap stops={stops} routeName={route.route_name} />
            </CardContent>
          </Card>

          {/* Bus Stops */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Bus Stops ({stops.length})
              </CardTitle>
              <CardDescription>All stops along this route in order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {stop.order_in_route}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{stop.stop_name}</h4>
                      <p className="text-sm text-muted-foreground">{stop.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{stop.estimated_time_from_start}m</div>
                      <div className="text-xs text-muted-foreground">from start</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operating Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Operating Information</CardTitle>
            <CardDescription>Schedule and service details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Operating Hours</h4>
                <p className="text-2xl font-bold text-accent">
                  {route.operating_hours_start} - {route.operating_hours_end}
                </p>
                <p className="text-sm text-muted-foreground">Daily service</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Service Frequency</h4>
                <p className="text-2xl font-bold text-accent">Every {route.frequency_minutes} minutes</p>
                <p className="text-sm text-muted-foreground">During peak hours</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Average Rating</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-5 w-5 text-gray-300" />
                  </div>
                  <span className="text-sm text-muted-foreground">(4.2/5)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <Link
            href={`/search?from=${encodeURIComponent(route.start_location)}&to=${encodeURIComponent(route.end_location)}`}
            className="flex-1"
          >
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Plan Journey on This Route
            </Button>
          </Link>
          <Link href="/live" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Live Arrivals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
