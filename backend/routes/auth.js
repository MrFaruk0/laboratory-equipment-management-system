const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email ve şifre gereklidir." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email veya şifre hatalı." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Email veya şifre hatalı." });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, roleId: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        roleId: user.role_id,
      },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (!username || !fullName || !email || !password) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  try {
    // Email veya username zaten var mı?
    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Bu email veya kullanıcı adı zaten kullanılıyor." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Yeni kullanıcıya varsayılan rol: student (role_id = 1)
    const [result] = await pool.query(
      "INSERT INTO users (role_id, username, email, password_hash, full_name) VALUES (?, ?, ?, ?, ?)",
      [1, username, email, passwordHash, fullName]
    );

    res.status(201).json({
      message: "Hesap başarıyla oluşturuldu.",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/change-password  (korumalı)
// ─────────────────────────────────────────────
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Mevcut ve yeni şifre gereklidir." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Mevcut şifre hatalı." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [newHash, userId]);

    res.json({ success: true, message: "Şifre başarıyla değiştirildi." });
  } catch (err) {
    console.error("[CHANGE-PASSWORD ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me  (korumalı)
// ─────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, username, email, full_name, role_id FROM users WHERE user_id = ?",
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const user = rows[0];
    res.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
    });
  } catch (err) {
    console.error("[ME ERROR]", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
