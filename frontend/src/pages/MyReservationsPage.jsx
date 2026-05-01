import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getReservations } from "../services/reservationService";

function MyReservationsPage() {
  const [showPastReservations, setShowPastReservations] = useState(false);
  const [reservations, setReservations] = useState({ active: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await getReservations();
        setReservations(data);
      } catch (err) {
        setError(err.message || "Rezervasyonları yükleyemedi.");
      } finally {
        setLoading(false);
      }
    }
    loadReservations();
  }, []);

  const displayedReservations = showPastReservations
    ? [...reservations.active, ...reservations.past]
    : reservations.active;

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("tr-TR");
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>My Reservations</h1>
        <p style={{ color: "#6b7280" }}>
          View your active and past equipment reservations.
        </p>
      </div>

      <div style={cardStyle}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          <input
            type="checkbox"
            checked={showPastReservations}
            onChange={(event) => setShowPastReservations(event.target.checked)}
          />
          Show Past Reservations
        </label>

        {error && (
          <p style={{ color: "#dc2626", marginBottom: "12px" }}>{error}</p>
        )}

        {loading ? (
          <p>Yükleniyor...</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#ffffff",
            }}
          >
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Equipment</th>
                <th style={tableHeaderStyle}>Location</th>
                <th style={tableHeaderStyle}>Start Time</th>
                <th style={tableHeaderStyle}>End Time</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedReservations.length > 0 ? (
                displayedReservations.map((reservation, index) => {
                  const isPastReservation = index >= reservations.active.length && showPastReservations;
                  return (
                    <tr
                      key={reservation.id}
                      style={isPastReservation ? pastRowStyle : {}}
                    >
                      <td style={tableCellStyle}>{reservation.equipment}</td>
                      <td style={tableCellStyle}>{reservation.location}</td>
                      <td style={tableCellStyle}>{formatDateTime(reservation.startTime)}</td>
                      <td style={tableCellStyle}>{formatDateTime(reservation.endTime)}</td>
                      <td style={tableCellStyle}>
                        <span
                          style={
                            isPastReservation ? pastBadgeStyle : activeBadgeStyle
                          }
                        >
                          {isPastReservation ? "Past" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      ...tableCellStyle,
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
}

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f8fafc",
  fontWeight: "bold",
};

const tableCellStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #f1f5f9",
};

const pastRowStyle = {
  backgroundColor: "#fef2f2",
};

const pastBadgeStyle = {
  padding: "4px 10px",
  borderRadius: "999px",
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: "bold",
};

const activeBadgeStyle = {
  padding: "4px 10px",
  borderRadius: "999px",
  backgroundColor: "#dcfce7",
  color: "#166534",
  fontSize: "12px",
  fontWeight: "bold",
};

export default MyReservationsPage;