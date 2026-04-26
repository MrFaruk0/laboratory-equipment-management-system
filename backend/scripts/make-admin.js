/**
 * make-admin.js — CLI script to promote a user to admin role.
 *
 * Usage (run from the `backend/` directory):
 *   node scripts/make-admin.js <email>
 *
 * Example:
 *   node scripts/make-admin.js admin@uni.edu
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const pool = require("../config/db");

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌  Usage: node scripts/make-admin.js <email>");
    process.exit(1);
  }

  try {
    const [rows] = await pool.query(
      "SELECT user_id, username, full_name, role_id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.error(`❌  No user found with email: ${email}`);
      process.exit(1);
    }

    const user = rows[0];

    if (user.role_id === 4) {
      console.log(`ℹ️   ${user.full_name} (${email}) is already an admin.`);
      process.exit(0);
    }

    await pool.query("UPDATE users SET role_id = 4 WHERE user_id = ?", [user.user_id]);

    console.log(`✅  Successfully promoted ${user.full_name} (@${user.username}, ${email}) to admin.`);
  } catch (err) {
    console.error("❌  Database error:", err.message);
    process.exit(1);
  } finally {
    pool.end();
  }
}

makeAdmin();
