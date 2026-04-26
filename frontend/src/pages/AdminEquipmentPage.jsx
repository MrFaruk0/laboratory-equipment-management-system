import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getAdminEquipment,
  getAdminLabs,
  addEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment,
} from "../services/adminService";

const STATUS_OPTIONS = ["available", "in_use", "maintenance", "faulty"];

const statusStyle = {
  available:   { bg: "#dcfce7", text: "#15803d" },
  in_use:      { bg: "#dbeafe", text: "#1d4ed8" },
  maintenance: { bg: "#fef9c3", text: "#a16207" },
  faulty:      { bg: "#fee2e2", text: "#b91c1c" },
};

function StatusBadge({ status }) {
  const s = statusStyle[status] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "12px", fontWeight: "700",
    }}>
      {status.replace("_", " ")}
    </span>
  );
}

const emptyForm = { name: "", code: "", labId: "", status: "available", description: "" };

function EquipmentModal({ labs, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.code || !form.labId) {
      setError("Name, code and lab are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
          {initial ? "Edit Equipment" : "Add Equipment"}
        </h2>

        {[
          { label: "Name", field: "name", type: "text" },
          { label: "Code", field: "code", type: "text" },
          { label: "Description", field: "description", type: "text" },
        ].map(({ label, field, type }) => (
          <div key={field} style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>{label}</label>
            <input type={type} value={form[field]} onChange={set(field)} style={inputStyle} />
          </div>
        ))}

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Laboratory</label>
          <select value={form.labId} onChange={set("labId")} style={inputStyle}>
            <option value="">Select lab</option>
            {labs.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={set("status")} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={saveBtn}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: "400px" }}>
        <p style={{ fontSize: "16px", marginBottom: "24px", color: "#374151" }}>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={{ ...saveBtn, background: "#ef4444" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: "add" | "edit", initial?: {} }
  const [confirm, setConfirm] = useState(null); // null | { id }
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const reload = async () => {
    try {
      const [eq, lb] = await Promise.all([getAdminEquipment(), getAdminLabs()]);
      setEquipment(eq);
      setLabs(lb);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleSave = async (form) => {
    if (modal.mode === "add") {
      await addEquipment(form);
    } else {
      await updateEquipment(modal.initial.id, form);
    }
    reload();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateEquipmentStatus(id, status);
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEquipment(confirm.id);
      setConfirm(null);
      reload();
    } catch (e) {
      setError(e.message);
      setConfirm(null);
    }
  };

  const filtered = equipment.filter((eq) => {
    const matchSearch =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.labName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || eq.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>Equipment Management</h1>
          <p style={{ color: "#6b7280" }}>Add, edit, and manage laboratory equipment.</p>
        </div>
        <button onClick={() => setModal({ mode: "add" })} style={saveBtn}>+ Add Equipment</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name, code, lab..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: "300px" }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: "180px" }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>}
      {loading && <p style={{ color: "#9ca3af" }}>Loading...</p>}

      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Name", "Code", "Lab", "Status", "Actions"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>No equipment found.</td></tr>
              )}
              {filtered.map((eq) => (
                <tr key={eq.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600" }}>{eq.name}</div>
                    {eq.description && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{eq.description}</div>}
                  </td>
                  <td style={tdStyle}><code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>{eq.code}</code></td>
                  <td style={tdStyle}>
                    <div>{eq.labName}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{eq.building} – Room {eq.roomNo}</div>
                  </td>
                  <td style={tdStyle}>
                    <select
                      value={eq.status}
                      onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                      style={{
                        border: "none",
                        background: statusStyle[eq.status]?.bg || "#f3f4f6",
                        color: statusStyle[eq.status]?.text || "#374151",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setModal({ mode: "edit", initial: { ...eq, labId: eq.labId } })}
                      style={editBtn}
                    >
                      Edit
                    </button>
                    <button onClick={() => setConfirm({ id: eq.id, name: eq.name })} style={deleteBtn}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EquipmentModal
          labs={labs}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.name}"? Active reservations for this equipment will be cancelled.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </MainLayout>
  );
}

// ── Shared Styles ──────────────────────────────
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
