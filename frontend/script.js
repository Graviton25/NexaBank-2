const API_URL = "https://nexabank-jbtp.onrender.com";

function getToken() {
  return localStorage.getItem("nexaBankToken");
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

let transactions = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupTransactions();
  setupModal();
  setupLogout();
  setupBalanceToggle();
  restoreSession();
});

function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.message || "Login failed.";
        return;
      }

      localStorage.setItem("nexaBankToken", data.token);
      localStorage.setItem("nexaBankUser", JSON.stringify(data.user));

      showDashboard(data.user);
    } catch (error) {
      console.error(error);
      message.textContent = "Unable to connect to NexaBank server.";
    }
  });
}

function restoreSession() {
  const token = getToken();
  const savedUser = localStorage.getItem("nexaBankUser");

  if (!token || !savedUser) return;

  try {
    showDashboard(JSON.parse(savedUser));
  } catch {
    logoutLocal();
  }
}

function showDashboard(user) {
  const loginScreen = document.getElementById("loginScreen");
  const dashboard = document.getElementById("dashboard");

  if (loginScreen) loginScreen.style.display = "none";
  if (dashboard) dashboard.style.display = "block";

  const welcome = document.getElementById("welcomeUser");
  if (welcome) welcome.textContent = `Welcome, ${user.name}`;

  const accountNumber = document.getElementById("accountNumber");
  if (accountNumber) accountNumber.textContent = user.accountNumber;

  loadAccount();
  loadTransactions();
}

async function loadAccount() {
  try {
    const response = await apiFetch(`${API_URL}/api/account`);

    if (response.status === 401) {
      showSessionExpiredNotice();
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load account.");
    }

    const account = await response.json();

    const balance = document.getElementById("balance");

    if (balance) {
      balance.textContent =
        `${Number(account.balance).toLocaleString()} ${account.currency}`;
      balance.dataset.value = balance.textContent;
      balance.dataset.hidden = "false";
    }

    const accountNumber = document.getElementById("accountNumber");
    if (accountNumber) accountNumber.textContent = account.accountNumber;

    document.querySelectorAll(".account-type").forEach(element => {
      element.textContent = account.accountType;
    });

    document.querySelectorAll(".account-status").forEach(element => {
      element.textContent = account.status;
    });
  } catch (error) {
    console.error("Account error:", error);
  }
}

async function loadTransactions() {
  try {
    const response = await apiFetch(`${API_URL}/api/transactions`);

    if (response.status === 401) {
      showSessionExpiredNotice();
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load transactions.");
    }

    transactions = await response.json();
    renderTransactions();
  } catch (error) {
    console.error("Transaction error:", error);
  }
}

function renderTransactions() {
  const container = document.getElementById("transactions");
  if (!container) return;

  const searchInput = document.getElementById("transactionSearch");
  const searchText = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const filtered = transactions.filter(transaction => {
    const type = String(transaction.type || "").toLowerCase();
    const description = String(transaction.description || "").toLowerCase();

    const filterType = currentFilter === "withdraw" ? "withdrawal" : currentFilter;
    const filterMatch = currentFilter === "all" || type === filterType;

    const searchMatch =
      !searchText ||
      type.includes(searchText) ||
      description.includes(searchText);

    return filterMatch && searchMatch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="no-transactions">No transactions found.</div>';
    return;
  }

  filtered.forEach(transaction => {
    const item = document.createElement("div");
    item.className = "transaction";

    const type = String(transaction.type || "transfer").toLowerCase();
    const amount = Number(transaction.amount || 0).toLocaleString();

    item.innerHTML = `
      <div class="transaction-icon ${type}">${type === "deposit" ? "↓" : type === "withdrawal" ? "↑" : "↔"}</div>
      <div class="transaction-details">
        <strong>${transaction.type || "Transaction"}</strong>
        <p>${transaction.description || "Bank transaction"}</p>
        <small>${new Date(transaction.date).toLocaleString()}</small>
      </div>
      <div class="transaction-amount ${type === "deposit" ? "positive" : type === "withdrawal" ? "negative" : "neutral"}">
        <strong>${type === "deposit" ? "+" : type === "withdrawal" ? "-" : ""}${amount} ETB</strong>
      </div>
    `;

    container.appendChild(item);
  });
}

function setupTransactions() {
  document.querySelectorAll(".transaction-filter").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".transaction-filter")
        .forEach(item => item.classList.remove("active"));

      button.classList.add("active");
      currentFilter = button.dataset.filter || "all";

      renderTransactions();
    });
  });

  const search = document.getElementById("transactionSearch");

  if (search) {
    search.addEventListener("input", renderTransactions);
  }
}

function setupBalanceToggle() {
  const button = document.getElementById("toggleBalance");
  if (!button) return;

  button.addEventListener("click", () => {
    const balance = document.getElementById("balance");
    if (!balance) return;

    const hidden = balance.dataset.hidden === "true";

    if (hidden) {
      balance.textContent = balance.dataset.value || "0.00";
      balance.dataset.hidden = "false";
      button.setAttribute("aria-label", "Hide balance");
    } else {
      balance.dataset.value = balance.textContent;
      balance.textContent = "••••••";
      balance.dataset.hidden = "true";
      button.setAttribute("aria-label", "Show balance");
    }
  });
}

function setupModal() {
  const modal = document.getElementById("bankModal");
  const confirmButton = document.getElementById("modalConfirm");

  if (!modal || !confirmButton) return;

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      openModal(button.dataset.action);
    });
  });

  confirmButton.addEventListener("click", handleModalSubmit);

  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });
}

function openModal(action) {
  const modal = document.getElementById("bankModal");
  const title = document.getElementById("modalTitle");
  const description = document.getElementById("modalDescription");
  const recipientGroup = document.getElementById("recipientGroup");
  const message = document.getElementById("modalMessage");
  const amount = document.getElementById("modalAmount");
  const recipient = document.getElementById("modalRecipient");

  if (!modal) return;

  modal.dataset.action = action;

  if (action === "deposit") {
    title.textContent = "Deposit Money";
    description.textContent = "Enter the amount you want to deposit.";
    recipientGroup.style.display = "none";
  }

  if (action === "withdraw") {
    title.textContent = "Withdraw Money";
    description.textContent = "Enter the amount you want to withdraw.";
    recipientGroup.style.display = "none";
  }

  if (action === "transfer") {
    title.textContent = "Send Money";
    description.textContent = "Enter the recipient and amount.";
    recipientGroup.style.display = "block";
  }

  amount.value = "";
  recipient.value = "";
  message.textContent = "";
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("bankModal");
  if (modal) modal.style.display = "none";
}

async function handleModalSubmit() {
  const modal = document.getElementById("bankModal");
  const confirmButton = document.getElementById("modalConfirm");
  const action = modal.dataset.action;
  const amountInput = document.getElementById("modalAmount");
  const amount = Number(amountInput.value);
  const recipient = document.getElementById("modalRecipient").value.trim();
  const message = document.getElementById("modalMessage");

  if (confirmButton.disabled) return;

  if (!amount || amount <= 0) {
    message.className = "warning";
    message.textContent = "Enter a valid amount.";
    return;
  }

  if (action === "transfer" && !recipient) {
    message.className = "warning";
    message.textContent = "Enter the recipient account.";
    return;
  }

  message.className = "processing";
  message.textContent = "Processing...";
  confirmButton.disabled = true;
  confirmButton.textContent = "Processing...";
  confirmButton.classList.add("processing");

  try {
    let endpoint;
    let body;

    if (action === "deposit") {
      endpoint = "/api/deposit";
      body = { amount };
    }

    if (action === "withdraw") {
      endpoint = "/api/withdraw";
      body = { amount };
    }

    if (action === "transfer") {
      endpoint = "/api/transfer";
      body = {
        recipient,
        amount
      };
    }

    const response = await apiFetch(API_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      message.className = "error";
      message.textContent = result.message || "Transaction failed.";
      confirmButton.disabled = false;
      confirmButton.textContent = "Continue";
      confirmButton.classList.remove("processing");
      return;
    }

    message.className = "success";
    message.textContent = result.message || "Transaction successful.";

    await loadAccount();
    await loadTransactions();

    setTimeout(closeModal, 700);
  } catch (error) {
    console.error(error);
    message.className = "error";
    message.textContent = "Unable to connect to the bank server.";
    confirmButton.disabled = false;
    confirmButton.textContent = "Continue";
    confirmButton.classList.remove("processing");
  }
}

function setupLogout() {
  const button = document.getElementById("logoutButton");
  if (!button) return;

  button.addEventListener("click", async () => {
    try {
      const token = getToken();

      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error(error);
    }

    logoutLocal();
  });
}

function showSessionExpiredNotice() {
  const notice = document.createElement("div");
  notice.className = "session-expired-notice";
  notice.textContent = "Your session has expired. Please sign in again.";
  document.body.appendChild(notice);
  setTimeout(() => notice.classList.add("show"), 20);
  setTimeout(() => logoutLocal(), 1400);
}

function logoutLocal() {
  localStorage.removeItem("nexaBankToken");
  localStorage.removeItem("nexaBankUser");
  location.reload();
}

function depositMoney() {
  openModal("deposit");
}

function withdrawMoney() {
  openModal("withdraw");
}

function sendMoney() {
  openModal("transfer");
}

window.depositMoney = depositMoney;
window.withdrawMoney = withdrawMoney;
window.sendMoney = sendMoney;
