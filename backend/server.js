const express = require("express");
const cors = require("cors");
const { getAccount, getTransactions, updateBalance, addTransaction, pool, initializeDatabase } = require("./database");
const { login } = require("./auth");
const { createSession, getSession, deleteSession } = require("./sessions");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function getData() {
  const account = await getAccount();
  const transactions = await getTransactions();
  return { account, transactions };
}

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = await login(username, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = createSession(user.id);

  res.json({
    message: "Login successful.",
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      accountNumber: user.accountNumber
    }
  });
});
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const session = getSession(token);

  if (!session) {
    return res.status(401).json({ message: "Authentication required." });
  }

  req.userId = session.userId;
  req.token = token;
  next();
}

app.post("/api/logout", authenticate, (req, res) => {
  deleteSession(req.token);
  res.json({ message: "Logged out successfully." });
});

app.get("/", (req, res) => {
  res.json({
    message: "NexaBank API is running",
    status: "OK"
  });
});

// Account
app.get("/api/account", authenticate, async (req, res) => {
  const data = await getData();
  res.json(data.account);
});

// Transactions
app.get("/api/transactions", authenticate, async (req, res) => {
  const data = await getData();
  res.json(data.transactions);
});

// Deposit
app.post("/api/deposit", authenticate, async (req, res) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    return res.status(400).json({
      message: "Amount must be between 1 and 1,000,000 ETB."
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: "Invalid deposit amount."
    });
  }

  const data = await getData();

  data.account.balance += amount;

  const transaction = {
    id: Date.now(),
    type: "Deposit",
    description: "Cash Deposit",
    amount: amount,
    date: new Date().toISOString(),
    status: "Completed"
  };

  data.transactions.unshift(transaction);

  await updateBalance(data.account.accountNumber, data.account.balance);
  await addTransaction(transaction);

  res.json({
    message: "Deposit successful.",
    balance: data.account.balance,
    transaction
  });
});

// Withdraw
app.post("/api/withdraw", authenticate, async (req, res) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    return res.status(400).json({
      message: "Amount must be between 1 and 1,000,000 ETB."
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: "Invalid withdrawal amount."
    });
  }

  const data = await getData();

  if (amount > data.account.balance) {
    return res.status(400).json({
      message: "Insufficient balance."
    });
  }

  data.account.balance -= amount;

  const transaction = {
    id: Date.now(),
    type: "Withdrawal",
    description: "Cash Withdrawal",
    amount: amount,
    date: new Date().toISOString(),
    status: "Completed"
  };

  data.transactions.unshift(transaction);

  await updateBalance(data.account.accountNumber, data.account.balance);
  await addTransaction(transaction);

  res.json({
    message: "Withdrawal successful.",
    balance: data.account.balance,
    transaction
  });
});

// Transfer
app.post("/api/transfer", authenticate, async (req, res) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    return res.status(400).json({
      message: "Amount must be between 1 and 1,000,000 ETB."
    });
  }
  const recipient = req.body.recipient;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: "Invalid transfer amount."
    });
  }

  if (!recipient) {
    return res.status(400).json({
      message: "Recipient is required."
    });
  }

  const data = await getData();

  if (amount > data.account.balance) {
    return res.status(400).json({
      message: "Insufficient balance."
    });
  }

  data.account.balance -= amount;

  const transaction = {
    id: Date.now(),
    type: "Transfer",
    description: `Transfer to ${recipient}`,
    amount: amount,
    date: new Date().toISOString(),
    status: "Completed"
  };

  data.transactions.unshift(transaction);

  await updateBalance(data.account.accountNumber, data.account.balance);
  await addTransaction(transaction);

  res.json({
    message: "Transfer successful.",
    balance: data.account.balance,
    transaction
  });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`NexaBank API running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
