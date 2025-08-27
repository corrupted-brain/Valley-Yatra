"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Loader2 } from "lucide-react"

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

interface LocationSearchProps {
  placeholder: string
  onLocationSelect: (location: BusStop | null) => void
  value?: string
}

export function LocationSearch({ placeholder, onLocationSelect, value = "" }: LocationSearchProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<BusStop[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration - in real app this would come from API
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
    },
  ]

  useEffect(() => {
    if (query.length > 1) {
      setIsLoading(true)
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filtered = mockBusStops.filter(
          (stop) =>
            stop.stop_name.toLowerCase().includes(query.toLowerCase()) ||
            stop.address.toLowerCase().includes(query.toLowerCase()) ||
            stop.landmarks.toLowerCase().includes(query.toLowerCase()) ||
            stop.district.toLowerCase().includes(query.toLowerCase()),
        )
        setSuggestions(filtered)
        setShowSuggestions(true)
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setIsLoading(false)
    }
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocationSelect = (stop: BusStop) => {
    setQuery(stop.stop_name)
    setShowSuggestions(false)
    onLocationSelect(stop)
  }

  const handleSuggestionClick = (stop: BusStop, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    handleLocationSelect(stop)
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // Find nearest bus stop (simplified calculation)
        const nearest = mockBusStops.reduce((prev, current) => {
          const prevDistance = Math.sqrt(
            Math.pow(prev.latitude - latitude, 2) + Math.pow(prev.longitude - longitude, 2),
          )
          const currentDistance = Math.sqrt(
            Math.pow(current.latitude - latitude, 2) + Math.pow(current.longitude - longitude, 2),
          )
          return prevDistance < currentDistance ? prev : current
        })

        setQuery(`Near ${nearest.stop_name}`)
        onLocationSelect(nearest)
        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please enter manually.")
        setIsGettingLocation(false)
      },
    )
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            className="pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          title="Use current location"
        >
          {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card ref={suggestionsRef} className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((stop) => (
              <button
                key={stop.id}
                className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                onMouseDown={(e) => handleSuggestionClick(stop, e)}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{stop.stop_name}</span>
                      {stop.is_major_stop && (
                        <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Major Stop</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{stop.address}</p>
                    {stop.landmarks && <p className="text-xs text-muted-foreground">{stop.landmarks}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{stop.district}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {showSuggestions && suggestions.length === 0 && query.length > 1 && !isLoading && (
        <Card ref={suggestionsRef} className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-4 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No locations found for "{query}"</p>
            <p className="text-xs mt-1">Try searching for bus stops, landmarks, or areas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
