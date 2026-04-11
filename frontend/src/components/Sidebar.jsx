import { Link, useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99

function Sidebar() {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const { user, logout } = useContext(AuthContext);
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99

  const toggleProfilePopup = () => {
    setShowProfilePopup((prev) => !prev);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
<<<<<<< HEAD
=======
    logout();
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99
    navigate("/login");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "18px",
          marginBottom: "24px",
          position: "relative",
        }}
      >
        <h2
          style={{
            marginBottom: "18px",
            fontSize: "28px",
            color: "#1d4ed8",
            letterSpacing: "0.5px",
          }}
        >
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
<<<<<<< HEAD
          <p style={{ fontWeight: "bold", marginBottom: "4px" }}>John Doe</p>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>john@example.com</p>
=======
          <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{user?.fullName || user?.username || "Kullanıcı"}</p>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>{user?.email || ""}</p>
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99
        </div>

        {showProfilePopup && (
          <div
            style={{
              position: "absolute",
              top: "118px",
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
<<<<<<< HEAD
            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>John Doe</p>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
              john@example.com
=======
            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{user?.fullName || user?.username || "Kullanıcı"}</p>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
              {user?.email || ""}
>>>>>>> 1d192afabfc154b0071f9009f1bef058af54ab99
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/profile">Go to Profile</Link>

              <button
                onClick={handleLogout}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Link
          to="/reservations"
          style={isActive("/reservations") ? activeLinkStyle : navLinkStyle}
        >
          My Reservations
        </Link>

        <Link
          to="/make-reservation"
          style={isActive("/make-reservation") ? activeLinkStyle : navLinkStyle}
        >
          Make Reservation
        </Link>

        <Link
          to="/profile"
          style={isActive("/profile") ? activeLinkStyle : navLinkStyle}
        >
          Profile
        </Link>
      </nav>
    </div>
  );
}

const navLinkStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  color: "#374151",
  backgroundColor: "transparent",
};

const activeLinkStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  color: "#1d4ed8",
  backgroundColor: "#eaf2ff",
  fontWeight: "bold",
};

export default Sidebar;