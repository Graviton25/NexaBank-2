NexaBank

A modern, responsive banking web application built with HTML, CSS, JavaScript, Node.js, Express, and PostgreSQL.

NexaBank demonstrates a full-stack banking experience with secure authentication, account management, transaction processing, persistent database storage, and a responsive frontend designed for both desktop and mobile devices.

«Note: NexaBank is an educational/demo project and is not intended for real financial transactions or production banking use.»

---

🌐 Live Demo

Frontend:
https://graviton25.github.io/NexaBank-2/

Backend API:
https://nexabank-jbtp.onrender.com/

Repository:
https://github.com/Graviton25/NexaBank-2

---

✨ Features

🔐 Authentication

- Secure username/password authentication
- Session-based authentication
- Bearer token authorization
- Protected account and transaction endpoints
- Login and logout functionality
- Persistent frontend authentication state

💳 Account Management

- Account information dashboard
- Account number display
- Account type
- Current balance
- Currency and account status

💰 Transactions

- Deposits
- Withdrawals
- Transfers
- Transaction history
- Transaction status
- Transaction timestamps
- Newest transactions displayed first
- Transaction amount validation

🗄️ Database

- PostgreSQL database
- Persistent account data
- Persistent transaction history
- Persistent user credentials
- Automatic database table initialization

📱 Responsive Interface

- Mobile-friendly layout
- Responsive dashboard
- Modern banking-style interface
- Interactive transaction controls
- Clean navigation and user feedback

☁️ Deployment

- Frontend deployed with GitHub Pages
- Backend deployed with Render
- PostgreSQL hosted on Render
- GitHub Actions used for frontend deployment

---

🏗️ System Architecture

                    ┌─────────────────────┐
                    │      User Device    │
                    │   Mobile / Desktop  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    GitHub Pages     │
                    │   HTML / CSS / JS   │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │     Render API      │
                    │ Node.js + Express   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Render PostgreSQL  │
                    │ Users / Accounts /  │
                    │    Transactions     │
                    └─────────────────────┘

---

🛠️ Technology Stack

Frontend

- HTML5
- CSS3
- JavaScript
- Responsive Web Design

Backend

- Node.js
- Express.js
- CORS
- PostgreSQL client ("pg")
- Node.js Crypto API

Database

- PostgreSQL

Deployment

- GitHub
- GitHub Pages
- GitHub Actions
- Render

---

📁 Project Structure

NexaBank-2/
│
├── .github/
│   └── workflows/
│       └── pages.yml
│
├── backend/
│   ├── auth.js
│   ├── database.js
│   ├── server.js
│   ├── sessions.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
└── README.md

---

🔌 API Endpoints

Health Check

GET /

Returns the API status.

Authentication

POST /api/login

Authenticates a user and returns an access token.

POST /api/logout

Ends the current session.

Account

GET /api/account

Returns authenticated account information.

Transactions

GET /api/transactions

Returns the authenticated user's transaction history.

Deposit

POST /api/deposit

Creates a deposit transaction.

Withdrawal

POST /api/withdraw

Creates a withdrawal transaction.

Transfer

POST /api/transfer

Creates a transfer transaction.

Protected endpoints require:

Authorization: Bearer <token>

---

🔒 Security Features

NexaBank includes several security-oriented mechanisms appropriate for a learning/demo application:

- Password hashing with Node.js "crypto.scrypt"
- Random salts for password storage
- Timing-safe password comparison
- Bearer token authentication
- Protected API endpoints
- Server-side transaction validation
- Database-backed user records
- Sensitive local database files excluded through ".gitignore"

Transaction Validation

Transaction amounts are validated on the server.

The application rejects:

- Zero amounts
- Negative amounts
- Invalid numeric values
- Amounts above the configured transaction limit

---

🗄️ Database Design

The PostgreSQL database uses three primary tables.

Users

Stores authentication and user information.

users
├── id
├── username
├── salt
├── password_hash
├── name
└── account_number

Accounts

Stores account information.

accounts
├── account_number
├── account_type
├── balance
├── currency
└── status

Transactions

Stores banking activity.

transactions
├── id
├── type
├── description
├── amount
├── date
└── status

---

🚀 Running Locally

1. Clone the repository

git clone https://github.com/Graviton25/NexaBank-2.git
cd NexaBank-2

2. Install backend dependencies

cd backend
npm install

3. Configure PostgreSQL

Set the database connection string as an environment variable:

export DATABASE_URL="your_postgresql_connection_string"

Do not commit database credentials to GitHub.

4. Start the backend

node server.js

The API will run on:

http://localhost:3000

5. Run the frontend

From the "frontend" directory, serve the static files using a local HTTP server.

For example:

npx serve .

---

⚙️ Environment Variables

The backend uses:

DATABASE_URL
PORT

"PORT" is automatically provided by hosting platforms such as Render.

Example:

DATABASE_URL=postgresql://...
PORT=3000

Never commit real credentials or database connection strings.

---

☁️ Deployment

Frontend

The frontend is deployed through GitHub Pages.

GitHub Actions automatically publishes the contents of the "frontend/" directory whenever changes are pushed to the "main" branch.

Workflow:

Git Push
   ↓
GitHub Actions
   ↓
Build/Package frontend
   ↓
GitHub Pages

Backend

The backend is deployed on Render.

Render installs the dependencies from the "backend/" directory and starts the Express server with:

node server.js

Database

The application uses PostgreSQL hosted through Render.

The backend connects through:

DATABASE_URL

The database tables are automatically initialized when the backend starts.

---

🔄 Application Flow

A typical login request follows this process:

User
 │
 │ Login
 ▼
Frontend
 │
 │ POST /api/login
 ▼
Express API
 │
 │ Verify credentials
 ▼
PostgreSQL
 │
 │ User record
 ▼
Express API
 │
 │ Authentication token
 ▼
Frontend
 │
 │ Authorized API requests
 ▼
Account / Transactions

---

🧪 Testing

The application has been tested across the main backend functionality, including:

- API health check
- User authentication
- Protected API endpoints
- Account retrieval
- Transaction retrieval
- Deposits
- Withdrawals
- Transfers
- Transaction validation
- PostgreSQL persistence
- Render deployment
- GitHub Pages deployment

---

📌 Current Limitations

This project is designed as a full-stack learning and portfolio project, not a production banking platform.

It currently does not provide the infrastructure required for real-world banking, such as:

- Real financial institution integrations
- Multi-factor authentication
- Production-grade session storage
- Rate limiting
- Comprehensive audit logging
- Fraud detection
- Regulatory compliance
- Real payment processing
- Production secrets management
- High-availability infrastructure
- Multi-account banking infrastructure

---

🎯 Project Goals

NexaBank was developed to demonstrate practical full-stack development concepts, including:

- Frontend development
- REST API design
- Authentication
- Database integration
- CRUD-style transaction operations
- Server-side validation
- Cloud deployment
- Git/GitHub workflows
- Responsive UI development
- Connecting a frontend application to a cloud backend

---

🔮 Future Improvements

Potential future development includes:

- Two-factor authentication
- Password reset
- User registration
- Multiple bank accounts
- Beneficiary management
- Transaction search and filtering
- Advanced analytics
- Account statements
- Email notifications
- Improved session management
- Rate limiting
- API documentation
- Automated testing
- CI/CD improvements
- Production-grade security architecture

---

👨‍💻 Author

Nathnael Andualem

Civil Engineering Student & Developer

GitHub:
https://github.com/Graviton25

📧 Email:
nathnaelandualem25@gmail.com
---

📄 License

This project is intended for educational and portfolio purposes.

You may modify and extend the project for learning and development.
