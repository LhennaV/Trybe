"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { MeetupSpot } from "@/shared/contracts/trades";

// The meetup map (MEET-03): Leaflet with OpenStreetMap tiles. Browser only,
// so MeetupForm loads it with next/dynamic and ssr: false. Like photos, the
// tiles don't change with the theme; the pins use our tokens.

type MeetupMapProps = {
  spots: MeetupSpot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// Pins are plain HTML so they can use Tailwind tokens. The selected one is
// filled plum and bigger; the others are white with a plum ring.
function pinIcon(selected: boolean) {
  const size = selected ? 34 : 26;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: selected
      ? `<span class="flex size-full items-center justify-center rounded-chip border-[3px] border-surface-white bg-brand-plum shadow-dropdown"><span class="size-2.5 rounded-chip bg-surface-white"></span></span>`
      : `<span class="flex size-full items-center justify-center rounded-chip border-[2.5px] border-brand-plum bg-surface-white shadow-dropdown"><span class="size-2 rounded-chip bg-brand-plum"></span></span>`,
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Pans to the picked spot only when it's off screen, so the first view keeps
// every spot in sight. Reduced motion jumps instead of panning.
function FollowSelected({ spot }: { spot: MeetupSpot | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!spot || map.getBounds().contains([spot.lat, spot.lng])) return;
    map.panTo([spot.lat, spot.lng], { animate: !prefersReducedMotion() });
  }, [map, spot]);
  return null;
}

export default function MeetupMap({ spots, selectedId, onSelect }: MeetupMapProps) {
  const selected = spots.find((spot) => spot.id === selectedId);
  const icons = useMemo(() => ({ on: pinIcon(true), off: pinIcon(false) }), []);
  const bounds = useMemo(() => L.latLngBounds(spots.map((spot) => [spot.lat, spot.lng])), [spots]);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [32, 32], maxZoom: 15 }}
      // Scrolling the page shouldn't zoom the map, and one finger on a phone
      // should scroll the page, not drag the map. Pinch and the +/− still work.
      scrollWheelZoom={false}
      dragging={!L.Browser.mobile}
      className="h-full w-full"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={spot.id === selectedId ? icons.on : icons.off}
          title={spot.name}
          alt={spot.name}
          zIndexOffset={spot.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(spot.id) }}
        />
      ))}
      <FollowSelected spot={selected} />
    </MapContainer>
  );
}
