import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Sidebar() {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { t, toggleLanguage } = useLanguage();

  const toggleProfilePopup = () => setShowProfilePopup((prev) => !prev);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header / User card */}
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "18px",
          marginBottom: "24px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "28px", color: "#1d4ed8", letterSpacing: "0.5px", margin: 0 }}>
            LEMS
          </h2>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title="Switch Language"
            style={{
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
            }}
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

        <div
          onClick={toggleProfilePopup}
          style={{
            cursor: "pointer",
            padding: "12px",
            border: "1px solid #dbe3f0",
            borderRadius: "12px",
            backgroundColor: "#f8fbff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <p style={{ fontWeight: "bold", margin: 0 }}>{user?.fullName || "User"}</p>
            {isAdmin && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  letterSpacing: "0.5px",
                }}
              >
                ADMIN
              </span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{user?.email || "No email"}</p>
        </div>

        {showProfilePopup && (
          <div
            style={{
              position: "absolute",
              top: "148px",
              left: "0",
              width: "100%",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              zIndex: 10,
            }}
          >
            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{user?.fullName || "User"}</p>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>{user?.email || "No email"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/profile" onClick={() => setShowProfilePopup(false)}>{t("sidebar.goToProfile")}</Link>
              <button
                onClick={handleLogout}
                style={{ textAlign: "left", background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 0, fontSize: "14px" }}
              >
                {t("sidebar.logout")}
              </button>
            </div>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Regular user navigation */}
        <Link to="/reservations" style={isActive("/reservations") ? activeLinkStyle : navLinkStyle}>
          {t("sidebar.myReservations")}
        </Link>
        <Link to="/make-reservation" style={isActive("/make-reservation") ? activeLinkStyle : navLinkStyle}>
          {t("sidebar.makeReservation")}
        </Link>
        <Link to="/profile" style={isActive("/profile") ? activeLinkStyle : navLinkStyle}>
          {t("sidebar.profile")}
        </Link>

        {/* Admin navigation */}
        {isAdmin && (
          <>
            <div
              style={{
                margin: "12px 0 6px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#9ca3af",
                letterSpacing: "1px",
                textTransform: "uppercase",
                paddingLeft: "14px",
              }}
            >
              {t("sidebar.adminPanel")}
            </div>
            <Link to="/admin" style={isActive("/admin") ? activeAdminLinkStyle : adminLinkStyle}>
              {t("sidebar.dashboard")}
            </Link>
            <Link to="/admin/equipment" style={isActive("/admin/equipment") ? activeAdminLinkStyle : adminLinkStyle}>
              {t("sidebar.equipment")}
            </Link>
            <Link to="/admin/reservations" style={isActive("/admin/reservations") ? activeAdminLinkStyle : adminLinkStyle}>
              {t("sidebar.allReservations")}
            </Link>
            <Link to="/admin/users" style={isActive("/admin/users") ? activeAdminLinkStyle : adminLinkStyle}>
              {t("sidebar.users")}
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}

const navLinkStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  color: "#374151",
  backgroundColor: "transparent",
  textDecoration: "none",
};

const activeLinkStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  color: "#1d4ed8",
  backgroundColor: "#eaf2ff",
  fontWeight: "bold",
  textDecoration: "none",
};

const adminLinkStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  color: "#5b21b6",
  backgroundColor: "transparent",
  textDecoration: "none",
  fontSize: "14px",
};

const activeAdminLinkStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  color: "#5b21b6",
  backgroundColor: "#ede9fe",
  fontWeight: "bold",
  textDecoration: "none",
  fontSize: "14px",
};

export default Sidebar;