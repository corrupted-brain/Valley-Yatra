"use client"

import { useEffect, useRef } from "react"

interface BusStop {
  id: number
  stop_name: string
  location: string
  latitude: number
  longitude: number
  order_in_route: number
  estimated_time_from_start: number
}

interface RouteMapProps {
  stops: BusStop[]
  routeName: string
}

export default function RouteMap({ stops, routeName }: RouteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || stops.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Calculate bounds
    const lats = stops.map((s) => s.latitude)
    const lngs = stops.map((s) => s.longitude)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Add padding
    const padding = 40
    const mapWidth = rect.width - padding * 2
    const mapHeight = rect.height - padding * 2

    // Convert lat/lng to canvas coordinates
    const latToY = (lat: number) => {
      return padding + ((maxLat - lat) / (maxLat - minLat)) * mapHeight
    }

    const lngToX = (lng: number) => {
      return padding + ((lng - minLng) / (maxLng - minLng)) * mapWidth
    }

    // Draw route line
    if (stops.length > 1) {
      ctx.strokeStyle = "#dc2626"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()

      stops.forEach((stop, index) => {
        const x = lngToX(stop.longitude)
        const y = latToY(stop.latitude)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    // Draw stops
    stops.forEach((stop, index) => {
      const x = lngToX(stop.longitude)
      const y = latToY(stop.latitude)

      // Draw stop circle
      ctx.fillStyle = index === 0 || index === stops.length - 1 ? "#dc2626" : "#3b82f6"
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fill()

      // Draw white border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw stop number
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(stop.order_in_route.toString(), x, y)

      // Draw stop name
      ctx.fillStyle = "#1f2937"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(stop.stop_name, x, y + 15)
    })

    // Draw legend
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(10, 10, 200, 80)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, 200, 80)

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Route Map", 20, 30)

    ctx.font = "12px sans-serif"
    ctx.fillText(`${stops.length} stops`, 20, 50)
    ctx.fillText(`${routeName}`, 20, 70)
  }, [stops, routeName])

  return (
    <div className="w-full h-96 rounded-lg border bg-muted/30 relative">
      <canvas ref={canvasRef} className="w-full h-full rounded-lg" style={{ width: "100%", height: "100%" }} />
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
        Interactive route visualization
      </div>
    </div>
  )
}
