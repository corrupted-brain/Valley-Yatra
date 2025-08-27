import { DataService, type BusRoute, type BusStop, type RouteStop, type TransferPoint } from "./data-service"

interface RouteSegment {
  route: BusRoute
  from_stop: BusStop
  to_stop: BusStop
  from_sequence: number
  to_sequence: number
  duration_minutes: number
  distance_km: number
  fare: number
}

interface JourneyOption {
  id: string
  segments: RouteSegment[]
  total_duration_minutes: number
  total_fare: number
  total_distance_km: number
  transfer_count: number
  transfer_points: BusStop[]
  route_complexity: "direct" | "simple" | "complex"
  recommended_score: number
}

export class RoutePlanningEngine {
  private routes: BusRoute[]
  private stops: BusStop[]
  private routeStops: RouteStop[]
  private transferPoints: TransferPoint[]

  constructor() {
    this.routes = DataService.getBusRoutes()
    this.stops = DataService.getBusStops()
    this.routeStops = DataService.getRouteStops()
    this.transferPoints = DataService.getTransferPoints()
  }

  /**
   * Find all possible journey options between two stops
   */
  async findJourneyOptions(fromStop: BusStop, toStop: BusStop): Promise<JourneyOption[]> {
    const journeyOptions: JourneyOption[] = []

    // 1. Find direct routes
    const directRoutes = this.findDirectRoutes(fromStop, toStop)
    journeyOptions.push(...directRoutes)

    // 2. Find routes with one transfer
    const oneTransferRoutes = this.findOneTransferRoutes(fromStop, toStop)
    journeyOptions.push(...oneTransferRoutes)

    // 3. Find routes with two transfers (for complex journeys)
    const twoTransferRoutes = this.findTwoTransferRoutes(fromStop, toStop)
    journeyOptions.push(...twoTransferRoutes)

    // 4. Rank and sort options
    const rankedOptions = this.rankJourneyOptions(journeyOptions)

    // 5. Return top 5 options
    return rankedOptions.slice(0, 5)
  }

  /**
   * Find direct routes between two stops
   */
  private findDirectRoutes(fromStop: BusStop, toStop: BusStop): JourneyOption[] {
    const directOptions: JourneyOption[] = []

    for (const route of this.routes) {
      const fromRouteStop = this.routeStops.find((rs) => rs.route_id === route.id && rs.stop_id === fromStop.id)
      const toRouteStop = this.routeStops.find((rs) => rs.route_id === route.id && rs.stop_id === toStop.id)

      if (fromRouteStop && toRouteStop && fromRouteStop.stop_sequence < toRouteStop.stop_sequence) {
        const segment: RouteSegment = {
          route,
          from_stop: fromStop,
          to_stop: toStop,
          from_sequence: fromRouteStop.stop_sequence,
          to_sequence: toRouteStop.stop_sequence,
          duration_minutes: toRouteStop.estimated_travel_time_minutes - fromRouteStop.estimated_travel_time_minutes,
          distance_km: toRouteStop.distance_from_start_km - fromRouteStop.distance_from_start_km,
          fare: toRouteStop.fare_from_start - fromRouteStop.fare_from_start,
        }

        const journeyOption: JourneyOption = {
          id: `direct-${route.id}-${fromStop.id}-${toStop.id}`,
          segments: [segment],
          total_duration_minutes: segment.duration_minutes + route.frequency_minutes / 2, // Add average wait time
          total_fare: segment.fare,
          total_distance_km: segment.distance_km,
          transfer_count: 0,
          transfer_points: [],
          route_complexity: "direct",
          recommended_score: 0, // Will be calculated later
        }

        directOptions.push(journeyOption)
      }
    }

    return directOptions
  }

  /**
   * Find routes with one transfer
   */
  private findOneTransferRoutes(fromStop: BusStop, toStop: BusStop): JourneyOption[] {
    const oneTransferOptions: JourneyOption[] = []

    // Find all possible transfer points
    for (const transferPoint of this.transferPoints) {
      const transferStop = this.stops.find((s) => s.id === transferPoint.stop_id)
      if (!transferStop) continue

      // Find route from origin to transfer point
      const firstSegments = this.findDirectRoutes(fromStop, transferStop)

      // Find route from transfer point to destination
      const secondSegments = this.findDirectRoutes(transferStop, toStop)

      // Combine segments that use different routes
      for (const firstSegment of firstSegments) {
        for (const secondSegment of secondSegments) {
          if (firstSegment.segments[0].route.id !== secondSegment.segments[0].route.id) {
            const journeyOption: JourneyOption = {
              id: `transfer-${firstSegment.segments[0].route.id}-${secondSegment.segments[0].route.id}-${fromStop.id}-${toStop.id}`,
              segments: [...firstSegment.segments, ...secondSegment.segments],
              total_duration_minutes:
                firstSegment.total_duration_minutes +
                secondSegment.total_duration_minutes +
                transferPoint.transfer_time_minutes,
              total_fare: firstSegment.total_fare + secondSegment.total_fare,
              total_distance_km: firstSegment.total_distance_km + secondSegment.total_distance_km,
              transfer_count: 1,
              transfer_points: [transferStop],
              route_complexity: "simple",
              recommended_score: 0,
            }

            oneTransferOptions.push(journeyOption)
          }
        }
      }
    }

    return oneTransferOptions
  }

  /**
   * Find routes with two transfers (for complex journeys)
   */
  private findTwoTransferRoutes(fromStop: BusStop, toStop: BusStop): JourneyOption[] {
    const twoTransferOptions: JourneyOption[] = []

    // For simplicity, we'll limit this to major hubs only
    const majorHubs = this.transferPoints.filter((tp) => tp.is_major_hub)

    for (let i = 0; i < majorHubs.length; i++) {
      for (let j = i + 1; j < majorHubs.length; j++) {
        const firstTransfer = this.stops.find((s) => s.id === majorHubs[i].stop_id)
        const secondTransfer = this.stops.find((s) => s.id === majorHubs[j].stop_id)

        if (!firstTransfer || !secondTransfer) continue

        // Find: Origin -> First Transfer -> Second Transfer -> Destination
        const firstLeg = this.findDirectRoutes(fromStop, firstTransfer)
        const secondLeg = this.findDirectRoutes(firstTransfer, secondTransfer)
        const thirdLeg = this.findDirectRoutes(secondTransfer, toStop)

        for (const first of firstLeg) {
          for (const second of secondLeg) {
            for (const third of thirdLeg) {
              // Ensure all segments use different routes
              const routeIds = [first.segments[0].route.id, second.segments[0].route.id, third.segments[0].route.id]

              if (new Set(routeIds).size === 3) {
                const journeyOption: JourneyOption = {
                  id: `complex-${routeIds.join("-")}-${fromStop.id}-${toStop.id}`,
                  segments: [...first.segments, ...second.segments, ...third.segments],
                  total_duration_minutes:
                    first.total_duration_minutes +
                    second.total_duration_minutes +
                    third.total_duration_minutes +
                    majorHubs[i].transfer_time_minutes +
                    majorHubs[j].transfer_time_minutes,
                  total_fare: first.total_fare + second.total_fare + third.total_fare,
                  total_distance_km: first.total_distance_km + second.total_distance_km + third.total_distance_km,
                  transfer_count: 2,
                  transfer_points: [firstTransfer, secondTransfer],
                  route_complexity: "complex",
                  recommended_score: 0,
                }

                twoTransferOptions.push(journeyOption)
              }
            }
          }
        }
      }
    }

    return twoTransferOptions
  }

  /**
   * Rank journey options based on multiple criteria
   */
  private rankJourneyOptions(options: JourneyOption[]): JourneyOption[] {
    return options
      .map((option) => {
        let score = 100 // Base score

        // Prefer direct routes
        if (option.route_complexity === "direct") score += 30
        else if (option.route_complexity === "simple") score += 10
        else score -= 20

        // Penalize long duration
        score -= Math.floor(option.total_duration_minutes / 10)

        // Penalize high fare
        score -= Math.floor(option.total_fare / 5)

        // Penalize transfers
        score -= option.transfer_count * 15

        // Bonus for major stops
        const majorStopBonus = option.segments.reduce((bonus, segment) => {
          return bonus + (segment.from_stop.is_major_stop ? 5 : 0) + (segment.to_stop.is_major_stop ? 5 : 0)
        }, 0)
        score += majorStopBonus

        // Bonus for frequent routes
        const frequencyBonus = option.segments.reduce((bonus, segment) => {
          return bonus + Math.max(0, 20 - segment.route.frequency_minutes)
        }, 0)
        score += frequencyBonus

        option.recommended_score = Math.max(0, score)
        return option
      })
      .sort((a, b) => b.recommended_score - a.recommended_score)
  }

  /**
   * Get route details for a specific route number
   */
  getRouteDetails(routeNumber: string): BusRoute | null {
    return this.routes.find((route) => route.route_number === routeNumber) || null
  }

  /**
   * Get all stops for a specific route
   */
  getRouteStops(routeId: number): (BusStop & { sequence: number; fare: number })[] {
    const routeStopData = this.routeStops
      .filter((rs) => rs.route_id === routeId)
      .sort((a, b) => a.stop_sequence - b.stop_sequence)

    return routeStopData
      .map((rs) => {
        const stop = this.stops.find((s) => s.id === rs.stop_id)
        return stop
          ? {
              ...stop,
              sequence: rs.stop_sequence,
              fare: rs.fare_from_start,
            }
          : null
      })
      .filter(Boolean) as (BusStop & { sequence: number; fare: number })[]
  }

  /**
   * Find nearby stops within a radius
   */
  findNearbyStops(latitude: number, longitude: number, radiusKm = 1): BusStop[] {
    return this.stops
      .filter((stop) => {
        const distance = this.calculateDistance(latitude, longitude, stop.latitude, stop.longitude)
        return distance <= radiusKm
      })
      .sort((a, b) => {
        const distanceA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude)
        const distanceB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude)
        return distanceA - distanceB
      })
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

// Export singleton instance
export const routePlanningEngine = new RoutePlanningEngine()
