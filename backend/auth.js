const crypto = require("crypto");
const { pool } = require("./database");

function verifyPassword(password, salt, storedHash) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

async function login(username, password) {
  const result = await pool.query(
    `SELECT id, username, salt, password_hash, name, account_number
     FROM users
     WHERE username = $1
     LIMIT 1`,
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  if (
    !verifyPassword(
      password,
      user.salt,
      user.password_hash
    )
  ) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    accountNumber: user.account_number
  };
}

module.exports = {
  login
};
