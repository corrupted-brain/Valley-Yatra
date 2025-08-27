"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LocationSearch } from "./location-search"
import { routePlanningEngine } from "@/lib/route-planning-engine"
import { DataService } from "@/lib/data-service"
import { Navigation, ArrowUpDown, MapPin, Clock, DollarSign, ArrowRight, Eraser as Transfer, Bus } from "lucide-react"

interface BusStop {
  id: number
  stop_name: string
  stop_code: string
  latitude: number
  longitude: number
  address: string
  landmarks: string
  district: string
  is_major_stop: boolean
}

interface JourneyOption {
  id: string
  segments: Array<{
    route: {
      id: number
      route_number: string
      route_name: string
      frequency_minutes: number
    }
    from_stop: BusStop
    to_stop: BusStop
    duration_minutes: number
    fare: number
  }>
  total_duration_minutes: number
  total_fare: number
  transfer_count: number
  transfer_points: BusStop[]
  route_complexity: "direct" | "simple" | "complex"
  recommended_score: number
}

export function JourneyPlanner() {
  const [fromLocation, setFromLocation] = useState<BusStop | null>(null)
  const [toLocation, setToLocation] = useState<BusStop | null>(null)
  const [journeyOptions, setJourneyOptions] = useState<JourneyOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const swapLocations = () => {
    const temp = fromLocation
    setFromLocation(toLocation)
    setToLocation(temp)
  }

  const searchRoutes = async () => {
    if (!fromLocation || !toLocation) {
      alert("Please select both starting point and destination")
      return
    }

    if (fromLocation.id === toLocation.id) {
      alert("Starting point and destination cannot be the same")
      return
    }

    setIsSearching(true)
    setJourneyOptions([])

    try {
      const options = await routePlanningEngine.findJourneyOptions(fromLocation, toLocation)
      setJourneyOptions(options)
    } catch (error) {
      console.error("Error finding routes:", error)
      alert("Unable to find routes. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case "direct":
        return "bg-green-100 text-green-800 border-green-200"
      case "simple":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "complex":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getComplexityLabel = (complexity: string): string => {
    switch (complexity) {
      case "direct":
        return "Direct"
      case "simple":
        return "Simple"
      case "complex":
        return "Complex"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-accent" />
            Plan Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From</label>
              <LocationSearch
                placeholder="Enter starting location"
                onLocationSelect={setFromLocation}
                value={fromLocation?.stop_name || ""}
              />
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={swapLocations}
                className="rounded-full"
                title="Swap locations"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To</label>
              <LocationSearch
                placeholder="Enter destination"
                onLocationSelect={setToLocation}
                value={toLocation?.stop_name || ""}
              />
            </div>
          </div>

          <Button
            onClick={searchRoutes}
            disabled={isSearching || !fromLocation || !toLocation}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSearching ? "Finding Best Routes..." : "Find Routes"}
          </Button>
        </CardContent>
      </Card>

      {journeyOptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Journey Options</h3>
            <span className="text-sm text-muted-foreground">{journeyOptions.length} routes found</span>
          </div>

          {journeyOptions.map((option, index) => (
            <Card
              key={option.id}
              className={`border-l-4 transition-all cursor-pointer ${
                selectedOption === option.id
                  ? "border-l-accent bg-accent/5"
                  : index === 0
                    ? "border-l-green-500"
                    : "border-l-muted"
              }`}
              onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Recommended
                      </Badge>
                    )}
                    <Badge variant="outline" className={getComplexityColor(option.route_complexity)}>
                      {getComplexityLabel(option.route_complexity)}
                    </Badge>
                    {option.transfer_count > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Transfer className="h-3 w-3 mr-1" />
                        {option.transfer_count} transfer{option.transfer_count > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(option.total_duration_minutes)}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                      <DollarSign /*className="h-3 w-3"*/ />
                      Rs. {option.total_fare}
                    </div>
                  </div>
                </div>

                {/* Route segments overview */}
                <div className="flex items-center gap-2 mb-3 text-sm">
                  {option.segments.map((segment, segmentIndex) => (
                    <div key={segmentIndex} className="flex items-center gap-2">
                      <span className="font-medium text-accent">{segment.route.route_number}</span>
                      {segmentIndex < option.segments.length - 1 && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Transfer className="h-3 w-3 text-blue-600" />
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Detailed segments (shown when selected) */}
                {selectedOption === option.id && (
                  <div className="space-y-3 pt-3 border-t">
                    {option.segments.map((segment, segmentIndex) => {
                      const availableBuses = DataService.getBusesForRoute(segment.route.id)

                      return (
                        <div key={segmentIndex} className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-accent">{segment.route.route_number}</span>
                                <span className="text-xs text-muted-foreground">
                                  Every {segment.route.frequency_minutes} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{segment.from_stop.stop_name}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{segment.to_stop.stop_name}</span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              {formatDuration(segment.duration_minutes)} • Rs. {segment.fare}
                            </div>
                          </div>

                          {/* Available buses display */}
                          {availableBuses.length > 0 && (
                            <div className="pl-3 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <Bus className="h-3 w-3" />
                                Available Buses ({availableBuses.length})
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {availableBuses.slice(0, 3).map((bus) => (
                                  <Badge
                                    key={bus.id}
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {bus.bus_number}
                                    {bus.bus_type === "AC" && " (AC)"}
                                    {bus.bus_type === "Deluxe" && " (Deluxe)"}
                                  </Badge>
                                ))}
                                {availableBuses.length > 3 && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    +{availableBuses.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Operators: {[...new Set(availableBuses.map((bus) => bus.operator))].join(", ")}
                              </div>
                            </div>
                          )}

                          {/* Transfer information */}
                          {segmentIndex < option.segments.length - 1 && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 pl-3">
                              <Transfer className="h-3 w-3" />
                              <span>Transfer at {option.transfer_points[segmentIndex]?.stop_name}</span>
                              <span className="text-muted-foreground">(~5 min walk)</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Future: Navigate to detailed route view
                  }}
                >
                  {selectedOption === option.id ? "Hide Details" : "View Details"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding the best routes for your journey...</p>
          </CardContent>
        </Card>
      )}

      {!isSearching && journeyOptions.length === 0 && fromLocation && toLocation && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No routes found</p>
            <p className="text-sm">
              We couldn't find any direct or connecting routes between {fromLocation.stop_name} and{" "}
              {toLocation.stop_name}.
            </p>
            <p className="text-xs mt-2">Try selecting different locations or check back later for updated routes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
