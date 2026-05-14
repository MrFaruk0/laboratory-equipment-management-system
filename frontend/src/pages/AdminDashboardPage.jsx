import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import AdminListModal from "../components/AdminListModal";
import { getAdminStats, getAdminEquipment, getAdminReservations, getAdminUsers } from "../services/adminService";

const statusColors = {
  available:   { bg: "#dcfce7", text: "#15803d" },
  in_use:      { bg: "#dbeafe", text: "#1d4ed8" },
  maintenance: { bg: "#fef9c3", text: "#a16207" },
  faulty:      { bg: "#fee2e2", text: "#b91c1c" },
};

const roleLabels = { students: "Students", assistants: "Assistants", technicians: "Technicians", admins: "Admins" };
const roleColors = { students: "#3b82f6", assistants: "#8b5cf6", technicians: "#f59e0b", admins: "#ef4444" };
const roleIdMap = { students: 1, assistants: 2, technicians: 3, admins: 4 };

function StatCard({ label, value, color, sub, onClick, clickable }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      minWidth: "160px",
      flex: "1",
      cursor: clickable ? "pointer" : "default",
      transition: "all 0.2s",
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (clickable) {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }
    }}
    onMouseLeave={(e) => {
      if (clickable) {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }
    }}
    >
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      <p style={{ fontSize: "40px", fontWeight: "800", color: color || "#111827", margin: "0 0 4px" }}>{value ?? "—"}</p>
      {sub && <p style={{ fontSize: "12px", color: "#9ca3af" }}>{sub}</p>}
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalItems, setModalItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalConfig, setModalConfig] = useState(null);

  useEffect(() => {
    getAdminStats().then((statsData) => {
      // Fetch reservations to compute actual completed count
      getAdminReservations()
        .then((reservations) => {
          const now = new Date();
          const actualCompleted = reservations.filter(
            (r) => new Date(r.endTime) < now && r.status !== "cancelled"
          ).length;
          
          // Calculate actual active count (reservations that are still active and not past end date)
          const actualActive = reservations.filter(
            (r) => r.status === "active" && new Date(r.endTime) >= now
          ).length;
          
          // Update completed and active counts in stats
          statsData.reservations.completed = actualCompleted;
          statsData.reservations.active = actualActive;
          setStats(statsData);
        })
        .catch(() => {
          // If we can't fetch reservations, use the stats as is
          setStats(statsData);
        });
    }).catch((e) => setError(e.message));
  }, []);

  const openModal = async (title, type, filter) => {
    setModalTitle(title);
    setModalLoading(true);
    setModalError("");
    setModalItems([]);

    try {
      let data = [];
      let columns = [];
      let renderRow = null;

      if (type === "equipment") {
        const allEquipment = await getAdminEquipment();
        if (filter && filter !== "total") {
          data = allEquipment.filter((e) => e.status === filter);
        } else {
          data = allEquipment;
        }
        columns = ["Name", "Status", "Lab", "Code"];
        renderRow = (item) => (
          <>
            <td style={{ padding: "12px 8px" }}>{item.name}</td>
            <td style={{ padding: "12px 8px" }}>
              <span
                style={{
                  background: statusColors[item.status]?.bg,
                  color: statusColors[item.status]?.text,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {item.status.replace("_", " ")}
              </span>
            </td>
            <td style={{ padding: "12px 8px" }}>{item.labName || "—"}</td>
            <td style={{ padding: "12px 8px" }}>{item.code || "—"}</td>
          </>
        );
      } else if (type === "reservations") {
        const allReservations = await getAdminReservations();
        
        // Add computed status based on end date
        const reservationsWithStatus = allReservations.map((r) => {
          const endTime = new Date(r.endTime);
          const now = new Date();
          const computedStatus = endTime < now && r.status !== "cancelled" ? "completed" : r.status;
          return { ...r, computedStatus };
        });
        
        if (filter && filter !== "total") {
          const filterStatus = filter.trim().toLowerCase();
          data = reservationsWithStatus.filter((r) => r.computedStatus.toLowerCase() === filterStatus);
        } else {
          data = reservationsWithStatus;
        }
        columns = ["User", "Equipment", "Status", "Start Date", "End Date"];
        renderRow = (item) => (
          <>
            <td style={{ padding: "12px 8px" }}>{item.userFullName || "—"}</td>
            <td style={{ padding: "12px 8px" }}>{item.equipment || "—"}</td>
            <td style={{ padding: "12px 8px" }}>
              <span
                style={{
                  background:
                    item.computedStatus === "active"
                      ? "#dbeafe"
                      : item.computedStatus === "completed"
                      ? "#dcfce7"
                      : "#fee2e2",
                  color:
                    item.computedStatus === "active"
                      ? "#1d4ed8"
                      : item.computedStatus === "completed"
                      ? "#15803d"
                      : "#b91c1c",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {item.computedStatus}
              </span>
            </td>
            <td style={{ padding: "12px 8px" }}>{new Date(item.startTime).toLocaleDateString()}</td>
            <td style={{ padding: "12px 8px" }}>{new Date(item.endTime).toLocaleDateString()}</td>
          </>
        );
      } else if (type === "users") {
        const allUsers = await getAdminUsers();
        if (filter && filter !== "total") {
          const targetRoleId = roleIdMap[filter];
          data = allUsers.filter((u) => u.roleId === targetRoleId);
        } else {
          data = allUsers;
        }
        columns = ["Name", "Email", "Role"];
        renderRow = (item) => {
          const roleName = item.roleName || "Unknown";
          const roleKey = roleName.toLowerCase();
          const bgColor = roleColors[roleKey] || "#6b7280";
          const textColor = bgColor;
          return (
            <>
              <td style={{ padding: "12px 8px" }}>{item.fullName}</td>
              <td style={{ padding: "12px 8px" }}>{item.email}</td>
              <td style={{ padding: "12px 8px" }}>
                <span
                  style={{
                    background: textColor + "20",
                    color: textColor,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {roleName}
                </span>
              </td>
            </>
          );
        };
      }

      setModalItems(data);
      setModalConfig({ columns, renderRow });
      setModalOpen(true);
    } catch (err) {
      setModalError(err.message || "Failed to load items");
    } finally {
      setModalLoading(false);
    }
  };

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
              <StatCard
                label="Total"
                value={stats.equipment.total}
                color="#111827"
                clickable
                onClick={() => openModal("All Equipment", "equipment", "total")}
              />
              {Object.entries(statusColors).map(([key, c]) => (
                <StatCard
                  key={key}
                  label={key.replace("_", " ")}
                  value={stats.equipment[key] ?? 0}
                  color={c.text}
                  clickable
                  onClick={() => openModal(`${key.replace("_", " ")} Equipment`, "equipment", key)}
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
              <StatCard
                label="Total"
                value={stats.reservations.total}
                color="#111827"
                clickable
                onClick={() => openModal("All Reservations", "reservations", "total")}
              />
              <StatCard
                label="Active"
                value={stats.reservations.active}
                color="#1d4ed8"
                clickable
                onClick={() => openModal("Active Reservations", "reservations", "active")}
              />
              <StatCard
                label="Completed"
                value={stats.reservations.completed}
                color="#15803d"
                clickable
                onClick={() => openModal("Completed Reservations", "reservations", "completed")}
              />
              <StatCard
                label="Cancelled"
                value={stats.reservations.cancelled}
                color="#b91c1c"
                clickable
                onClick={() => openModal("Cancelled Reservations", "reservations", "cancelled")}
              />
            </div>
          </section>

          {/* Users */}
          <section>
            <h2 style={sectionTitle}>Users</h2>
            <div style={cardRow}>
              <StatCard
                label="Total"
                value={stats.users.total}
                color="#111827"
                sub={`across ${stats.labs.total} lab(s)`}
                clickable
                onClick={() => openModal("All Users", "users", "total")}
              />
              {Object.entries(roleLabels).map(([key, label]) => (
                <StatCard
                  key={key}
                  label={label}
                  value={stats.users[key] ?? 0}
                  color={roleColors[key]}
                  clickable
                  onClick={() => openModal(`${label}`, "users", key)}
                />
              ))}
            </div>
          </section>

        </div>
      )}

      <AdminListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        items={modalItems}
        loading={modalLoading}
        error={modalError}
        columns={modalConfig?.columns || []}
        renderRow={modalConfig?.renderRow || (() => null)}
      />
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
