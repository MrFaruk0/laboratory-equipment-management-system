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
      location: `${eq.lab_name} (${eq.building} - Room ${eq.room_no})`,
    });
  } catch (err) {
    console.error("[EQUIPMENT DETAIL ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
