import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { changePassword } from "../services/authService";

function ProfilePage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (result.success) {
      alert(result.message);
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
          <strong>Name:</strong> John Doe
        </p>
        <p style={{ marginBottom: "20px" }}>
          <strong>Email:</strong> john@example.com
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