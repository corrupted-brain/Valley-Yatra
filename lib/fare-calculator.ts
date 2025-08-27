interface FareStructure {
  id: number
  route_id: number
  distance_range_start_km: number
  distance_range_end_km: number
  base_fare: number
  student_fare: number
  senior_fare: number
  effective_from: string
  effective_until?: string
  is_active: boolean
}

interface FareBreakdown {
  base_fare: number
  student_fare: number
  senior_fare: number
  distance_km: number
  route_number: string
  route_name: string
}

interface JourneyFareCalculation {
  total_base_fare: number
  total_student_fare: number
  total_senior_fare: number
  segments: FareBreakdown[]
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

export type PassengerType = "regular" | "student" | "senior"

// Mock fare structure data - in real app this would come from database
const mockFareStructures: FareStructure[] = [
  // KTM-01: Ratna Park - Bhaktapur
  {
    id: 1,
    route_id: 1,
    distance_range_start_km: 0.0,
    distance_range_end_km: 5.0,
    base_fare: 15,
    student_fare: 10,
    senior_fare: 12,
    effective_from: "2024-01-01",
    is_active: true,
  },
  {
    id: 2,
    route_id: 1,
    distance_range_start_km: 5.1,
    distance_range_end_km: 15.0,
    base_fare: 20,
    student_fare: 15,
    senior_fare: 18,
    effective_from: "2024-01-01",
    is_active: true,
  },
  {
    id: 3,
    route_id: 1,
    distance_range_start_km: 15.1,
    distance_range_end_km: 25.0,
    base_fare: 25,
    student_fare: 20,
    senior_fare: 22,
    effective_from: "2024-01-01",
    is_active: true,
  },

  // KTM-02: New Bus Park - Patan
  {
    id: 4,
    route_id: 2,
    distance_range_start_km: 0.0,
    distance_range_end_km: 10.0,
    base_fare: 18,
    student_fare: 12,
    senior_fare: 15,
    effective_from: "2024-01-01",
    is_active: true,
  },

  // KTM-03: Maharajgunj - Kirtipur
  {
    id: 5,
    route_id: 3,
    distance_range_start_km: 0.0,
    distance_range_end_km: 15.0,
    base_fare: 22,
    student_fare: 16,
    senior_fare: 19,
    effective_from: "2024-01-01",
    is_active: true,
  },

  // KTM-04: Balaju - Sankhamul
  {
    id: 6,
    route_id: 4,
    distance_range_start_km: 0.0,
    distance_range_end_km: 8.0,
    base_fare: 16,
    student_fare: 11,
    senior_fare: 14,
    effective_from: "2024-01-01",
    is_active: true,
  },
  {
    id: 7,
    route_id: 4,
    distance_range_start_km: 8.1,
    distance_range_end_km: 20.0,
    base_fare: 28,
    student_fare: 20,
    senior_fare: 25,
    effective_from: "2024-01-01",
    is_active: true,
  },

  // KTM-05: Kalanki - Koteshwor
  {
    id: 8,
    route_id: 5,
    distance_range_start_km: 0.0,
    distance_range_end_km: 10.0,
    base_fare: 20,
    student_fare: 14,
    senior_fare: 17,
    effective_from: "2024-01-01",
    is_active: true,
  },
  {
    id: 9,
    route_id: 5,
    distance_range_start_km: 10.1,
    distance_range_end_km: 25.0,
    base_fare: 35,
    student_fare: 25,
    senior_fare: 30,
    effective_from: "2024-01-01",
    is_active: true,
  },
]

export class FareCalculator {
  private fareStructures: FareStructure[]

  constructor() {
    this.fareStructures = mockFareStructures
  }

  /**
   * Calculate fare for a single route segment
   */
  calculateSegmentFare(routeId: number, distanceKm: number, routeNumber: string, routeName: string): FareBreakdown {
    const applicableFares = this.fareStructures.filter(
      (fs) =>
        fs.route_id === routeId &&
        fs.is_active &&
        distanceKm >= fs.distance_range_start_km &&
        distanceKm <= fs.distance_range_end_km,
    )

    if (applicableFares.length === 0) {
      // Fallback fare calculation based on distance
      const baseFarePerKm = 2.5
      const calculatedFare = Math.max(10, Math.ceil(distanceKm * baseFarePerKm))

      return {
        base_fare: calculatedFare,
        student_fare: Math.ceil(calculatedFare * 0.7),
        senior_fare: Math.ceil(calculatedFare * 0.85),
        distance_km: distanceKm,
        route_number: routeNumber,
        route_name: routeName,
      }
    }

    const fareStructure = applicableFares[0]

    return {
      base_fare: fareStructure.base_fare,
      student_fare: fareStructure.student_fare,
      senior_fare: fareStructure.senior_fare,
      distance_km: distanceKm,
      route_number: routeNumber,
      route_name: routeName,
    }
  }

  /**
   * Calculate total fare for a complete journey with multiple segments
   */
  calculateJourneyFare(
    segments: Array<{
      route_id: number
      route_number: string
      route_name: string
      distance_km: number
    }>,
  ): JourneyFareCalculation {
    const fareBreakdowns: FareBreakdown[] = []
    let totalBaseFare = 0
    let totalStudentFare = 0
    let totalSeniorFare = 0

    // Calculate fare for each segment
    for (const segment of segments) {
      const segmentFare = this.calculateSegmentFare(
        segment.route_id,
        segment.distance_km,
        segment.route_number,
        segment.route_name,
      )

      fareBreakdowns.push(segmentFare)
      totalBaseFare += segmentFare.base_fare
      totalStudentFare += segmentFare.student_fare
      totalSeniorFare += segmentFare.senior_fare
    }

    // Calculate savings
    const studentSavings = totalBaseFare - totalStudentFare
    const seniorSavings = totalBaseFare - totalSeniorFare
    const studentPercentage = totalBaseFare > 0 ? Math.round((studentSavings / totalBaseFare) * 100) : 0
    const seniorPercentage = totalBaseFare > 0 ? Math.round((seniorSavings / totalBaseFare) * 100) : 0

    // Generate fare zones information
    const fareZones = this.generateFareZones(segments)

    return {
      total_base_fare: totalBaseFare,
      total_student_fare: totalStudentFare,
      total_senior_fare: totalSeniorFare,
      segments: fareBreakdowns,
      savings: {
        student_savings: studentSavings,
        senior_savings: seniorSavings,
        student_percentage: studentPercentage,
        senior_percentage: seniorPercentage,
      },
      fare_zones: fareZones,
    }
  }

  /**
   * Get fare for specific passenger type
   */
  getFareForPassengerType(fareCalculation: JourneyFareCalculation, passengerType: PassengerType): number {
    switch (passengerType) {
      case "student":
        return fareCalculation.total_student_fare
      case "senior":
        return fareCalculation.total_senior_fare
      case "regular":
      default:
        return fareCalculation.total_base_fare
    }
  }

  /**
   * Compare fares between different journey options
   */
  compareFares(
    journeyOptions: Array<{
      id: string
      segments: Array<{
        route_id: number
        route_number: string
        route_name: string
        distance_km: number
      }>
    }>,
  ): Array<{
    journey_id: string
    fare_calculation: JourneyFareCalculation
    is_cheapest: boolean
    savings_vs_most_expensive: number
  }> {
    const fareComparisons = journeyOptions.map((option) => ({
      journey_id: option.id,
      fare_calculation: this.calculateJourneyFare(option.segments),
      is_cheapest: false,
      savings_vs_most_expensive: 0,
    }))

    // Find cheapest and most expensive
    const baseFares = fareComparisons.map((fc) => fc.fare_calculation.total_base_fare)
    const minFare = Math.min(...baseFares)
    const maxFare = Math.max(...baseFares)

    // Mark cheapest and calculate savings
    fareComparisons.forEach((comparison) => {
      comparison.is_cheapest = comparison.fare_calculation.total_base_fare === minFare
      comparison.savings_vs_most_expensive = maxFare - comparison.fare_calculation.total_base_fare
    })

    return fareComparisons
  }

  /**
   * Get fare structure for a specific route
   */
  getRouteFareStructure(routeId: number): FareStructure[] {
    return this.fareStructures
      .filter((fs) => fs.route_id === routeId && fs.is_active)
      .sort((a, b) => a.distance_range_start_km - b.distance_range_start_km)
  }

  /**
   * Calculate fare based on distance for any route (fallback method)
   */
  calculateDistanceBasedFare(distanceKm: number): { base: number; student: number; senior: number } {
    let baseFare: number

    if (distanceKm <= 5) {
      baseFare = 15
    } else if (distanceKm <= 10) {
      baseFare = 20
    } else if (distanceKm <= 15) {
      baseFare = 25
    } else if (distanceKm <= 20) {
      baseFare = 30
    } else {
      baseFare = 35
    }

    return {
      base: baseFare,
      student: Math.ceil(baseFare * 0.7),
      senior: Math.ceil(baseFare * 0.85),
    }
  }

  /**
   * Generate fare zones information for display
   */
  private generateFareZones(segments: Array<{ distance_km: number }>): Array<{
    zone_name: string
    distance_range: string
    base_fare: number
  }> {
    const totalDistance = segments.reduce((sum, segment) => sum + segment.distance_km, 0)

    const zones = []

    if (totalDistance <= 5) {
      zones.push({ zone_name: "Zone 1", distance_range: "0-5 km", base_fare: 15 })
    } else if (totalDistance <= 10) {
      zones.push({ zone_name: "Zone 1", distance_range: "0-5 km", base_fare: 15 })
      zones.push({ zone_name: "Zone 2", distance_range: "5-10 km", base_fare: 20 })
    } else if (totalDistance <= 15) {
      zones.push({ zone_name: "Zone 1", distance_range: "0-5 km", base_fare: 15 })
      zones.push({ zone_name: "Zone 2", distance_range: "5-10 km", base_fare: 20 })
      zones.push({ zone_name: "Zone 3", distance_range: "10-15 km", base_fare: 25 })
    } else {
      zones.push({ zone_name: "Zone 1", distance_range: "0-5 km", base_fare: 15 })
      zones.push({ zone_name: "Zone 2", distance_range: "5-10 km", base_fare: 20 })
      zones.push({ zone_name: "Zone 3", distance_range: "10-15 km", base_fare: 25 })
      zones.push({ zone_name: "Zone 4", distance_range: "15+ km", base_fare: 30 })
    }

    return zones
  }

  /**
   * Get discount information
   */
  getDiscountInfo(): Array<{
    passenger_type: PassengerType
    discount_percentage: number
    description: string
    requirements: string[]
  }> {
    return [
      {
        passenger_type: "student",
        discount_percentage: 30,
        description: "Student Discount",
        requirements: [
          "Valid student ID card",
          "Currently enrolled in educational institution",
          "Age limit: Under 25 years",
        ],
      },
      {
        passenger_type: "senior",
        discount_percentage: 15,
        description: "Senior Citizen Discount",
        requirements: [
          "Age 60 years and above",
          "Valid citizenship certificate or senior citizen card",
          "Applicable on all routes",
        ],
      },
    ]
  }
}

// Export singleton instance
export const fareCalculator = new FareCalculator()
