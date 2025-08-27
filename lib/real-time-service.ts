interface BusTracking {
  id: number
  route_id: number
  route_number: string
  bus_number: string
  current_stop_id: number
  current_stop_name: string
  next_stop_id: number
  next_stop_name: string
  estimated_arrival_time: string
  delay_minutes: number
  occupancy_level: "low" | "medium" | "high" | "full"
  last_updated: string
}

interface ServiceAlert {
  id: string
  type: "delay" | "disruption" | "maintenance" | "weather" | "accident"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  affected_routes: string[]
  affected_stops: string[]
  start_time: string
  end_time?: string
  is_active: boolean
}

interface LiveArrival {
  route_number: string
  bus_number: string
  estimated_minutes: number
  delay_minutes: number
  occupancy_level: "low" | "medium" | "high" | "full"
  is_real_time: boolean
}

// Mock real-time data - in production this would come from GPS tracking systems
const mockBusTracking: BusTracking[] = [
  {
    id: 1,
    route_id: 1,
    route_number: "KTM-01",
    bus_number: "BA-1-PA-1234",
    current_stop_id: 1,
    current_stop_name: "Ratna Park",
    next_stop_id: 3,
    next_stop_name: "Bhaktapur Durbar Square",
    estimated_arrival_time: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    delay_minutes: 3,
    occupancy_level: "medium",
    last_updated: new Date().toISOString(),
  },
  {
    id: 2,
    route_id: 2,
    route_number: "KTM-02",
    bus_number: "BA-1-PA-5678",
    current_stop_id: 2,
    current_stop_name: "New Bus Park",
    next_stop_id: 4,
    next_stop_name: "Patan Dhoka",
    estimated_arrival_time: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    delay_minutes: 0,
    occupancy_level: "high",
    last_updated: new Date().toISOString(),
  },
  {
    id: 3,
    route_id: 3,
    route_number: "KTM-03",
    bus_number: "BA-1-PA-9012",
    current_stop_id: 5,
    current_stop_name: "Maharajgunj",
    next_stop_id: 6,
    next_stop_name: "Kirtipur Campus",
    estimated_arrival_time: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    delay_minutes: 5,
    occupancy_level: "low",
    last_updated: new Date().toISOString(),
  },
]

const mockServiceAlerts: ServiceAlert[] = [
  {
    id: "alert-001",
    type: "delay",
    severity: "medium",
    title: "Traffic Congestion on Ring Road",
    description: "Heavy traffic causing 10-15 minute delays on routes passing through Ring Road area.",
    affected_routes: ["KTM-04", "KTM-05"],
    affected_stops: ["Kalanki", "Koteshwor"],
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    id: "alert-002",
    type: "maintenance",
    severity: "low",
    title: "Bus Stop Maintenance",
    description: "Temporary shelter maintenance at Ratna Park. All services operating normally.",
    affected_routes: ["KTM-01", "KTM-04", "KTM-05"],
    affected_stops: ["Ratna Park"],
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
]

export class RealTimeService {
  private busTracking: BusTracking[]
  private serviceAlerts: ServiceAlert[]
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.busTracking = mockBusTracking
    this.serviceAlerts = mockServiceAlerts
  }

  /**
   * Get live arrivals for a specific bus stop
   */
  async getLiveArrivals(stopId: number): Promise<LiveArrival[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const arrivals: LiveArrival[] = []

    // Find buses heading to this stop
    this.busTracking.forEach((tracking) => {
      if (tracking.next_stop_id === stopId) {
        const estimatedMinutes = Math.max(
          1,
          Math.floor((new Date(tracking.estimated_arrival_time).getTime() - Date.now()) / (1000 * 60)),
        )

        arrivals.push({
          route_number: tracking.route_number,
          bus_number: tracking.bus_number,
          estimated_minutes: estimatedMinutes,
          delay_minutes: tracking.delay_minutes,
          occupancy_level: tracking.occupancy_level,
          is_real_time: true,
        })
      }
    })

    // Add some scheduled arrivals for demonstration
    const scheduledArrivals: LiveArrival[] = [
      {
        route_number: "KTM-01",
        bus_number: "BA-1-PA-2468",
        estimated_minutes: 25,
        delay_minutes: 0,
        occupancy_level: "low",
        is_real_time: false,
      },
      {
        route_number: "KTM-02",
        bus_number: "BA-1-PA-1357",
        estimated_minutes: 32,
        delay_minutes: 2,
        occupancy_level: "medium",
        is_real_time: false,
      },
    ]

    return [...arrivals, ...scheduledArrivals].sort((a, b) => a.estimated_minutes - b.estimated_minutes)
  }

  /**
   * Get current service alerts
   */
  async getServiceAlerts(routeNumbers?: string[]): Promise<ServiceAlert[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let alerts = this.serviceAlerts.filter((alert) => alert.is_active)

    if (routeNumbers && routeNumbers.length > 0) {
      alerts = alerts.filter((alert) => alert.affected_routes.some((route) => routeNumbers.includes(route)))
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  /**
   * Get bus tracking information for a specific route
   */
  async getBusTracking(routeNumber: string): Promise<BusTracking[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return this.busTracking.filter((tracking) => tracking.route_number === routeNumber)
  }

  /**
   * Get occupancy level for a specific bus
   */
  async getBusOccupancy(busNumber: string): Promise<{
    occupancy_level: "low" | "medium" | "high" | "full"
    percentage: number
    last_updated: string
  } | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const tracking = this.busTracking.find((t) => t.bus_number === busNumber)
    if (!tracking) return null

    const occupancyPercentages = {
      low: 25,
      medium: 55,
      high: 80,
      full: 95,
    }

    return {
      occupancy_level: tracking.occupancy_level,
      percentage: occupancyPercentages[tracking.occupancy_level],
      last_updated: tracking.last_updated,
    }
  }

  /**
   * Start real-time updates (simulated)
   */
  startRealTimeUpdates(callback: (data: { busTracking: BusTracking[]; alerts: ServiceAlert[] }) => void): void {
    this.updateInterval = setInterval(() => {
      // Simulate bus movement and updates
      this.busTracking = this.busTracking.map((tracking) => ({
        ...tracking,
        delay_minutes: Math.max(0, tracking.delay_minutes + (Math.random() > 0.7 ? 1 : -1)),
        occupancy_level: this.getRandomOccupancyLevel(),
        last_updated: new Date().toISOString(),
      }))

      callback({
        busTracking: this.busTracking,
        alerts: this.serviceAlerts,
      })
    }, 30000) // Update every 30 seconds
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    total_buses_tracked: number
    active_alerts: number
    system_health: "good" | "degraded" | "poor"
    last_updated: string
  }> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const activeAlerts = this.serviceAlerts.filter((alert) => alert.is_active).length
    const criticalAlerts = this.serviceAlerts.filter((alert) => alert.is_active && alert.severity === "critical").length

    let systemHealth: "good" | "degraded" | "poor" = "good"
    if (criticalAlerts > 0) systemHealth = "poor"
    else if (activeAlerts > 2) systemHealth = "degraded"

    return {
      total_buses_tracked: this.busTracking.length,
      active_alerts: activeAlerts,
      system_health: systemHealth,
      last_updated: new Date().toISOString(),
    }
  }

  private getRandomOccupancyLevel(): "low" | "medium" | "high" | "full" {
    const levels: ("low" | "medium" | "high" | "full")[] = ["low", "medium", "high", "full"]
    return levels[Math.floor(Math.random() * levels.length)]
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService()
