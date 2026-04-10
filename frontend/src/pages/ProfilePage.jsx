import { useState, useContext } from "react";
import MainLayout from "../layouts/MainLayout";
import { changePassword } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Yeni şifre ve onay şifresi eşleşmiyor.");
      return;
    }

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccessMsg(result.message);
    } catch (err) {
      setError(err.message);
      return;
    }

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPasswordForm(false);
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>My Profile</h1>
        <p style={{ color: "#6b7280" }}>
          View your account details and update your password.
        </p>
      </div>

      <div style={cardStyle}>
        <p style={{ marginBottom: "8px" }}>
          <strong>Name:</strong> {user?.fullName || "-"}
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Username:</strong> {user?.username || "-"}
        </p>
        <p style={{ marginBottom: "20px" }}>
          <strong>Email:</strong> {user?.email || "-"}
        </p>

        <button
          onClick={() => setShowPasswordForm((prev) => !prev)}
          style={buttonStyle}
        >
          {showPasswordForm ? "Cancel" : "Change Password"}
        </button>

        {showPasswordForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Save Password
            </button>

            {error && (
              <p style={{ marginTop: "12px", color: "#dc2626", fontSize: "14px" }}>⚠ {error}</p>
            )}
            {successMsg && (
              <p style={{ marginTop: "12px", color: "#16a34a", fontSize: "14px" }}>✓ {successMsg}</p>
            )}
          </form>
        )}
      </div>
    </MainLayout>
  );
}

const cardStyle = {
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  padding: "26px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
};

const fieldStyle = {
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
};

const buttonStyle = {
  padding: "12px 16px",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default ProfilePage;