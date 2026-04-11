<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
=======
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setError(""); // Yazarken hata mesajını temizle
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
<<<<<<< HEAD

    const user = await loginUser(formData.email, formData.password);

    if (user) {
      navigate("/reservations");
=======
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(formData.email, formData.password);
      login(data.token, data.user); // Token + kullanıcıyı context'e kaydet
      navigate("/reservations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "8px", fontSize: "32px" }}>Login</h1>
        <p style={{ marginBottom: "24px", color: "#6b7280" }}>
          Smart Laboratory Equipment Reservation System
        </p>

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

<<<<<<< HEAD
          <button type="submit" style={buttonStyle}>
            Login
          </button>
=======
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Login"}
          </button>

          {error && (
            <p style={{ marginTop: "12px", color: "#dc2626", fontSize: "14px" }}>
              ⚠ {error}
            </p>
          )}
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99
        </form>

        <p style={{ marginTop: "18px", color: "#4b5563" }}>
          Do not have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f5f7fb",
};

const cardStyle = {
  width: "100%",
  maxWidth: "440px",
  backgroundColor: "#ffffff",
  padding: "34px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
};

const fieldStyle = {
  marginBottom: "18px",
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
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "bold",
};

export default LoginPage;