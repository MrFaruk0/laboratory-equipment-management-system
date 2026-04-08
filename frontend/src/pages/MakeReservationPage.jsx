import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getEquipments } from "../services/equipmentService";
import { useEffect } from "react";
import { ReservationContext } from "../context/ReservationContext";

function MakeReservationPage() {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [equipments, setEquipments] = useState([]);

  const { addReservation, reservations } = useContext(ReservationContext);
  const navigate = useNavigate();

  useEffect(() => {
  async function loadEquipments() {
    const data = await getEquipments();
    setEquipments(data);
  }

  loadEquipments();
}, []);

  const selectedEquipment = equipments.find(
  (equipment) => equipment.id === Number(selectedEquipmentId)
);

  const isReserved = reservations.some(
    (reservation) =>
      reservation.equipment === selectedEquipment?.name &&
      reservation.datetime === selectedDateTime
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedEquipment || !selectedDateTime) {
      return;
    }

    if (isReserved) {
      alert("This equipment is already reserved for the selected date and time.");
      return;
    }

    addReservation({
      equipment: selectedEquipment.name,
      location: selectedEquipment.location,
      datetime: selectedDateTime,
      past: false,
    });

    setSelectedEquipmentId("");
    setSelectedDateTime("");
    navigate("/reservations");
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Make a Reservation</h1>
        <p style={{ color: "#6b7280" }}>
          Select equipment, review its location, and reserve an available time.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={formCardStyle}>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Equipment</label>
          <select
            value={selectedEquipmentId}
            onChange={(event) => setSelectedEquipmentId(event.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select equipment</option>
            {equipments.map((equipment) => (
              <option key={equipment.id} value={equipment.id}>
                {equipment.name} (ID: {equipment.id})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Location</label>
          <input
            type="text"
            value={selectedEquipment ? selectedEquipment.location : ""}
            readOnly
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Date and Time</label>
          <input
            type="datetime-local"
            value={selectedDateTime}
            onChange={(event) => setSelectedDateTime(event.target.value)}
            required
            style={inputStyle}
          />

          {isReserved && (
            <p style={{ color: "#dc2626", marginTop: "8px", fontSize: "14px" }}>
              This equipment is already reserved for the selected date and time.
            </p>
          )}
        </div>

        <button
          type="submit"
          style={{
            ...buttonStyle,
            opacity: isReserved ? 0.6 : 1,
            cursor: isReserved ? "not-allowed" : "pointer",
          }}
          disabled={isReserved}
        >
          Reserve
        </button>
      </form>
    </MainLayout>
  );
}

const formCardStyle = {
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  padding: "26px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
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
  backgroundColor: "#fff",
};

const buttonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "bold",
};

export default MakeReservationPage;