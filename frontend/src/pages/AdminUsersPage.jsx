import { useEffect, useState, useContext } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAdminUsers, changeUserRole } from "../services/adminService";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const roleStyle = {
  student:    { bg: "#dbeafe", text: "#1d4ed8" },
  assistant:  { bg: "#ede9fe", text: "#6d28d9" },
  technician: { bg: "#fef9c3", text: "#a16207" },
  admin:      { bg: "#fee2e2", text: "#b91c1c" },
};

function RoleBadge({ roleName, t }) {
  const s = roleStyle[roleName] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700" }}>
      {t("role." + roleName)}
    </span>
  );
}

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [saving, setSaving] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  const ROLES = [
    { id: 1, name: "student" },
    { id: 2, name: "assistant" },
    { id: 3, name: "technician" },
    { id: 4, name: "admin" },
  ];

  const reload = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const handleRoleChange = async (userId, roleId) => {
    setSaving(userId);
    try {
      await changeUserRole(userId, roleId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roleId, roleName: ROLES.find((r) => r.id === roleId)?.name || u.roleName }
            : u
        )
      );
    } catch (e) { setError(e.message); }
    finally { setSaving(null); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.fullName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || u.roleName === filterRole;
    return matchSearch && matchRole;
  });

  const headers = [t("adminUsers.colName"), t("adminUsers.colUsername"), t("adminUsers.colEmail"), t("adminUsers.colCurrentRole"), t("adminUsers.colChangeRole"), t("adminUsers.colJoined")];

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>{t("adminUsers.title")}</h1>
        <p style={{ color: "#6b7280" }}>{t("adminUsers.subtitle")}</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input type="text" placeholder={t("adminUsers.searchPlaceholder")} value={search}
          onChange={(e) => setSearch(e.target.value)} style={inputStyle} />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ ...inputStyle, minWidth: "150px", maxWidth: "180px" }}>
          <option value="all">{t("adminUsers.allRoles")}</option>
          {ROLES.map((r) => <option key={r.id} value={r.name}>{t("role." + r.name)}</option>)}
        </select>
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>}
      {loading && <p style={{ color: "#9ca3af" }}>{t("adminUsers.loading")}</p>}

      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {headers.map((h) => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>{t("adminUsers.noFound")}</td></tr>
              )}
              {filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6", background: isSelf ? "#fafafa" : "transparent" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "600" }}>{u.fullName}</div>
                      {isSelf && <div style={{ fontSize: "11px", color: "#9ca3af" }}>{t("adminUsers.you")}</div>}
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>@{u.username}</td>
                    <td style={{ ...tdStyle, fontSize: "13px", color: "#6b7280" }}>{u.email}</td>
                    <td style={tdStyle}><RoleBadge roleName={u.roleName} t={t} /></td>
                    <td style={tdStyle}>
                      <select value={u.roleId}
                        onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                        disabled={saving === u.id || (isSelf && u.roleId === 4)}
                        style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", cursor: "pointer", background: saving === u.id ? "#f3f4f6" : "#fff" }}
                        title={isSelf && u.roleId === 4 ? t("adminUsers.cannotDemote") : ""}>
                        {ROLES.map((r) => <option key={r.id} value={r.id}>{t("role." + r.name)}</option>)}
                      </select>
                      {saving === u.id && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#6b7280" }}>{t("adminUsers.saving")}</span>}
                    </td>
                    <td style={{ ...tdStyle, fontSize: "13px", color: "#9ca3af" }}>{fmt(u.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: "12px", fontSize: "13px", color: "#9ca3af" }}>
        {t("adminUsers.showing", { filtered: filtered.length, total: users.length })}
      </p>
    </MainLayout>
  );
}

const inputStyle = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", minWidth: "240px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" };

export default AdminUsersPage;
