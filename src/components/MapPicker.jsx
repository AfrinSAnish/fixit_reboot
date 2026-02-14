import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  value,
  onChange,
  height = 360,
  defaultCenter = [12.9716, 77.5946],
}) {
  const [center, setCenter] = useState(defaultCenter);

  const markerPos = useMemo(() => {
    if (!value) return null;
    return [value.lat, value.lng];
  }, [value]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCenter([lat, lng]);
        onChange({ lat, lng });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (value?.lat && value?.lng) setCenter([value.lat, value.lng]);
  }, [value]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="font-bold text-[#111827]">Pick location</div>
          <div className="text-sm text-gray-500">
            Click on the map to drop a pin. No manual latitude/longitude.
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white font-semibold hover:bg-[#16306E] transition whitespace-nowrap"
        >
          Use My Location
        </button>
      </div>

      <div style={{ height }}>
        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler
            onPick={(lat, lng) => {
              onChange({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
            }}
          />

          {markerPos ? <Marker position={markerPos} /> : null}
        </MapContainer>
      </div>

      <div className="px-5 py-4 border-t border-gray-200 text-sm text-gray-600">
        {value ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold">Selected:</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">Lat {value.lat}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">Lng {value.lng}</span>
            <a
              className="ml-auto text-[#1E3A8A] font-semibold hover:underline"
              href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        ) : (
          <div className="text-gray-500">No location selected yet.</div>
        )}
      </div>
    </div>
  );
}
