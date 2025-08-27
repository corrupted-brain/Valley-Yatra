"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Search, Filter, Bus, Accessibility } from "lucide-react"

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
  facilities: {
    wheelchair_accessible?: boolean
    shelter?: boolean
    seating?: boolean
    restrooms?: boolean
  }
  routes: string[]
}

const mockBusStops: BusStop[] = [
  {
    id: 1,
    stop_name: "Ratna Park",
    stop_code: "RNP001",
    latitude: 27.7172,
    longitude: 85.324,
    address: "Ratna Park, Kathmandu",
    landmarks: "Near Ratna Park, City Center",
    district: "Kathmandu",
    is_major_stop: true,
    facilities: { wheelchair_accessible: true, shelter: true, seating: true },
    routes: ["KTM-01", "KTM-04", "KTM-05"],
  },
  {
    id: 2,
    stop_name: "New Bus Park",
    stop_code: "NBP001",
    latitude: 27.7,
    longitude: 85.3,
    address: "New Bus Park, Gongabu",
    landmarks: "Main Bus Terminal",
    district: "Kathmandu",
    is_major_stop: true,
    facilities: { wheelchair_accessible: true, shelter: true, seating: true, restrooms: true },
    routes: ["KTM-02"],
  },
  {
    id: 3,
    stop_name: "Bhaktapur Durbar Square",
    stop_code: "BDS001",
    latitude: 27.671,
    longitude: 85.4298,
    address: "Durbar Square, Bhaktapur",
    landmarks: "Historic Durbar Square",
    district: "Bhaktapur",
    is_major_stop: true,
    facilities: { wheelchair_accessible: false, shelter: true, seating: true },
    routes: ["KTM-01"],
  },
  {
    id: 4,
    stop_name: "Patan Dhoka",
    stop_code: "PTD001",
    latitude: 27.6766,
    longitude: 85.325,
    address: "Patan Dhoka, Lalitpur",
    landmarks: "Patan Museum Area",
    district: "Lalitpur",
    is_major_stop: true,
    facilities: { wheelchair_accessible: true, shelter: true, seating: false },
    routes: ["KTM-02"],
  },
  {
    id: 5,
    stop_name: "Maharajgunj",
    stop_code: "MRG001",
    latitude: 27.7394,
    longitude: 85.3347,
    address: "Maharajgunj, Kathmandu",
    landmarks: "Near TU Teaching Hospital",
    district: "Kathmandu",
    is_major_stop: true,
    facilities: { wheelchair_accessible: true, shelter: true, seating: true },
    routes: ["KTM-03"],
  },
  {
    id: 6,
    stop_name: "Kirtipur Campus",
    stop_code: "KTC001",
    latitude: 27.678,
    longitude: 85.28,
    address: "Tribhuvan University, Kirtipur",
    landmarks: "TU Central Campus",
    district: "Kathmandu",
    is_major_stop: true,
    facilities: { wheelchair_accessible: true, shelter: true, seating: true },
    routes: ["KTM-03"],
  },
]

export default function BusStopsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [showMajorOnly, setShowMajorOnly] = useState(false)

  const districts = ["all", ...Array.from(new Set(mockBusStops.map((stop) => stop.district)))]

  const filteredStops = mockBusStops.filter((stop) => {
    const matchesSearch =
      stop.stop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.landmarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.stop_code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDistrict = selectedDistrict === "all" || stop.district === selectedDistrict
    const matchesMajor = !showMajorOnly || stop.is_major_stop

    return matchesSearch && matchesDistrict && matchesMajor
  })

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, this would find nearby stops based on coordinates
        alert(`Location found: ${position.coords.latitude}, ${position.coords.longitude}`)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please search manually.")
      },
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bus Stops</h1>
          <p className="text-muted-foreground">
            Find bus stops across Kathmandu Valley with route and facility information
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by stop name, address, or landmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district === "all" ? "All Districts" : district}
                    </option>
                  ))}
                </select>

                <Button
                  variant={showMajorOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMajorOnly(!showMajorOnly)}
                  className="whitespace-nowrap"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Major Stops
                </Button>

                <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Near Me
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStops.length} of {mockBusStops.length} bus stops
          </p>
        </div>

        {/* Bus Stops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStops.map((stop) => (
            <Card key={stop.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      {stop.stop_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {stop.stop_code}
                      </Badge>
                      {stop.is_major_stop && (
                        <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-xs">
                          Major Stop
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stop.address}</p>
                  {stop.landmarks && <p className="text-xs text-muted-foreground mt-1">{stop.landmarks}</p>}
                </div>

                {/* Routes */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Routes</p>
                  <div className="flex flex-wrap gap-1">
                    {stop.routes.map((route) => (
                      <Badge key={route} variant="outline" className="text-xs">
                        <Bus className="h-3 w-3 mr-1" />
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {stop.facilities.wheelchair_accessible && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Accessibility className="h-3 w-3" />
                        <span>Accessible</span>
                      </div>
                    )}
                    {stop.facilities.shelter && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <div className="h-3 w-3 bg-blue-600 rounded-sm"></div>
                        <span>Shelter</span>
                      </div>
                    )}
                    {stop.facilities.seating && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <div className="h-3 w-3 bg-purple-600 rounded-sm"></div>
                        <span>Seating</span>
                      </div>
                    )}
                    {stop.facilities.restrooms && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <div className="h-3 w-3 bg-orange-600 rounded-sm"></div>
                        <span>Restrooms</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Routes
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStops.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No bus stops found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search criteria or browse all stops</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
