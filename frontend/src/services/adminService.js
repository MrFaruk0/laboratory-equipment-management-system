const BASE_URL = "http://localhost:5000/api/admin";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "İstek başarısız.");
  return data;
}

// ── Stats ──────────────────────────────────────
export const getAdminStats = () => request("/stats");

// ── Equipment ──────────────────────────────────
export const getAdminEquipment = () => request("/equipment");

export const addEquipment = (body) =>
  request("/equipment", { method: "POST", body: JSON.stringify(body) });

export const updateEquipment = (id, body) =>
  request(`/equipment/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const updateEquipmentStatus = (id, status) =>
  request(`/equipment/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const deleteEquipment = (id) =>
  request(`/equipment/${id}`, { method: "DELETE" });

// ── Reservations ───────────────────────────────
export const getAdminReservations = () => request("/reservations");

export const cancelAdminReservation = (id) =>
  request(`/reservations/${id}`, { method: "DELETE" });

// ── Users ──────────────────────────────────────
export const getAdminUsers = () => request("/users");

export const changeUserRole = (id, roleId) =>
  request(`/users/${id}/role`, { method: "PUT", body: JSON.stringify({ roleId }) });

// ── Labs ───────────────────────────────────────
export const getAdminLabs = () => request("/labs");

export const addLab = (body) =>
  request("/labs", { method: "POST", body: JSON.stringify(body) });

// ── Blocked Slots ──────────────────────────────
export const getBlockedSlots = () => request("/blocked-slots");

export const addBlockedSlot = (body) =>
  request("/blocked-slots", { method: "POST", body: JSON.stringify(body) });

export const deleteBlockedSlot = (id) =>
  request(`/blocked-slots/${id}`, { method: "DELETE" });
