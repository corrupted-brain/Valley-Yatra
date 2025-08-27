import { FareCalculator } from "@/components/fare-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, DollarSign, Users, Info } from "lucide-react"

export default function FarePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Fare Calculator</h1>
          <p className="text-muted-foreground">
            Calculate accurate fares for your journey with student and senior citizen discounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FareCalculator />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-accent" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calculator className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Fares are calculated based on distance and route complexity</p>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Students get 30% discount, seniors get 15% discount</p>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Multiple routes? We show the most cost-effective option</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fare Zones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Zone 1 (0-5 km)</span>
                  <span className="font-medium">Rs. 15</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone 2 (5-10 km)</span>
                  <span className="font-medium">Rs. 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone 3 (10-15 km)</span>
                  <span className="font-medium">Rs. 25</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone 4 (15+ km)</span>
                  <span className="font-medium">Rs. 30+</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Cash payment to conductor</p>
                <p>• Digital payment (coming soon)</p>
                <p>• Monthly passes available</p>
                <p>• Student/Senior ID required for discounts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
