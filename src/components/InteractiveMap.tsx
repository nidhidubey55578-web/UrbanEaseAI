import React, { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface InteractiveMapProps {
  start?: [number, number] // [lat, lon]
  end?: [number, number] // [lat, lon]
  routeGeometry?: [number, number][] // Array of [lat, lon]
  alternativeGeometries?: [number, number][][]
  activeStepLocation?: [number, number]
  height?: string
  onRecenter?: () => void
  className?: string
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  start = [18.952, 72.831], // Default Bandra West, Mumbai
  end,
  routeGeometry,
  alternativeGeometries,
  activeStepLocation,
  height = "260px",
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const polylineLayerRef = useRef<L.Polyline | null>(null)
  const altLayersRef = useRef<L.Polyline[]>([])
  const startMarkerRef = useRef<L.Marker | null>(null)
  const endMarkerRef = useRef<L.Marker | null>(null)
  const stepMarkerRef = useRef<L.Marker | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: start,
      zoom: 14,
      zoomControl: false, // We use custom accessible controls
    })

    // Real OpenStreetMap Tile Layer with correct mandatory attribution
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Markers and Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Custom DivIcons for accessible branding without default broken image asset paths
    const startIcon = L.divIcon({
      className: "custom-map-icon start-icon",
      html: `<div style="background:#009F9A;width:18px;height:18px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 0 5px rgba(0,159,154,0.3), 0 4px 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    const endIcon = L.divIcon({
      className: "custom-map-icon end-icon",
      html: `<div style="background:#5846C7;width:22px;height:22px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 0 6px rgba(88,70,199,0.3), 0 4px 12px rgba(0,0,0,0.3);display:grid;place-items:center;color:white;font-weight:bold;font-size:10px;">★</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    })

    const stepIcon = L.divIcon({
      className: "custom-map-icon step-icon",
      html: `<div style="background:#8255D3;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 4px rgba(130,85,211,0.4);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    // Start Marker
    if (startMarkerRef.current) {
      startMarkerRef.current.setLatLng(start)
    } else {
      startMarkerRef.current = L.marker(start, {
        icon: startIcon,
        title: "Start Location",
      }).addTo(map)
      startMarkerRef.current.bindPopup(
        "<b>Current / Starting Point</b><br>Step-free access checked",
      )
    }

    // End Marker
    if (end) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng(end)
      } else {
        endMarkerRef.current = L.marker(end, {
          icon: endIcon,
          title: "Destination",
        }).addTo(map)
        endMarkerRef.current.bindPopup(
          "<b>Destination</b><br>Calculated Arrival Point",
        )
      }
    } else if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current)
      endMarkerRef.current = null
    }

    // Active Step Maneuver Marker
    if (activeStepLocation) {
      if (stepMarkerRef.current) {
        stepMarkerRef.current.setLatLng(activeStepLocation)
      } else {
        stepMarkerRef.current = L.marker(activeStepLocation, {
          icon: stepIcon,
        }).addTo(map)
      }
    } else if (stepMarkerRef.current) {
      map.removeLayer(stepMarkerRef.current)
      stepMarkerRef.current = null
    }

    // Clear previous alternatives
    altLayersRef.current.forEach((layer) => map.removeLayer(layer))
    altLayersRef.current = []

    // Draw Alternatives
    if (alternativeGeometries && alternativeGeometries.length > 0) {
      alternativeGeometries.forEach((altGeom) => {
        if (altGeom.length > 1) {
          const altPoly = L.polyline(altGeom, {
            color: "#8255D3",
            weight: 4,
            opacity: 0.5,
            dashArray: "6, 6",
          }).addTo(map)
          altLayersRef.current.push(altPoly)
        }
      })
    }

    // Draw Main Route Polyline
    if (routeGeometry && routeGeometry.length > 1) {
      if (polylineLayerRef.current) {
        polylineLayerRef.current.setLatLngs(routeGeometry)
      } else {
        polylineLayerRef.current = L.polyline(routeGeometry, {
          color: "#5846C7",
          weight: 6,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map)
      }

      // Fit bounds to display the whole route
      try {
        const bounds = polylineLayerRef.current.getBounds()
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 })
      } catch {
        map.setView(start, 14)
      }
    } else {
      if (polylineLayerRef.current) {
        map.removeLayer(polylineLayerRef.current)
        polylineLayerRef.current = null
      }
      map.setView(start, 14)
    }
  }, [start, end, routeGeometry, alternativeGeometries, activeStepLocation])

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut()
  }

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return
    if (polylineLayerRef.current && routeGeometry && routeGeometry.length > 1) {
      mapInstanceRef.current.fitBounds(polylineLayerRef.current.getBounds(), {
        padding: [35, 35],
      })
    } else {
      mapInstanceRef.current.setView(start, 15)
    }
  }

  return (
    <div
      className={`interactive-map-wrapper ${className}`}
      style={{
        height,
        position: "relative",
        width: "100%",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      <div
        className="map-tools"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 1000,
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "white",
            border: "1px solid #dfe3f0",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "white",
            border: "1px solid #dfe3f0",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          -
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recenter map"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "white",
            border: "1px solid #dfe3f0",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ◎
        </button>
      </div>
    </div>
  )
}
