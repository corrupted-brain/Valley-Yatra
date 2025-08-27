import busRoutes from "../data/bus-routes.json"
import busStops from "../data/bus-stops.json"
import routeStops from "../data/route-stops.json"
import fareStructure from "../data/fare-structure.json"
import transferPoints from "../data/transfer-points.json"
import busFleet from "../data/bus-fleet.json"

export interface BusRoute {
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
}

export interface BusStop {
  id: number
  stop_name: string
  stop_code: string
  latitude: number
  longitude: number
  address: string
  landmarks: string
  district: string
  zone: string
  is_major_stop: boolean
  facilities: {
    wheelchair_accessible?: boolean
    shelter?: boolean
    seating?: boolean
    restrooms?: boolean
  }
}

export interface RouteStop {
  route_id: number
  stop_id: number
  stop_sequence: number
  distance_from_start_km: number
  estimated_travel_time_minutes: number
  fare_from_start: number
}

export interface FareStructure {
  route_id: number
  distance_range_start_km: number
  distance_range_end_km: number
  base_fare: number
  student_fare: number
  senior_fare: number
  effective_from: string
}

export interface TransferPoint {
  stop_id: number
  connecting_routes: number[]
  transfer_time_minutes: number
  is_major_hub: boolean
}

export interface Bus {
  id: number
  bus_number: string
  route_id: number
  bus_type: string
  capacity: number
  operator: string
  status: string
}

export class DataService {
  static getBusRoutes(): BusRoute[] {
    return busRoutes
  }

  static getBusStops(): BusStop[] {
    return busStops
  }

  static getRouteStops(): RouteStop[] {
    return routeStops
  }

  static getFareStructure(): FareStructure[] {
    return fareStructure
  }

  static getTransferPoints(): TransferPoint[] {
    return transferPoints
  }

  static getBusFleet(): Bus[] {
    return busFleet.buses
  }

  static getBusesForRoute(routeId: number): Bus[] {
    return busFleet.buses.filter((bus) => bus.route_id === routeId && bus.status === "active")
  }

  static getBusByNumber(busNumber: string): Bus | undefined {
    return busFleet.buses.find((bus) => bus.bus_number === busNumber)
  }

  static getRouteById(id: number): BusRoute | undefined {
    return busRoutes.find((route) => route.id === id)
  }

  static getStopById(id: number): BusStop | undefined {
    return busStops.find((stop) => stop.id === id)
  }

  static getStopsForRoute(routeId: number): (BusStop & RouteStop)[] {
    const stops = routeStops
      .filter((rs) => rs.route_id === routeId)
      .sort((a, b) => a.stop_sequence - b.stop_sequence)
      .map((rs) => {
        const stop = busStops.find((s) => s.id === rs.stop_id)
        return stop ? { ...stop, ...rs } : null
      })
      .filter(Boolean) as (BusStop & RouteStop)[]

    return stops
  }

  static getRoutesForStop(stopId: number): BusRoute[] {
    const routeIds = routeStops.filter((rs) => rs.stop_id === stopId).map((rs) => rs.route_id)

    return busRoutes.filter((route) => routeIds.includes(route.id))
  }

  static searchStops(query: string): BusStop[] {
    const searchTerm = query.toLowerCase()
    return busStops.filter(
      (stop) =>
        stop.stop_name.toLowerCase().includes(searchTerm) ||
        stop.address.toLowerCase().includes(searchTerm) ||
        stop.landmarks.toLowerCase().includes(searchTerm),
    )
  }

  static searchRoutes(query: string): BusRoute[] {
    const searchTerm = query.toLowerCase()
    return busRoutes.filter(
      (route) =>
        route.route_number.toLowerCase().includes(searchTerm) ||
        route.route_name.toLowerCase().includes(searchTerm) ||
        route.start_location.toLowerCase().includes(searchTerm) ||
        route.end_location.toLowerCase().includes(searchTerm),
    )
  }

  static getNearbyStops(lat: number, lng: number, radiusKm = 2): BusStop[] {
    return busStops
      .filter((stop) => {
        const distance = this.calculateDistance(lat, lng, stop.latitude, stop.longitude)
        return distance <= radiusKm
      })
      .sort((a, b) => {
        const distA = this.calculateDistance(lat, lng, a.latitude, a.longitude)
        const distB = this.calculateDistance(lat, lng, b.latitude, b.longitude)
        return distA - distB
      })
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}
