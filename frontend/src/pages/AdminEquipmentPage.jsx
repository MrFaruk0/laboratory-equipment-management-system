import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAdminEquipment, getAdminLabs, addEquipment, updateEquipment, updateEquipmentStatus, deleteEquipment } from "../services/adminService";
import { useLanguage } from "../context/LanguageContext";

const STATUS_OPTIONS = ["available", "in_use", "maintenance", "faulty"];

const statusStyle = {
  available:   { bg: "#dcfce7", text: "#15803d" },
  in_use:      { bg: "#dbeafe", text: "#1d4ed8" },
  maintenance: { bg: "#fef9c3", text: "#a16207" },
  faulty:      { bg: "#fee2e2", text: "#b91c1c" },
};

function StatusBadge({ status, t }) {
  const s = statusStyle[status] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700" }}>
      {t("status." + status)}
    </span>
  );
}

const emptyForm = { name: "", code: "", labId: "", status: "available", description: "", quantity: 1, faultyCount: 0 };

function EquipmentModal({ labs, initial, onClose, onSave, t }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.code || !form.labId) { setError(t("adminEq.errRequired")); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const fields = [
    { label: t("adminEq.fieldName"), field: "name", type: "text" },
    { label: t("adminEq.fieldCode"), field: "code", type: "text" },
    { label: t("adminEq.fieldDesc"), field: "description", type: "text" },
    { label: t("adminEq.fieldQty"), field: "quantity", type: "number" },
    { label: t("adminEq.fieldFaulty"), field: "faultyCount", type: "number" },
  ];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
          {initial ? t("adminEq.editTitle") : t("adminEq.addTitle")}
        </h2>
        {fields.map(({ label, field, type }) => (
          <div key={field} style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>{label}</label>
            <input type={type} value={form[field]} onChange={set(field)} style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>{t("adminEq.fieldLab")}</label>
          <select value={form.labId} onChange={set("labId")} style={inputStyle}>
            <option value="">{t("adminEq.selectLab")}</option>
            {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>{t("adminEq.fieldStatus")}</label>
          <select value={form.status} onChange={set("status")} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t("status." + s)}</option>)}
          </select>
        </div>
        {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtn}>{t("adminEq.cancel")}</button>
          <button onClick={handleSave} disabled={saving} style={saveBtn}>
            {saving ? t("adminEq.saving") : t("adminEq.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, t }) {
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: "400px" }}>
        <p style={{ fontSize: "16px", marginBottom: "24px", color: "#374151" }}>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={cancelBtn}>{t("adminEq.cancel")}</button>
          <button onClick={onConfirm} style={{ ...saveBtn, background: "#ef4444" }}>{t("adminEq.delete")}</button>
        </div>
      </div>
    </div>
  );
}

function AdminEquipmentPage() {
  const { t, translateEntity } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const reload = async () => {
    try {
      const [eq, lb] = await Promise.all([getAdminEquipment(), getAdminLabs()]);
      setEquipment(eq); setLabs(lb);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const handleSave = async (form) => {
    if (modal.mode === "add") await addEquipment(form);
    else await updateEquipment(modal.initial.id, form);
    reload();
  };

  const handleStatusChange = async (id, status) => {
    try { await updateEquipmentStatus(id, status); reload(); }
    catch (e) { setError(e.message); }
  };

  const handleDelete = async () => {
    try { await deleteEquipment(confirm.id); setConfirm(null); reload(); }
    catch (e) { setError(e.message); setConfirm(null); }
  };

  const filtered = equipment.filter((eq) => {
    const matchSearch =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.labName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || eq.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const headers = [t("adminEq.colName"), t("adminEq.colCode"), t("adminEq.colLab"), t("adminEq.colQtyFaulty"), t("adminEq.colStatus"), t("adminEq.colActions")];

  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>{t("adminEq.title")}</h1>
          <p style={{ color: "#6b7280" }}>{t("adminEq.subtitle")}</p>
        </div>
        <button onClick={() => setModal({ mode: "add" })} style={saveBtn}>{t("adminEq.addBtn")}</button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input type="text" placeholder={t("adminEq.searchPlaceholder")} value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: "300px" }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: "180px" }}>
          <option value="all">{t("adminEq.allStatuses")}</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t("status." + s)}</option>)}
        </select>
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>}
      {loading && <p style={{ color: "#9ca3af" }}>{t("adminEq.loading")}</p>}

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
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>{t("adminEq.noFound")}</td></tr>
              )}
              {filtered.map((eq) => (
                <tr key={eq.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600" }}>{translateEntity(eq.name)}</div>
                    {eq.description && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{eq.description}</div>}
                  </td>
                  <td style={tdStyle}><code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>{eq.code}</code></td>
                  <td style={tdStyle}>
                    <div>{translateEntity(eq.labName)}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{translateEntity(eq.building)} – {t("adminEq.room")} {eq.roomNo}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{eq.quantity} / {eq.faultyCount}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{t("adminEq.available")} {Math.max(0, eq.quantity - eq.faultyCount)}</div>
                  </td>
                  <td style={tdStyle}>
                    <select value={eq.status} onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                      style={{ border: "none", background: statusStyle[eq.status]?.bg || "#f3f4f6",
                        color: statusStyle[eq.status]?.text || "#374151",
                        padding: "4px 8px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t("status." + s)}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", gap: "8px" }}>
                    <button onClick={() => setModal({ mode: "edit", initial: { ...eq, labId: eq.labId } })} style={editBtn}>{t("adminEq.edit")}</button>
                    <button onClick={() => setConfirm({ id: eq.id, name: eq.name })} style={deleteBtn}>{t("adminEq.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EquipmentModal labs={labs} initial={modal.initial} onClose={() => setModal(null)} onSave={handleSave} t={t} />
      )}

      {confirm && (
        <ConfirmDialog
          message={t("adminEq.confirmDelete", { name: confirm.name })}
          onConfirm={handleDelete} onCancel={() => setConfirm(null)} t={t}
        />
      )}
    </MainLayout>
  );
}

const labelStyle = { display: "block", fontWeight: "600", fontSize: "13px", marginBottom: "6px", color: "#374151" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" };
const saveBtn = { padding: "10px 20px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "14px" };
const cancelBtn = { padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "14px" };
const editBtn = { padding: "6px 14px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const deleteBtn = { padding: "6px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" };
const modalStyle = { background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "520px", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" };
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" };

export default AdminEquipmentPage;
