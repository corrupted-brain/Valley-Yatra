import { JourneyTestDemo } from "@/components/journey-test-demo"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">System Integration Test</h1>
          <p className="text-lg text-muted-foreground">
            Verify that all components of the Kathmandu Valley transport app work together seamlessly.
          </p>
        </div>

        <JourneyTestDemo />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Database Schema</h3>
            <p className="text-sm text-muted-foreground">7 tables with comprehensive route, stop, and fare data</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">API Endpoints</h3>
            <p className="text-sm text-muted-foreground">Location search, route planning, and real-time data</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">User Interface</h3>
            <p className="text-sm text-muted-foreground">Responsive design with mobile-first navigation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
