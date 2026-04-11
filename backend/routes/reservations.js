const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/reservations - Create new reservation
// ─────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  const { equipmentId, startTime, endTime } = req.body;
  const userId = req.user.userId;

  if (!equipmentId || !startTime || !endTime) {
    return res.status(400).json({ message: "Equipment, start time, and end time are required." });
  }

  try {
    // Check if start time is in the past
    const now = new Date();
    const reservationStart = new Date(startTime);
    
    if (reservationStart < now) {
      return res.status(400).json({ message: "Geçmiş bir tarihte rezervasyon yapılamaz." });
    }

    // Check if end time is after start time
    const reservationEnd = new Date(endTime);
    if (reservationEnd <= reservationStart) {
      return res.status(400).json({ message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır." });
    }

    // Check if equipment exists
    const [equipmentCheck] = await pool.query(
      "SELECT equipment_id FROM equipment WHERE equipment_id = ?",
      [equipmentId]
    );
    if (equipmentCheck.length === 0) {
      return res.status(404).json({ message: "Ekipman bulunamadı." });
    }

    // Check for reservation conflicts
    const [conflicts] = await pool.query(`
      SELECT reservation_id FROM reservations
      WHERE equipment_id = ? 
        AND status = 'active'
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `, [equipmentId, endTime, startTime, endTime, startTime, startTime, endTime]);

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Bu zaman aralığında çakışan bir rezervasyon var." });
    }

    // Check for blocked time slots
    const [blockedSlots] = await pool.query(`
      SELECT block_id FROM blocked_time_slots
      WHERE equipment_id = ?
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `, [equipmentId, endTime, startTime, endTime, startTime, startTime, endTime]);

    if (blockedSlots.length > 0) {
      return res.status(409).json({ message: "Bu zaman aralığında ders saati veya bakım planı var." });
    }

    // Create reservation
    const [result] = await pool.query(
      `INSERT INTO reservations (user_id, equipment_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [userId, equipmentId, startTime, endTime]
    );

    res.status(201).json({
      message: "Rezervasyon başarıyla oluşturuldu.",
      reservationId: result.insertId,
    });
  } catch (err) {
    console.error("[CREATE RESERVATION ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/reservations - Get user's reservations
// ─────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [reservations] = await pool.query(`
      SELECT 
        r.reservation_id,
        r.user_id,
        r.equipment_id,
        r.start_time,
        r.end_time,
        r.status,
        r.created_at,
        e.equipment_name,
        e.equipment_code,
        e.status as equipment_status,
        l.lab_name,
        l.building,
        l.room_no
      FROM reservations r
      JOIN equipment e ON r.equipment_id = e.equipment_id
      JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE r.user_id = ?
      ORDER BY r.start_time DESC
    `, [userId]);

    // Separate active and past reservations
    const now = new Date();
    const active = [];
    const past = [];

    reservations.forEach(res => {
      const reservation = {
        id: res.reservation_id,
        equipmentId: res.equipment_id,
        equipment: res.equipment_name,
        code: res.equipment_code,
        equipmentStatus: res.equipment_status,
        location: `${res.lab_name} (${res.building} - Room ${res.room_no})`,
        startTime: res.start_time,
        endTime: res.end_time,
        status: res.status,
      };

      if (new Date(res.end_time) > now) {
        active.push(reservation);
      } else {
        past.push(reservation);
      }
    });

    res.json({ active, past });
  } catch (err) {
    console.error("[GET RESERVATIONS ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/reservations/:id - Get single reservation
// ─────────────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const reservationId = req.params.id;

  try {
    const [reservations] = await pool.query(`
      SELECT 
        r.reservation_id,
        r.user_id,
        r.equipment_id,
        r.start_time,
        r.end_time,
        r.status,
        r.created_at,
        e.equipment_name,
        e.equipment_code,
        e.status as equipment_status,
        l.lab_name,
        l.building,
        l.room_no
      FROM reservations r
      JOIN equipment e ON r.equipment_id = e.equipment_id
      JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE r.reservation_id = ? AND r.user_id = ?
    `, [reservationId, userId]);

    if (reservations.length === 0) {
      return res.status(404).json({ message: "Rezervasyon bulunamadı." });
    }

    const r = reservations[0];
    res.json({
      id: r.reservation_id,
      equipmentId: r.equipment_id,
      equipment: r.equipment_name,
      code: r.equipment_code,
      equipmentStatus: r.equipment_status,
      location: `${r.lab_name} (${r.building} - Room ${r.room_no})`,
      startTime: r.start_time,
      endTime: r.end_time,
      status: r.status,
    });
  } catch (err) {
    console.error("[GET RESERVATION ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/reservations/:id - Cancel reservation
// ─────────────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const reservationId = req.params.id;

  try {
    const [reservation] = await pool.query(
      "SELECT user_id, status FROM reservations WHERE reservation_id = ?",
      [reservationId]
    );

    if (reservation.length === 0) {
      return res.status(404).json({ message: "Rezervasyon bulunamadı." });
    }

    if (reservation[0].user_id !== userId) {
      return res.status(403).json({ message: "Bu rezervasyonu iptal edemezsiniz." });
    }

    if (reservation[0].status === "cancelled") {
      return res.status(400).json({ message: "Bu rezervasyon zaten iptal edilmiş." });
    }

    await pool.query(
      "UPDATE reservations SET status = 'cancelled' WHERE reservation_id = ?",
      [reservationId]
    );

    res.json({ message: "Rezervasyon başarıyla iptal edildi." });
  } catch (err) {
    console.error("[CANCEL RESERVATION ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
