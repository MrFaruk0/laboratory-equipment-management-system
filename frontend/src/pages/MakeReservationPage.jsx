import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getEquipments } from "../services/equipmentService";
import { createReservation } from "../services/reservationService";
import { useEffect } from "react";

function MakeReservationPage() {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadEquipments() {
      try {
        const data = await getEquipments();
        setEquipments(data);
      } catch (err) {
        setError(err.message || "Ekipmanları yükleyemedi.");
      }
    }
    loadEquipments();
  }, []);

  const selectedEquipment = equipments.find(
    (equipment) => equipment.id === Number(selectedEquipmentId)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedEquipment || !startTime || !endTime) {
      setError("Tüm alanları doldurunuz.");
      setLoading(false);
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError("Bitiş zamanı başlangıç zamanından sonra olmalıdır.");
      setLoading(false);
      return;
    }

    if (new Date(startTime) < new Date()) {
      setError("Geçmiş bir tarihte rezervasyon yapılamaz.");
      setLoading(false);
      return;
    }

    try {
      await createReservation(selectedEquipment.id, startTime, endTime);
      setSelectedEquipmentId("");
      setStartTime("");
      setEndTime("");
      navigate("/reservations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <label style={labelStyle}>Start Date & Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>End Date & Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: "#dc2626", marginBottom: "12px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? "Rezervasyon oluşturuluyor..." : "Reserve"}
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
  width: "100%",
  padding: "12px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default MakeReservationPage;