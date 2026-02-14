import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

export default function AdminHeatmap() {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [insight, setInsight] = useState("");

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("heatmap").setView([28.6139, 77.2090], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // 🔥 CALL FASTAPI HEATMAP ENDPOINT
    axios.get("http://127.0.0.1:8000/heatmap-data")
      .then(res => {
        const points = res.data;

        if (!points.length) {
          setInsight("No complaints available for heatmap.");
          return;
        }

        const heatData = points.map(p => [
          Number(p.lat),
          Number(p.lng),
          0.8
        ]);

        L.heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 17,
        }).addTo(map);

        setInsight("Heatmap generated successfully.");
      })
      .catch(err => {
        console.error("Error fetching heatmap data:", err);
        setInsight("Error loading complaint data.");
      });

  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "15px",
          padding: "8px 16px",
          borderRadius: "8px",
          backgroundColor: "#222",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: "15px" }}>
        Civic Complaint Heatmap
      </h2>

      <div
        id="heatmap"
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          marginBottom: "20px"
        }}
      ></div>

      <div
        style={{
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          fontWeight: "500"
        }}
      >
        {insight || "Analyzing complaint patterns..."}
      </div>

    </div>
  );
}