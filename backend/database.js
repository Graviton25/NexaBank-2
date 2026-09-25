const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      account_number TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      account_number TEXT PRIMARY KEY,
      account_type TEXT NOT NULL,
      balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'ETB',
      status TEXT NOT NULL DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id BIGINT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC(15, 2) NOT NULL,
      date TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL
    );
  `);
}

async function getAccount() {
  const result = await pool.query(
    "SELECT account_number, account_type, balance, currency, status FROM accounts LIMIT 1"
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    accountNumber: row.account_number,
    accountType: row.account_type,
    balance: Number(row.balance),
    currency: row.currency,
    status: row.status
  };
}

async function getTransactions() {
  const result = await pool.query(`
    SELECT id, type, description, amount, date, status
    FROM transactions
    ORDER BY date DESC
  `);

  return result.rows.map(row => ({
    id: Number(row.id),
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    date: row.date.toISOString(),
    status: row.status
  }));
}

async function updateBalance(accountNumber, balance) {
  await pool.query("UPDATE accounts SET balance = $1 WHERE account_number = $2", [balance, accountNumber]);
}

async function addTransaction(transaction) {
  await pool.query(
    "INSERT INTO transactions (id, type, description, amount, date, status) VALUES ($1, $2, $3, $4, $5, $6)",
    [transaction.id, transaction.type, transaction.description, transaction.amount, transaction.date, transaction.status]
  );
}

module.exports = {
  pool,
  initializeDatabase,
  getAccount,
  getTransactions,
  updateBalance,
  addTransaction
};
