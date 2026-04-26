import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);

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
        <h2 style={{ marginBottom: "18px", fontSize: "28px", color: "#1d4ed8", letterSpacing: "0.5px" }}>
          LEMS
        </h2>

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
              top: "128px",
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
              <Link to="/profile" onClick={() => setShowProfilePopup(false)}>Go to Profile</Link>
              <button
                onClick={handleLogout}
                style={{ textAlign: "left", background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 0, fontSize: "14px" }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Regular user navigation */}
        <Link to="/reservations" style={isActive("/reservations") ? activeLinkStyle : navLinkStyle}>
          My Reservations
        </Link>
        <Link to="/make-reservation" style={isActive("/make-reservation") ? activeLinkStyle : navLinkStyle}>
          Make Reservation
        </Link>
        <Link to="/profile" style={isActive("/profile") ? activeLinkStyle : navLinkStyle}>
          Profile
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
              Admin Panel
            </div>
            <Link to="/admin" style={isActive("/admin") ? activeAdminLinkStyle : adminLinkStyle}>
              🏠 Dashboard
            </Link>
            <Link to="/admin/equipment" style={isActive("/admin/equipment") ? activeAdminLinkStyle : adminLinkStyle}>
              🔧 Equipment
            </Link>
            <Link to="/admin/reservations" style={isActive("/admin/reservations") ? activeAdminLinkStyle : adminLinkStyle}>
              📋 All Reservations
            </Link>
            <Link to="/admin/users" style={isActive("/admin/users") ? activeAdminLinkStyle : adminLinkStyle}>
              👥 Users
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