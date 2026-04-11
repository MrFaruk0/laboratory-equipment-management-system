const API_URL = "http://localhost:5000/api/reservations";

export async function createReservation(equipmentId, startTime, endTime) {
  const token = localStorage.getItem("token");
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ equipmentId, startTime, endTime }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Rezervasyon oluşturulamadı.");
  }
  return data;
}

export async function getReservations() {
  const token = localStorage.getItem("token");
  
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Rezervasyonları yükleyemedi.");
  }
  return data;
}

export async function getReservationById(id) {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Rezervasyon detayları yükleyemedi.");
  }
  return data;
}

export async function cancelReservation(id) {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Rezervasyon iptal edilemedi.");
  }
  return data;
}