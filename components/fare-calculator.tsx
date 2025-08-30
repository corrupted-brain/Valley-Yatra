"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationSearch } from "./location-search"
import { fareCalculator, type PassengerType } from "@/lib/fare-calculator"
import { routePlanningEngine } from "@/lib/route-planning-engine"
import { Calculator, DollarSign, Users, Percent, Info, MapPin, ArrowRight } from "lucide-react"

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

interface FareCalculation {
  total_base_fare: number
  total_student_fare: number
  total_senior_fare: number
  segments: Array<{
    base_fare: number
    student_fare: number
    senior_fare: number
    distance_km: number
    route_number: string
    route_name: string
  }>
  savings: {
    student_savings: number
    senior_savings: number
    student_percentage: number
    senior_percentage: number
  }
  fare_zones: Array<{
    zone_name: string
    distance_range: string
    base_fare: number
  }>
}

export function FareCalculator() {
  const [fromLocation, setFromLocation] = useState<BusStop | null>(null)
  const [toLocation, setToLocation] = useState<BusStop | null>(null)
  const [passengerType, setPassengerType] = useState<PassengerType>("regular")
  const [fareCalculation, setFareCalculation] = useState<FareCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDiscountInfo, setShowDiscountInfo] = useState(false)

  const calculateFare = async () => {
    if (!fromLocation || !toLocation) {
      alert("Please select both starting point and destination")
      return
    }

    if (fromLocation.id === toLocation.id) {
      alert("Starting point and destination cannot be the same")
      return
    }

    setIsCalculating(true)

    try {
      // Get journey options from route planning engine
      const journeyOptions = await routePlanningEngine.findJourneyOptions(fromLocation, toLocation)

      if (journeyOptions.length === 0) {
        alert("No routes found between selected locations")
        return
      }

      // Use the best (first) journey option for fare calculation
      const bestJourney = journeyOptions[0]
      const segments = bestJourney.segments.map((segment) => ({
        route_id: segment.route.id,
        route_number: segment.route.route_number,
        route_name: segment.route.route_name,
        distance_km: segment.distance_km,
      }))

      const calculation = fareCalculator.calculateJourneyFare(segments)
      setFareCalculation(calculation)
    } catch (error) {
      console.error("Error calculating fare:", error)
      alert("Unable to calculate fare. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  const getCurrentFare = (): number => {
    if (!fareCalculation) return 0
    return fareCalculator.getFareForPassengerType(fareCalculation, passengerType)
  }

  const getSavingsAmount = (): number => {
    if (!fareCalculation) return 0
    return fareCalculation.total_base_fare - getCurrentFare()
  }

  const getSavingsPercentage = (): number => {
    if (!fareCalculation || fareCalculation.total_base_fare === 0) return 0
    return Math.round((getSavingsAmount() / fareCalculation.total_base_fare) * 100)
  }

  const getPassengerTypeLabel = (type: PassengerType): string => {
    switch (type) {
      case "student":
        return "Student"
      case "senior":
        return "Senior Citizen"
      case "regular":
        return "Regular"
      default:
        return "Regular"
    }
  }

  const getPassengerTypeColor = (type: PassengerType): string => {
    switch (type) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "senior":
        return "bg-green-100 text-green-800 border-green-200"
      case "regular":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const discountInfo = fareCalculator.getDiscountInfo()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-accent" />
            Fare Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From</label>
              <LocationSearch
                placeholder="Enter starting location"
                onLocationSelect={setFromLocation}
                value={fromLocation?.stop_name || ""}
              />
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Passenger Type</label>
            <Select value={passengerType} onValueChange={(value: PassengerType) => setPassengerType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select passenger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Passenger</SelectItem>
                <SelectItem value="student">Student (30% discount)</SelectItem>
                <SelectItem value="senior">Senior Citizen (15% discount)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculateFare}
            disabled={isCalculating || !fromLocation || !toLocation}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isCalculating ? "Calculating Fare..." : "Calculate Fare"}
          </Button>
        </CardContent>
      </Card>

      {fareCalculation && (
        <div className="space-y-4">
          {/* Main Fare Display */}
          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Rs. {getCurrentFare()}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getPassengerTypeColor(passengerType)}>
                      {getPassengerTypeLabel(passengerType)}
                    </Badge>
                    {getSavingsAmount() > 0 && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <Percent className="h-3 w-3 mr-1" />
                        {getSavingsPercentage()}% off
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Journey</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{fromLocation?.stop_name}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{toLocation?.stop_name}</span>
                  </div>
                </div>
              </div>

              {getSavingsAmount() > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                  
                    <span className="font-medium">You save Rs. {getSavingsAmount()}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Compared to regular fare of Rs. {fareCalculation.total_base_fare}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fare Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fare Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fareCalculation.segments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{segment.route_number}</div>
                    <div className="text-xs text-muted-foreground">{segment.route_name}</div>
                    <div className="text-xs text-muted-foreground">{segment.distance_km.toFixed(1)} km</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      Rs.{" "}
                      {passengerType === "student"
                        ? segment.student_fare
                        : passengerType === "senior"
                          ? segment.senior_fare
                          : segment.base_fare}
                    </div>
                    {passengerType !== "regular" && (
                      <div className="text-xs text-muted-foreground line-through">Rs. {segment.base_fare}</div>
                    )}
                  </div>
                </div>
              ))}

              {fareCalculation.segments.length > 1 && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Fare</span>
                    <span>Rs. {getCurrentFare()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Fare Types Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fare Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded">
                  <div className="text-sm text-muted-foreground">Regular</div>
                  <div className="text-lg font-bold">Rs. {fareCalculation.total_base_fare}</div>
                </div>
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm text-blue-600">Student</div>
                  <div className="text-lg font-bold text-blue-800">Rs. {fareCalculation.total_student_fare}</div>
                  <div className="text-xs text-blue-600">Save Rs. {fareCalculation.savings.student_savings}</div>
                </div>
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm text-green-600">Senior</div>
                  <div className="text-lg font-bold text-green-800">Rs. {fareCalculation.total_senior_fare}</div>
                  <div className="text-xs text-green-600">Save Rs. {fareCalculation.savings.senior_savings}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fare Zones */}
          {fareCalculation.fare_zones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fare Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fareCalculation.fare_zones.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div>
                        <span className="font-medium text-sm">{zone.zone_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{zone.distance_range}</span>
                      </div>
                      <span className="text-sm font-medium">Rs. {zone.base_fare}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Discount Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-accent" />
              Discount Information
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDiscountInfo(!showDiscountInfo)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {showDiscountInfo && (
          <CardContent className="space-y-4">
            {discountInfo.map((info, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getPassengerTypeColor(info.passenger_type)}>
                    {info.description}
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {info.discount_percentage}% OFF
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {info.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-start gap-1">
                        <span className="text-accent">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {isCalculating && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Calculating your fare...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
