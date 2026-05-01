const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/equipment - List all equipment
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [equipment] = await pool.query(`
      SELECT 
        e.equipment_id,
        e.equipment_name,
        e.equipment_code,
        e.status,
        e.description,
        e.quantity,
        e.faulty_count,
        l.lab_id,
        l.lab_name,
        l.building,
        l.room_no
      FROM equipment e
      JOIN laboratories l ON e.lab_id = l.lab_id
      ORDER BY l.lab_name, e.equipment_name
    `);

    res.json(equipment.map(eq => ({
      id: eq.equipment_id,
      name: eq.equipment_name,
      code: eq.equipment_code,
      status: eq.status,
      description: eq.description,
      labId: eq.lab_id,
      quantity: eq.quantity,
      faultyCount: eq.faulty_count,
      availableTotal: Math.max(0, eq.quantity - eq.faulty_count),
      location: `${eq.lab_name} (${eq.building} - Room ${eq.room_no})`,
    })));
  } catch (err) {
    console.error("[EQUIPMENT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/equipment/:id - Get equipment details
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [equipment] = await pool.query(`
      SELECT 
        e.equipment_id,
        e.equipment_name,
        e.equipment_code,
        e.status,
        e.description,
        e.quantity,
        e.faulty_count,
        l.lab_id,
        l.lab_name,
        l.building,
        l.room_no
      FROM equipment e
      JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE e.equipment_id = ?
    `, [req.params.id]);

    if (equipment.length === 0) {
      return res.status(404).json({ message: "Ekipman bulunamadı." });
    }

    const eq = equipment[0];
    res.json({
      id: eq.equipment_id,
      name: eq.equipment_name,
      code: eq.equipment_code,
      status: eq.status,
      description: eq.description,
      quantity: eq.quantity,
      faultyCount: eq.faulty_count,
      availableTotal: Math.max(0, eq.quantity - eq.faulty_count),
      location: `${eq.lab_name} (${eq.building} - Room ${eq.room_no})`,
    });
  } catch (err) {
    console.error("[EQUIPMENT DETAIL ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/equipment/:id/availability - Get available quantity for time slot
// ─────────────────────────────────────────────
router.get("/:id/availability", async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Start time and end time are required." });
    }

    const [equipment] = await pool.query(
      "SELECT quantity, faulty_count FROM equipment WHERE equipment_id = ?",
      [req.params.id]
    );

    if (equipment.length === 0) {
      return res.status(404).json({ message: "Ekipman bulunamadı." });
    }

    const totalQuantity = equipment[0].quantity;
    const faultyCount = equipment[0].faulty_count;
    const workingQuantity = Math.max(0, totalQuantity - faultyCount);

    // Count active reservations in this time slot
    const [reservations] = await pool.query(
      `
      SELECT COUNT(*) as reserved_count
      FROM reservations
      WHERE equipment_id = ?
        AND status = 'active'
        AND start_time < ?
        AND end_time > ?
      `,
      [req.params.id, endTime, startTime]
    );

    const reservedCount = reservations[0].reserved_count;
    const available = Math.max(0, workingQuantity - reservedCount);

    res.json({
      totalQuantity,
      faultyCount,
      workingQuantity,
      reservedInSlot: reservedCount,
      available,
    });
  } catch (err) {
    console.error("[EQUIPMENT AVAILABILITY ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
