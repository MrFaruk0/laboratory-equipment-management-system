import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { t, toggleLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(formData.email, formData.password);
      login(data.token, data.user);
      navigate("/reservations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Language toggle for login page */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button
            onClick={toggleLanguage}
            style={langBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1d4ed8";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#1d4ed8";
            }}
          >
            {t("lang.toggle")}
          </button>
        </div>

        <h1 style={{ marginBottom: "8px", fontSize: "32px" }}>{t("login.title")}</h1>
        <p style={{ marginBottom: "24px", color: "#6b7280" }}>
          {t("login.subtitle")}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>{t("login.email")}</label>
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
            <label style={labelStyle}>{t("login.password")}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? t("login.loading") : t("login.submit")}
          </button>

          {error && (
            <p style={{ marginTop: "12px", color: "#dc2626", fontSize: "14px" }}>
              ⚠ {error}
            </p>
          )}
        </form>

        <p style={{ marginTop: "18px", color: "#4b5563" }}>
          {t("login.noAccount")} <Link to="/signup">{t("login.signUp")}</Link>
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

const langBtnStyle = {
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: "700",
  border: "1.5px solid #1d4ed8",
  borderRadius: "8px",
  background: "transparent",
  color: "#1d4ed8",
  cursor: "pointer",
  letterSpacing: "0.5px",
  transition: "all 0.2s",
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