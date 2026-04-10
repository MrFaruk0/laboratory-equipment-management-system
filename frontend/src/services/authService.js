const API_URL = "http://localhost:5000/api/auth";

// Login — token + kullanıcı bilgisi döner
export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Giriş başarısız.");
  return data; // { token, user }
}

// Signup — yeni kullanıcı oluşturur
export async function signupUser(username, fullName, email, password) {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, fullName, email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Kayıt başarısız.");
  return data;
}

// Şifre değiştir — JWT gerektirir
export async function changePassword(currentPassword, newPassword) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Şifre değiştirme başarısız.");
  return data;
}