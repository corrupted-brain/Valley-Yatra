import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Calculator, Clock, ArrowRight } from "lucide-react"
import { JourneyPlanner } from "@/components/journey-planner"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Navigate Kathmandu Valley with Confidence
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find bus routes, calculate fares, and plan your journey across the valley. Making public transport
            accessible for everyone.
          </p>

          <div className="max-w-2xl mx-auto">
            <JourneyPlanner />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 md:py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8 md:mb-12">
            Everything You Need for Your Journey
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/stops">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <MapPin className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Find Bus Stops</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Locate the nearest bus stops with detailed information about routes and facilities.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/search">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Navigation className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Route Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get complete journey plans with transfers and estimated travel times.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/fare">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Calculator className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Fare Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Calculate accurate fares for your journey including student and senior discounts.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/live">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Real-time Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Live bus arrivals, service alerts, and real-time tracking information.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">Popular Routes</h3>
            <Link href="/routes">
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 bg-transparent">
                View All Routes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KTM-01: Ratna Park ↔ Bhaktapur</CardTitle>
                <CardDescription>15.5 km • 45 min • Every 15 min</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Fare: Rs. 25</span>
                  <Link href="/routes/1">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KTM-02: New Bus Park ↔ Patan</CardTitle>
                <CardDescription>8.2 km • 25 min • Every 10 min</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Fare: Rs. 18</span>
                  <Link href="/routes/2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KTM-03: Maharajgunj ↔ Kirtipur</CardTitle>
                <CardDescription>12.3 km • 35 min • Every 20 min</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Fare: Rs. 22</span>
                  <Link href="/routes/3">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KTM-04: Balaju ↔ Sankhamul</CardTitle>
                <CardDescription>18.7 km • 50 min • Every 12 min</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Fare: Rs. 28</span>
                  <Link href="/routes/4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link href="/routes">
              <Button variant="outline" className="w-full bg-transparent">
                View All Routes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
