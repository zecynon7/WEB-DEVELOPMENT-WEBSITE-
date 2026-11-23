import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const pin = L.divIcon({
  className: "",
  html: '<span class="map-pin" style="display:block;width:22px;height:22px;background:#e2c3a3"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/** Click the map (or drag the pin) to set a branch's location. */
export default function MapPicker({ lat, lng, onChange }) {
  const el = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!el.current) return;
    const has = lat != null && lng != null;
    const m = L.map(el.current).setView(has ? [lat, lng] : [14.35, 120.9], has ? 15 : 10);
    map.current = m;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(m);
    const place = (la, ln) => {
      if (!marker.current) {
        marker.current = L.marker([la, ln], { icon: pin, draggable: true }).addTo(m);
        marker.current.on("dragend", () => {
          const p = marker.current.getLatLng();
          cb.current(+p.lat.toFixed(6), +p.lng.toFixed(6));
        });
      } else marker.current.setLatLng([la, ln]);
    };
    if (has) place(lat, lng);
    m.on("click", (e) => {
      place(e.latlng.lat, e.latlng.lng);
      cb.current(+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6));
    });
    setTimeout(() => m.invalidateSize(), 150);
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // typing coordinates moves the pin
  useEffect(() => {
    if (!map.current || lat == null || lng == null) return;
    if (!marker.current) {
      marker.current = L.marker([lat, lng], { icon: pin, draggable: true }).addTo(map.current);
      marker.current.on("dragend", () => {
        const p = marker.current.getLatLng();
        cb.current(+p.lat.toFixed(6), +p.lng.toFixed(6));
      });
    } else marker.current.setLatLng([lat, lng]);
    map.current.setView([lat, lng], Math.max(map.current.getZoom(), 14));
  }, [lat, lng]);

  return <div ref={el} className="adm-map" />;
}
