const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// CORS — sadece frontend'e izin ver
app.use(cors({ origin: "http://localhost:5173" }));

// JSON body parser
app.use(express.json());

// Route'lar
app.use("/api/auth", authRoutes);

// Sağlık kontrolü
app.get("/", (req, res) => {
  res.json({ message: "LEMS API çalışıyor." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server http://localhost:${PORT} adresinde çalışıyor.`);
});
