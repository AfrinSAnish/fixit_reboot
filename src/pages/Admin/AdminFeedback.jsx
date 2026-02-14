import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563EB", "#f6993b", "#b04fec", "#93C5FD", "#ccde29"];

export default function AdminFeedback() {
  const [stats, setStats] = useState(null);
  const [aiInsight, setAiInsight] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/api/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats error:", err));

    axios.get("http://127.0.0.1:8000/api/ai-suggestion")
      .then(res => setAiInsight(res.data.suggestion))
      .catch(err => console.error("AI error:", err));
  }, []);

  if (!stats)
    return (
      <div style={{ padding: "40px", fontSize: "20px", fontWeight: "600" }}>
        Loading analytics...
      </div>
    );

  return (
    <div style={{ padding: "40px" }}>

      {/* MAIN HEADING */}
      <h2
        style={{
          fontSize: "36px",
          fontWeight: "800",
          color: "#1E40AF",
          marginBottom: "40px",
        }}
      >
        Admin Feedback & Analytics
      </h2>

      {/* KPI CARDS */}
      <div style={{ display: "flex", gap: "25px", marginBottom: "50px", flexWrap: "wrap" }}>
        {stats.priority_summary.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "25px",
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              borderRadius: "16px",
              minWidth: "180px",
              textAlign: "center",
              color: "white",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)"
            }}
          >
            <h3 style={{ fontSize: "34px", fontWeight: "700" }}>
              {item.count}
            </h3>
            <p style={{ marginTop: "8px", fontSize: "16px", opacity: 0.9 }}>
              {item.priority} Priority
            </p>
          </div>
        ))}
      </div>

      {/* STATUS PIE CHART */}
      <div style={{ height: "400px", marginBottom: "60px" }}>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1E3A8A",
            marginBottom: "20px"
          }}
        >
          Status Distribution
        </h3>

        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={stats.status_distribution}
              dataKey="count"
              nameKey="status"
              outerRadius={120}
              label
            >
              {stats.status_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* DEPARTMENT BAR CHART */}
      <div style={{ height: "400px", marginBottom: "60px" }}>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1E3A8A",
            marginBottom: "20px"
          }}
        >
          Department Complaint Volume
        </h3>

        <ResponsiveContainer>
          <BarChart data={stats.department_volume}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI INSIGHT BOX */}
      <div
        style={{
          padding: "25px",
          background: "linear-gradient(135deg, #DBEAFE, #EFF6FF)",
          borderRadius: "16px",
          fontWeight: "600",
          fontSize: "16px",
          color: "#1E3A8A",
          boxShadow: "0 6px 18px rgba(37, 99, 235, 0.15)"
        }}
      >
        🤖 AI Insight: {aiInsight || "Analyzing trends..."}
      </div>

    </div>
  );
}