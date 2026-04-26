/**
 * Admin guard middleware.
 * Must be used AFTER authMiddleware so req.user is already populated.
 * Allows only users with roleId === 4 (admin) to proceed.
 */
function adminMiddleware(req, res, next) {
  if (req.user?.roleId !== 4) {
    return res.status(403).json({ message: "Bu işlem için admin yetkisi gereklidir." });
  }
  next();
}

module.exports = adminMiddleware;
