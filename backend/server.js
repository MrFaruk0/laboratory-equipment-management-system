const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const equipmentRoutes = require("./routes/equipment");
const reservationRoutes = require("./routes/reservations");
const adminRoutes = require("./routes/admin");

const app = express();

// CORS — sadece frontend'e izin ver
app.use(cors({ origin: "http://localhost:5173" }));

// JSON body parser
app.use(express.json());

// Route'lar
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);

// Sağlık kontrolü
app.get("/", (req, res) => {
  res.json({ message: "LEMS API çalışıyor." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server http://localhost:${PORT} adresinde çalışıyor.`);
});
