const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "nexabank.json");

const defaultData = {
  account: {
    accountNumber: "****4821",
    accountType: "Checking Account",
    balance: 248650.00,
    currency: "ETB",
    status: "Active"
  },
  transactions: []
};

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    saveData(defaultData);
  }

  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveData(data) {
  const tempFile = DB_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, DB_FILE);
}

module.exports = {
  loadData,
  saveData
};
