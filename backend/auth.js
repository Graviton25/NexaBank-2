const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const AUTH_FILE = path.join(__dirname, "auth.json");

function getUsers() {
  return JSON.parse(
    fs.readFileSync(AUTH_FILE, "utf8")
  ).users;
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

function login(username, password) {

  const users = getUsers();

  const user = users.find(
    user => user.username === username
  );

  if (!user) {
    return null;
  }

  if (
    !verifyPassword(
      password,
      user.salt,
      user.passwordHash
    )
  ) {
    return null;
  }

  return user;
}

module.exports = {
  login
};
