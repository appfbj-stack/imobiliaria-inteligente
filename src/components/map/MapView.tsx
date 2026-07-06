import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  cidade: string;
  label: string;
  color?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: number;
  clusterZoomThreshold?: number;
}

function clusterIcon(count: number, color: string) {
  return L.divIcon({
    html: `<div class="kairos-cluster-pin" style="background:${color};box-shadow:0 0 12px ${color}99">${count}</div>`,
    className: '',
    iconSize: [34, 34],
  });
}

function pinIcon(color: string) {
  return L.divIcon({
    html: `<div class="kairos-marker-pin" style="background:${color}"></div>`,
    className: '',
    iconSize: [14, 14],
  });
}

function ZoomWatcher({ onZoom }: { onZoom: (zoom: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) });
  return null;
}

/**
 * Dark-tiled map with simple city-level clustering: zoomed out shows one
 * pin per city (count badge), zoomed past the threshold shows individual
 * markers. Avoids pulling in a clustering library for ~800 points, which
 * Leaflet's canvas renderer handles fine at this scale.
 */
export function MapView({ markers, center = [-14.235, -51.9253], zoom = 5, height = 480, clusterZoomThreshold = 9 }: MapViewProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const clusters = useMemo(() => {
    const byCity = new Map<string, { lat: number; lng: number; count: number }>();
    markers.forEach((m) => {
      const existing = byCity.get(m.cidade);
      if (existing) {
        existing.count += 1;
        existing.lat = (existing.lat * (existing.count - 1) + m.lat) / existing.count;
        existing.lng = (existing.lng * (existing.count - 1) + m.lng) / existing.count;
      } else {
        byCity.set(m.cidade, { lat: m.lat, lng: m.lng, count: 1 });
      }
    });
    return Array.from(byCity.entries()).map(([cidade, v]) => ({ cidade, ...v }));
  }, [markers]);

  const showClusters = currentZoom < clusterZoomThreshold;

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} preferCanvas>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomWatcher onZoom={setCurrentZoom} />
        {showClusters
          ? clusters.map((c) => (
              <Marker key={c.cidade} position={[c.lat, c.lng]} icon={clusterIcon(c.count, '#00CCFF')}>
                <Popup>
                  <strong>{c.cidade}</strong>
                  <br />
                  {c.count} imóve{c.count === 1 ? 'l' : 'is'}
                </Popup>
              </Marker>
            ))
          : markers.map((m) => (
              <Marker key={m.id} position={[m.lat, m.lng]} icon={pinIcon(m.color ?? '#00CCFF')}>
                <Popup>{m.label}</Popup>
              </Marker>
            ))}
      </MapContainer>
    </div>
  );
}
