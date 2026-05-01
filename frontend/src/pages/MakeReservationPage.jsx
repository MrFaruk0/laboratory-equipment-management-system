import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getEquipments } from "../services/equipmentService";
import {
  createReservation,
  getReservationsByEquipment,
} from "../services/reservationService";

const WORKING_HOURS = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
];

function MakeReservationPage() {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [equipmentReservations, setEquipmentReservations] = useState([]);
  const [slotAvailability, setSlotAvailability] = useState({});
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

  useEffect(() => {
    async function loadEquipmentReservations() {
      if (!selectedEquipmentId) {
        setEquipmentReservations([]);
        return;
      }

      try {
        const data = await getReservationsByEquipment(selectedEquipmentId);
        setEquipmentReservations(data);
      } catch {
        setEquipmentReservations([]);
      }
    }

    loadEquipmentReservations();
  }, [selectedEquipmentId]);

  const selectedEquipment = equipments.find(
    (equipment) => equipment.id === Number(selectedEquipmentId)
  );

  const getSlotKey = (date, slot) => `${date}-${slot.start}-${slot.end}`;

  const getAvailableInSlot = (date, slot) => {
    if (!selectedEquipment) return 0;

    const workingQuantity = Math.max(0, selectedEquipment.quantity - selectedEquipment.faultyCount);
    const slotStart = new Date(`${date}T${slot.start}:00`);
    const slotEnd = new Date(`${date}T${slot.end}:00`);

    const reservedInSlot = equipmentReservations.filter((reservation) => {
      const reservationStart = new Date(reservation.start_time);
      const reservationEnd = new Date(reservation.end_time);
      return reservationStart < slotEnd && reservationEnd > slotStart;
    }).length;

    return Math.max(0, workingQuantity - reservedInSlot);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMonthName = () => {
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getMonthDateList = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= lastDay; day++) {
      dates.push(formatDate(new Date(year, month, day)));
    }

    return dates;
  };

  const isPastDate = (date) => {
    const today = new Date();
    const selected = new Date(`${date}T23:59:59`);

    return selected < today;
  };

  const isSlotReserved = (date, slot) => {
    const slotStart = new Date(`${date}T${slot.start}:00`);
    const slotEnd = new Date(`${date}T${slot.end}:00`);

    return equipmentReservations.some((reservation) => {
      const reservationStart = new Date(reservation.start_time);
      const reservationEnd = new Date(reservation.end_time);

      return reservationStart < slotEnd && reservationEnd > slotStart;
    });
  };

  const getDayStatus = (date) => {
    if (!selectedEquipmentId) return "empty";

    if (isPastDate(date)) return "past";

    const reservedCount = WORKING_HOURS.filter((slot) =>
      isSlotReserved(date, slot)
    ).length;

    if (reservedCount === 0) return "available";
    if (reservedCount === WORKING_HOURS.length) return "full";
    return "partial";
  };

  const goToPreviousMonth = () => {
    const today = new Date();
    const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (current <= thisMonth) return;

    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDate("");
    setSelectedSlot(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDate("");
    setSelectedSlot(null);
  };

  const handleEquipmentChange = (event) => {
    setSelectedEquipmentId(event.target.value);
    setSelectedDate("");
    setSelectedSlot(null);
    setCurrentMonth(new Date());
    setError("");
  };

  const handleDateSelect = (date) => {
    const status = getDayStatus(date);

    if (status === "full" || status === "past") return;

    setSelectedDate(date);
    setSelectedSlot(null);
    setError("");
  };

  const handleSlotSelect = (slot) => {
    if (!selectedDate) return;
    
    const available = getAvailableInSlot(selectedDate, slot);
    if (available === 0) return;

    setSelectedSlot(slot);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedEquipment || !selectedDate || !selectedSlot) {
      setError("Lütfen ekipman, tarih ve saat seçiniz.");
      return;
    }

    if (selectedEquipment.availableTotal === 0) {
      setError("Bu ekipman şu anda mevcut değildir.");
      return;
    }

    const startTime = `${selectedDate}T${selectedSlot.start}:00`;
    const endTime = `${selectedDate}T${selectedSlot.end}:00`;

    if (new Date(startTime) < new Date()) {
      setError("Geçmiş bir tarihte rezervasyon yapılamaz.");
      return;
    }

    setLoading(true);

    try {
      await createReservation(selectedEquipment.id, startTime, endTime);
      navigate("/reservations");
    } catch (err) {
      setError(err.message || "Rezervasyon oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          Make a Reservation
        </h1>
        <p style={{ color: "#6b7280" }}>
          Select equipment, choose an available day, and reserve a free time slot.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={formCardStyle}>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Equipment</label>
          <select
            value={selectedEquipmentId}
            onChange={handleEquipmentChange}
            required
            style={inputStyle}
          >
            <option value="">Select equipment</option>
            {equipments.map((equipment) => (
              <option key={equipment.id} value={equipment.id}>
                {equipment.name} - {equipment.availableTotal || 0} available
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

        {selectedEquipment && (
          <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e40af" }}>
              <strong>Total Quantity:</strong> {selectedEquipment.quantity}
            </p>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e40af" }}>
              <strong>Faulty Units:</strong> {selectedEquipment.faultyCount}
            </p>
            <p style={{ margin: "0", fontSize: "14px", color: selectedEquipment.availableTotal > 0 ? "#166534" : "#991b1b" }}>
              <strong>Available for Reservation:</strong> {selectedEquipment.availableTotal > 0 ? selectedEquipment.availableTotal : "0 - All equipment is broken or being maintained"}
            </p>
          </div>
        )}

        {selectedEquipmentId && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Select Date</label>

              <div style={monthHeaderStyle}>
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  style={monthButtonStyle}
                >
                  Previous
                </button>

                <strong>{getMonthName()}</strong>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  style={monthButtonStyle}
                >
                  Next
                </button>
              </div>

              <div style={calendarGridStyle}>
                {getMonthDateList().map((date) => {
                  const status = getDayStatus(date);
                  const isSelected = selectedDate === date;

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      disabled={status === "full" || status === "past"}
                      style={{
                        ...dateButtonStyle,
                        ...getDateStyle(status),
                        border: isSelected
                          ? "2px solid #2563eb"
                          : "1px solid #d1d5db",
                        cursor:
                          status === "full" || status === "past"
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>

              <div style={legendStyle}>
                <span>🟢 Available</span>
                <span>🟡 Partially reserved</span>
                <span>🔴 Full</span>
                <span>⚪ Past</span>
              </div>
            </div>

            {selectedDate && (
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Select Time Slot</label>

                <div style={slotGridStyle}>
                  {WORKING_HOURS.map((slot) => {
                    const slotStart = new Date(`${selectedDate}T${slot.start}:00`);
                    const isPastSlot = slotStart < new Date();
                    const available = getAvailableInSlot(selectedDate, slot);
                    const disabled = available === 0 || isPastSlot;
                    const isSelected =
                      selectedSlot?.start === slot.start &&
                      selectedSlot?.end === slot.end;

                    return (
                      <button
                        key={`${slot.start}-${slot.end}`}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={disabled}
                        style={{
                          ...slotButtonStyle,
                          backgroundColor: disabled ? "#fee2e2" : "#dcfce7",
                          color: disabled ? "#991b1b" : "#166534",
                          border: isSelected
                            ? "2px solid #2563eb"
                            : "1px solid transparent",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.65 : 1,
                        }}
                      >
                        {slot.start} - {slot.end}
                        <br />
                        <span style={{ fontSize: "12px" }}>
                          {disabled ? (available === 0 ? "No stock" : "Past") : `${available} available`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <p style={{ color: "#dc2626", marginBottom: "12px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Rezervasyon oluşturuluyor..." : "Reserve"}
        </button>
      </form>
    </MainLayout>
  );
}

function getDateStyle(status) {
  if (status === "available") {
    return {
      backgroundColor: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "partial") {
    return {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "full") {
    return {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    };
  }

  if (status === "past") {
    return {
      backgroundColor: "#f3f4f6",
      color: "#9ca3af",
    };
  }

  return {
    backgroundColor: "#f9fafb",
    color: "#374151",
  };
}

const formCardStyle = {
  maxWidth: "820px",
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

const monthHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "14px",
};

const monthButtonStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  cursor: "pointer",
  fontWeight: "bold",
};

const calendarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
};

const dateButtonStyle = {
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
};

const legendStyle = {
  display: "flex",
  gap: "16px",
  marginTop: "12px",
  fontSize: "14px",
  color: "#6b7280",
  flexWrap: "wrap",
};

const slotGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: "10px",
};

const slotButtonStyle = {
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
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