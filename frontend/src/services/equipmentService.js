const API_URL = "http://localhost:5000/api/equipment";

export async function getEquipments() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Ekipmanları yükleyemedi.");
  }
  return response.json();
}

export async function getEquipmentById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Ekipman detayları yükleyemedi.");
  }
  return response.json();
}