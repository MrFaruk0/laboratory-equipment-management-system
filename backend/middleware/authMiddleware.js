const jwt = require("jsonwebtoken");

/**
 * Korumalı route'lar için JWT doğrulama middleware'i.
 * Authorization: Bearer <token> header'ı beklenir.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Token bulunamadı. Lütfen giriş yapın." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, roleId }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Geçersiz veya süresi dolmuş token." });
  }
}

module.exports = authMiddleware;
