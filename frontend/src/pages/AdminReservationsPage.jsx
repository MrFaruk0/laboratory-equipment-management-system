import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAdminReservations, cancelAdminReservation } from "../services/adminService";

const statusStyle = {
  active:    { bg: "#dbeafe", text: "#1d4ed8" },
  cancelled: { bg: "#fee2e2", text: "#b91c1c" },
  completed: { bg: "#dcfce7", text: "#15803d" },
};

function StatusBadge({ status }) {
  const s = statusStyle[status] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "12px", fontWeight: "700",
    }}>
      {status}
    </span>
  );
}

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const reload = async () => {
    try {
      const data = await getAdminReservations();
      setReservations(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await cancelAdminReservation(id);
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      r.userFullName?.toLowerCase().includes(q) ||
      r.username?.toLowerCase().includes(q) ||
      r.equipment?.toLowerCase().includes(q) ||
      r.code?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>All Reservations</h1>
        <p style={{ color: "#6b7280" }}>View and cancel any reservation across all users.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by user, equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: "180px" }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>}
      {loading && <p style={{ color: "#9ca3af" }}>Loading...</p>}

      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["User", "Equipment", "Location", "Start", "End", "Status", "Actions"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>No reservations found.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600" }}>{r.userFullName}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>@{r.username}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600" }}>{r.equipment}</div>
                    <code style={{ fontSize: "11px", background: "#f3f4f6", padding: "1px 5px", borderRadius: "4px" }}>{r.code}</code>
                  </td>
                  <td style={{ ...tdStyle, fontSize: "13px", color: "#6b7280" }}>{r.location}</td>
                  <td style={{ ...tdStyle, fontSize: "13px" }}>{fmt(r.startTime)}</td>
                  <td style={{ ...tdStyle, fontSize: "13px" }}>{fmt(r.endTime)}</td>
                  <td style={tdStyle}><StatusBadge status={r.status} /></td>
                  <td style={tdStyle}>
                    {r.status === "active" ? (
                      <button onClick={() => handleCancel(r.id)} style={cancelBtn}>
                        Cancel
                      </button>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: "12px", fontSize: "13px", color: "#9ca3af" }}>
        Showing {filtered.length} of {reservations.length} reservations
      </p>
    </MainLayout>
  );
}

const inputStyle = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", minWidth: "240px" };
const cancelBtn = { padding: "6px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" };

export default AdminReservationsPage;
