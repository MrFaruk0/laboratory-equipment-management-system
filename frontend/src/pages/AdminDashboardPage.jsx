import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAdminStats } from "../services/adminService";

const statusColors = {
  available:   { bg: "#dcfce7", text: "#15803d" },
  in_use:      { bg: "#dbeafe", text: "#1d4ed8" },
  maintenance: { bg: "#fef9c3", text: "#a16207" },
  faulty:      { bg: "#fee2e2", text: "#b91c1c" },
};

const roleLabels = { students: "Students", assistants: "Assistants", technicians: "Technicians", admins: "Admins" };
const roleColors = { students: "#3b82f6", assistants: "#8b5cf6", technicians: "#f59e0b", admins: "#ef4444" };

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      minWidth: "160px",
      flex: "1",
    }}>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      <p style={{ fontSize: "40px", fontWeight: "800", color: color || "#111827", margin: "0 0 4px" }}>{value ?? "—"}</p>
      {sub && <p style={{ fontSize: "12px", color: "#9ca3af" }}>{sub}</p>}
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <MainLayout>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "6px" }}>Admin Dashboard</h1>
        <p style={{ color: "#6b7280" }}>System overview at a glance.</p>
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: "20px" }}>{error}</p>}

      {!stats && !error && (
        <p style={{ color: "#9ca3af" }}>Loading stats...</p>
      )}

      {stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Equipment */}
          <section>
            <h2 style={sectionTitle}>Equipment</h2>
            <div style={cardRow}>
              <StatCard label="Total" value={stats.equipment.total} color="#111827" />
              {Object.entries(statusColors).map(([key, c]) => (
                <StatCard
                  key={key}
                  label={key.replace("_", " ")}
                  value={stats.equipment[key] ?? 0}
                  color={c.text}
                />
              ))}
            </div>

            {/* Status bar */}
            <div style={{ display: "flex", height: "10px", borderRadius: "999px", overflow: "hidden", marginTop: "16px" }}>
              {Object.entries(statusColors).map(([key, c]) => {
                const pct = stats.equipment.total > 0
                  ? ((stats.equipment[key] ?? 0) / stats.equipment.total) * 100
                  : 0;
                return <div key={key} style={{ width: `${pct}%`, background: c.text, transition: "width 0.4s" }} title={key} />;
              })}
            </div>
          </section>

          {/* Reservations */}
          <section>
            <h2 style={sectionTitle}>Reservations</h2>
            <div style={cardRow}>
              <StatCard label="Total" value={stats.reservations.total} color="#111827" />
              <StatCard label="Active" value={stats.reservations.active} color="#1d4ed8" />
              <StatCard label="Completed" value={stats.reservations.completed} color="#15803d" />
              <StatCard label="Cancelled" value={stats.reservations.cancelled} color="#b91c1c" />
            </div>
          </section>

          {/* Users */}
          <section>
            <h2 style={sectionTitle}>Users</h2>
            <div style={cardRow}>
              <StatCard label="Total" value={stats.users.total} color="#111827" sub={`across ${stats.labs.total} lab(s)`} />
              {Object.entries(roleLabels).map(([key, label]) => (
                <StatCard key={key} label={label} value={stats.users[key] ?? 0} color={roleColors[key]} />
              ))}
            </div>
          </section>

        </div>
      )}
    </MainLayout>
  );
}

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#374151",
  marginBottom: "16px",
  paddingBottom: "8px",
  borderBottom: "1px solid #f3f4f6",
};

const cardRow = {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap",
};

export default AdminDashboardPage;
