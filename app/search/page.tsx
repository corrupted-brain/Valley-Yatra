import { JourneyPlanner } from "@/components/journey-planner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Search } from "lucide-react"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Routes & Stops</h1>
          <p className="text-muted-foreground">Find the best routes for your journey across Kathmandu Valley</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <JourneyPlanner />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-accent" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Search by bus stop names, landmarks, or area names</p>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Use the location button to find stops near you</p>
                </div>
                <div className="flex items-start gap-2">
                  <Search className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Try searching for "Ratna Park", "Bhaktapur", or "Patan"</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Destinations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Ratna Park",
                  "New Bus Park",
                  "Bhaktapur Durbar Square",
                  "Patan Dhoka",
                  "Maharajgunj",
                  "Kirtipur Campus",
                ].map((destination) => (
                  <button
                    key={destination}
                    className="w-full text-left p-2 hover:bg-muted/50 rounded text-sm transition-colors"
                  >
                    {destination}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
