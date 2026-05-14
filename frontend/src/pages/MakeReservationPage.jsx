import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getEquipments } from "../services/equipmentService";
import { createReservation, getReservationsByEquipment } from "../services/reservationService";
import { useLanguage } from "../context/LanguageContext";

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
  const { t, language } = useLanguage();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [equipmentReservations, setEquipmentReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEquipments() {
      try {
        const data = await getEquipments();
        setEquipments(data);
      } catch (err) {
        setError(err.message || t("makeRes.errLoadEquip"));
      }
    }
    loadEquipments();
  }, []);

  useEffect(() => {
    async function loadEquipmentReservations() {
      if (!selectedEquipmentId) { setEquipmentReservations([]); return; }
      try {
        const data = await getReservationsByEquipment(selectedEquipmentId);
        setEquipmentReservations(data);
      } catch { setEquipmentReservations([]); }
    }
    loadEquipmentReservations();
  }, [selectedEquipmentId]);

  const selectedEquipment = equipments.find((eq) => eq.id === Number(selectedEquipmentId));

  const getAvailableInSlot = (date, slot) => {
    if (!selectedEquipment) return 0;
    const qty = Math.max(0, selectedEquipment.quantity - selectedEquipment.faultyCount);
    const slotStart = new Date(`${date}T${slot.start}:00`);
    const slotEnd = new Date(`${date}T${slot.end}:00`);
    const reserved = equipmentReservations.filter((r) => {
      const rStart = new Date(r.start_time);
      const rEnd = new Date(r.end_time);
      return rStart < slotEnd && rEnd > slotStart;
    }).length;
    return Math.max(0, qty - reserved);
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getMonthName = () =>
    currentMonth.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", { month: "long", year: "numeric" });

  const getMonthDateList = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    const dates = [];
    for (let d = 1; d <= last; d++) dates.push(formatDate(new Date(y, m, d)));
    return dates;
  };

  const isPastDate = (date) => new Date(`${date}T23:59:59`) < new Date();

  const isSlotReserved = (date, slot) => {
    const slotStart = new Date(`${date}T${slot.start}:00`);
    const slotEnd = new Date(`${date}T${slot.end}:00`);
    return equipmentReservations.some((r) => {
      const rStart = new Date(r.start_time);
      const rEnd = new Date(r.end_time);
      return rStart < slotEnd && rEnd > slotStart;
    });
  };

  const getDayStatus = (date) => {
    if (!selectedEquipmentId) return "empty";
    if (isPastDate(date)) return "past";
    const reservedCount = WORKING_HOURS.filter((s) => isSlotReserved(date, s)).length;
    if (reservedCount === 0) return "available";
    if (reservedCount === WORKING_HOURS.length) return "full";
    return "partial";
  };

  const goToPreviousMonth = () => {
    const today = new Date();
    const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (current <= thisMonth) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(""); setSelectedSlot(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(""); setSelectedSlot(null);
  };

  const handleEquipmentChange = (e) => {
    setSelectedEquipmentId(e.target.value);
    setSelectedDate(""); setSelectedSlot(null);
    setCurrentMonth(new Date()); setError("");
  };

  const handleDateSelect = (date) => {
    const status = getDayStatus(date);
    if (status === "full" || status === "past") return;
    setSelectedDate(date); setSelectedSlot(null); setError("");
  };

  const handleSlotSelect = (slot) => {
    if (!selectedDate) return;
    if (getAvailableInSlot(selectedDate, slot) === 0) return;
    setSelectedSlot(slot); setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!selectedEquipment || !selectedDate || !selectedSlot) { setError(t("makeRes.errSelect")); return; }
    if (selectedEquipment.availableTotal === 0) { setError(t("makeRes.errUnavailable")); return; }
    const startTime = `${selectedDate}T${selectedSlot.start}:00`;
    const endTime = `${selectedDate}T${selectedSlot.end}:00`;
    if (new Date(startTime) < new Date()) { setError(t("makeRes.errPastDate")); return; }
    setLoading(true);
    try {
      await createReservation(selectedEquipment.id, startTime, endTime);
      navigate("/reservations");
    } catch (err) {
      setError(err.message || t("makeRes.errFailed"));
    } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>{t("makeRes.title")}</h1>
        <p style={{ color: "#6b7280" }}>{t("makeRes.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} style={formCardStyle}>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>{t("makeRes.equipment")}</label>
          <select value={selectedEquipmentId} onChange={handleEquipmentChange} required style={inputStyle}>
            <option value="">{t("makeRes.selectEquipment")}</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} - {eq.availableTotal || 0} {t("makeRes.available")}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>{t("makeRes.location")}</label>
          <input type="text" value={selectedEquipment ? selectedEquipment.location : ""} readOnly style={inputStyle} />
        </div>

        {selectedEquipment && (
          <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e40af" }}>
              <strong>{t("makeRes.totalQty")}</strong> {selectedEquipment.quantity}
            </p>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e40af" }}>
              <strong>{t("makeRes.faultyUnits")}</strong> {selectedEquipment.faultyCount}
            </p>
            <p style={{ margin: "0", fontSize: "14px", color: selectedEquipment.availableTotal > 0 ? "#166534" : "#991b1b" }}>
              <strong>{t("makeRes.availableForRes")}</strong>{" "}
              {selectedEquipment.availableTotal > 0 ? selectedEquipment.availableTotal : t("makeRes.allBroken")}
            </p>
          </div>
        )}

        {selectedEquipmentId && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>{t("makeRes.selectDate")}</label>
              <div style={monthHeaderStyle}>
                <button type="button" onClick={goToPreviousMonth} style={monthButtonStyle}>{t("makeRes.previous")}</button>
                <strong>{getMonthName()}</strong>
                <button type="button" onClick={goToNextMonth} style={monthButtonStyle}>{t("makeRes.next")}</button>
              </div>
              <div style={calendarGridStyle}>
                {getMonthDateList().map((date) => {
                  const status = getDayStatus(date);
                  const isSelected = selectedDate === date;
                  return (
                    <button key={date} type="button" onClick={() => handleDateSelect(date)}
                      disabled={status === "full" || status === "past"}
                      style={{ ...dateButtonStyle, ...getDateStyle(status),
                        border: isSelected ? "2px solid #2563eb" : "1px solid #d1d5db",
                        cursor: status === "full" || status === "past" ? "not-allowed" : "pointer",
                      }}>
                      {date}
                    </button>
                  );
                })}
              </div>
              <div style={legendStyle}>
                <span>{t("makeRes.legendAvailable")}</span>
                <span>{t("makeRes.legendPartial")}</span>
                <span>{t("makeRes.legendFull")}</span>
                <span>{t("makeRes.legendPast")}</span>
              </div>
            </div>

            {selectedDate && (
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>{t("makeRes.selectTimeSlot")}</label>
                <div style={slotGridStyle}>
                  {WORKING_HOURS.map((slot) => {
                    const slotStart = new Date(`${selectedDate}T${slot.start}:00`);
                    const isPastSlot = slotStart < new Date();
                    const available = getAvailableInSlot(selectedDate, slot);
                    const disabled = available === 0 || isPastSlot;
                    const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                    return (
                      <button key={`${slot.start}-${slot.end}`} type="button" onClick={() => handleSlotSelect(slot)}
                        disabled={disabled}
                        style={{ ...slotButtonStyle,
                          backgroundColor: disabled ? "#fee2e2" : "#dcfce7",
                          color: disabled ? "#991b1b" : "#166534",
                          border: isSelected ? "2px solid #2563eb" : "1px solid transparent",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.65 : 1,
                        }}>
                        {slot.start} - {slot.end}
                        <br />
                        <span style={{ fontSize: "12px" }}>
                          {disabled ? (available === 0 ? t("makeRes.noStock") : t("makeRes.past")) : `${available} ${t("makeRes.available")}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {error && <p style={{ color: "#dc2626", marginBottom: "12px", fontSize: "14px" }}>{error}</p>}
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? t("makeRes.loading") : t("makeRes.submit")}
        </button>
      </form>
    </MainLayout>
  );
}

function getDateStyle(status) {
  if (status === "available") return { backgroundColor: "#dcfce7", color: "#166534" };
  if (status === "partial") return { backgroundColor: "#fef3c7", color: "#92400e" };
  if (status === "full") return { backgroundColor: "#fee2e2", color: "#991b1b" };
  if (status === "past") return { backgroundColor: "#f3f4f6", color: "#9ca3af" };
  return { backgroundColor: "#f9fafb", color: "#374151" };
}

const formCardStyle = { maxWidth: "820px", backgroundColor: "#ffffff", padding: "26px", border: "1px solid #e5e7eb", borderRadius: "14px", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "bold" };
const inputStyle = { width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "#fff" };
const monthHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" };
const monthButtonStyle = { padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", cursor: "pointer", fontWeight: "bold" };
const calendarGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" };
const dateButtonStyle = { padding: "12px", borderRadius: "10px", fontWeight: "bold" };
const legendStyle = { display: "flex", gap: "16px", marginTop: "12px", fontSize: "14px", color: "#6b7280", flexWrap: "wrap" };
const slotGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" };
const slotButtonStyle = { padding: "12px", borderRadius: "10px", fontWeight: "bold" };
const buttonStyle = { width: "100%", padding: "12px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" };

export default MakeReservationPage;