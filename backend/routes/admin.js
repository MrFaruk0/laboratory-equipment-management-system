const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ─────────────────────────────────────────────
// GET /api/admin/stats — Dashboard statistics
// ─────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [[equipmentStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'available')   AS available,
        SUM(status = 'in_use')      AS in_use,
        SUM(status = 'maintenance') AS maintenance,
        SUM(status = 'faulty')      AS faulty
      FROM equipment
    `);

    const [[reservationStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'active')    AS active,
        SUM(status = 'cancelled') AS cancelled,
        SUM(status = 'completed') AS completed
      FROM reservations
    `);

    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(role_id = 1) AS students,
        SUM(role_id = 2) AS assistants,
        SUM(role_id = 3) AS technicians,
        SUM(role_id = 4) AS admins
      FROM users
    `);

    const [[labCount]] = await pool.query(`SELECT COUNT(*) AS total FROM laboratories`);

    res.json({
      equipment: equipmentStats,
      reservations: reservationStats,
      users: userStats,
      labs: labCount,
    });
  } catch (err) {
    console.error("[ADMIN STATS ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/equipment — List all equipment
// ─────────────────────────────────────────────
router.get("/equipment", async (req, res) => {
  try {
    const [equipment] = await pool.query(`
      SELECT
        e.equipment_id,
        e.equipment_name,
        e.equipment_code,
        e.status,
        e.description,
        e.lab_id,
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
      labName: eq.lab_name,
      building: eq.building,
      roomNo: eq.room_no,
      location: `${eq.lab_name} (${eq.building} - Room ${eq.room_no})`,
    })));
  } catch (err) {
    console.error("[ADMIN GET EQUIPMENT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/equipment — Add new equipment
// ─────────────────────────────────────────────
router.post("/equipment", async (req, res) => {
  const { name, code, labId, status, description } = req.body;

  if (!name || !code || !labId) {
    return res.status(400).json({ message: "Ekipman adı, kodu ve laboratuvar zorunludur." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO equipment (equipment_name, equipment_code, lab_id, status, description)
       VALUES (?, ?, ?, ?, ?)`,
      [name, code, labId, status || "available", description || null]
    );

    res.status(201).json({ message: "Ekipman eklendi.", equipmentId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Bu ekipman kodu zaten kullanılıyor." });
    }
    console.error("[ADMIN ADD EQUIPMENT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// PUT /api/admin/equipment/:id — Edit equipment
// ─────────────────────────────────────────────
router.put("/equipment/:id", async (req, res) => {
  const { name, code, labId, status, description } = req.body;
  const equipmentId = req.params.id;

  if (!name || !code || !labId || !status) {
    return res.status(400).json({ message: "Tüm zorunlu alanları doldurunuz." });
  }

  try {
    const [result] = await pool.query(
      `UPDATE equipment
       SET equipment_name = ?, equipment_code = ?, lab_id = ?, status = ?, description = ?
       WHERE equipment_id = ?`,
      [name, code, labId, status, description || null, equipmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ekipman bulunamadı." });
    }

    res.json({ message: "Ekipman güncellendi." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Bu ekipman kodu zaten kullanılıyor." });
    }
    console.error("[ADMIN EDIT EQUIPMENT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// PUT /api/admin/equipment/:id/status — Quick status change
// ─────────────────────────────────────────────
router.put("/equipment/:id/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["available", "in_use", "maintenance", "faulty"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Geçersiz durum değeri." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE equipment SET status = ? WHERE equipment_id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ekipman bulunamadı." });
    }

    res.json({ message: "Durum güncellendi." });
  } catch (err) {
    console.error("[ADMIN STATUS UPDATE ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/equipment/:id — Delete equipment
// ─────────────────────────────────────────────
router.delete("/equipment/:id", async (req, res) => {
  try {
    // Cancel related active reservations first
    await pool.query(
      "UPDATE reservations SET status = 'cancelled' WHERE equipment_id = ? AND status = 'active'",
      [req.params.id]
    );

    const [result] = await pool.query(
      "DELETE FROM equipment WHERE equipment_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ekipman bulunamadı." });
    }

    res.json({ message: "Ekipman silindi." });
  } catch (err) {
    console.error("[ADMIN DELETE EQUIPMENT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/reservations — All reservations
// ─────────────────────────────────────────────
router.get("/reservations", async (req, res) => {
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
        u.username,
        u.full_name,
        u.email,
        e.equipment_name,
        e.equipment_code,
        l.lab_name,
        l.building,
        l.room_no
      FROM reservations r
      JOIN users u ON r.user_id = u.user_id
      JOIN equipment e ON r.equipment_id = e.equipment_id
      JOIN laboratories l ON e.lab_id = l.lab_id
      ORDER BY r.start_time DESC
    `);

    res.json(reservations.map(r => ({
      id: r.reservation_id,
      userId: r.user_id,
      username: r.username,
      userFullName: r.full_name,
      userEmail: r.email,
      equipmentId: r.equipment_id,
      equipment: r.equipment_name,
      code: r.equipment_code,
      location: `${r.lab_name} (${r.building} - Room ${r.room_no})`,
      startTime: r.start_time,
      endTime: r.end_time,
      status: r.status,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error("[ADMIN GET RESERVATIONS ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/reservations/:id — Cancel any reservation
// ─────────────────────────────────────────────
router.delete("/reservations/:id", async (req, res) => {
  try {
    const [reservation] = await pool.query(
      "SELECT status FROM reservations WHERE reservation_id = ?",
      [req.params.id]
    );

    if (reservation.length === 0) {
      return res.status(404).json({ message: "Rezervasyon bulunamadı." });
    }

    if (reservation[0].status === "cancelled") {
      return res.status(400).json({ message: "Bu rezervasyon zaten iptal edilmiş." });
    }

    await pool.query(
      "UPDATE reservations SET status = 'cancelled' WHERE reservation_id = ?",
      [req.params.id]
    );

    res.json({ message: "Rezervasyon iptal edildi." });
  } catch (err) {
    console.error("[ADMIN CANCEL RESERVATION ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/users — All users
// ─────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.full_name,
        u.role_id,
        u.created_at,
        r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.created_at DESC
    `);

    res.json(users.map(u => ({
      id: u.user_id,
      username: u.username,
      email: u.email,
      fullName: u.full_name,
      roleId: u.role_id,
      roleName: u.role_name,
      createdAt: u.created_at,
    })));
  } catch (err) {
    console.error("[ADMIN GET USERS ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// PUT /api/admin/users/:id/role — Change user role
// ─────────────────────────────────────────────
router.put("/users/:id/role", async (req, res) => {
  const { roleId } = req.body;
  const targetUserId = req.params.id;

  // Prevent admin from demoting themselves
  if (Number(targetUserId) === req.user.userId && roleId !== 4) {
    return res.status(400).json({ message: "Kendi admin rolünüzü düşüremezsiniz." });
  }

  if (![1, 2, 3, 4].includes(Number(roleId))) {
    return res.status(400).json({ message: "Geçersiz rol." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET role_id = ? WHERE user_id = ?",
      [roleId, targetUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.json({ message: "Kullanıcı rolü güncellendi." });
  } catch (err) {
    console.error("[ADMIN CHANGE ROLE ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/labs — List all laboratories
// ─────────────────────────────────────────────
router.get("/labs", async (req, res) => {
  try {
    const [labs] = await pool.query("SELECT * FROM laboratories ORDER BY lab_name");
    res.json(labs.map(l => ({
      id: l.lab_id,
      name: l.lab_name,
      building: l.building,
      roomNo: l.room_no,
    })));
  } catch (err) {
    console.error("[ADMIN GET LABS ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/labs — Add laboratory
// ─────────────────────────────────────────────
router.post("/labs", async (req, res) => {
  const { name, building, roomNo } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Laboratuvar adı zorunludur." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO laboratories (lab_name, building, room_no) VALUES (?, ?, ?)",
      [name, building || null, roomNo || null]
    );

    res.status(201).json({ message: "Laboratuvar eklendi.", labId: result.insertId });
  } catch (err) {
    console.error("[ADMIN ADD LAB ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/blocked-slots — List all blocked time slots
// ─────────────────────────────────────────────
router.get("/blocked-slots", async (req, res) => {
  try {
    const [slots] = await pool.query(`
      SELECT b.*, e.equipment_name, e.equipment_code
      FROM blocked_time_slots b
      JOIN equipment e ON b.equipment_id = e.equipment_id
      ORDER BY b.start_time DESC
    `);

    res.json(slots.map(s => ({
      id: s.block_id,
      equipmentId: s.equipment_id,
      equipmentName: s.equipment_name,
      equipmentCode: s.equipment_code,
      startTime: s.start_time,
      endTime: s.end_time,
      reason: s.reason,
    })));
  } catch (err) {
    console.error("[ADMIN GET BLOCKED SLOTS ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/blocked-slots — Add blocked time slot
// ─────────────────────────────────────────────
router.post("/blocked-slots", async (req, res) => {
  const { equipmentId, startTime, endTime, reason } = req.body;

  if (!equipmentId || !startTime || !endTime) {
    return res.status(400).json({ message: "Ekipman, başlangıç ve bitiş zamanı zorunludur." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO blocked_time_slots (equipment_id, start_time, end_time, reason) VALUES (?, ?, ?, ?)",
      [equipmentId, startTime, endTime, reason || null]
    );

    res.status(201).json({ message: "Zaman dilimi engellendi.", blockId: result.insertId });
  } catch (err) {
    console.error("[ADMIN ADD BLOCKED SLOT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/blocked-slots/:id — Remove blocked time slot
// ─────────────────────────────────────────────
router.delete("/blocked-slots/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM blocked_time_slots WHERE block_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Engellenen zaman dilimi bulunamadı." });
    }

    res.json({ message: "Engellenen zaman dilimi kaldırıldı." });
  } catch (err) {
    console.error("[ADMIN DELETE BLOCKED SLOT ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
