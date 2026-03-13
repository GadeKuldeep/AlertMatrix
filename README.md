# 🚨 AlertMatrix

**AlertMatrix** is a modern automated **security scanning platform** that analyzes domains for potential security risks across multiple layers including **DNS configuration, SSL/TLS security, network exposure, and web server protections**.

🔗 **Live Demo:** [alertmatrix.netlify.app](https://alertmatrix.netlify.app)

The project follows a **microservices architecture** combining:

- ⚛️ React (Vite) for the frontend dashboard
- 🟢 Node.js (Express) for orchestration and API management
- 🐍 Python (FastAPI) for the high-performance security scanning engine

AlertMatrix generates **professional security reports with risk scores and remediation guidance** to help developers and security teams identify and fix vulnerabilities quickly.

---

# 📌 Features

✔ Multi-layer domain security scanning  
✔ Automated risk scoring system  
✔ Parallel security checks for faster scans  
✔ Actionable remediation guidance  
✔ Professional security reporting dashboard  
✔ Microservices-based scalable architecture  

---

# 🏗 Architecture Overview

AlertMatrix separates the **User Interface**, **API Orchestration Layer**, and **Security Scanning Engine** into independent services.

Frontend (React Dashboard)  
        │  
        ▼  
Backend API (Node.js / Express)  
        │  
        ▼  
Scanner Engine (Python / FastAPI)  
        │  
        ▼  
Security Results + Risk Score  

This architecture ensures **scalability, maintainability, and high performance**.

---

# 📂 Project Structure

```
AlertMatrix/
├── frontend/                # React (Vite) Application
│   ├── src/
│   │   ├── pages/           # Dashboard, Scan, Reports, Settings
│   │   ├── components/      # Reusable UI elements
│   │   ├── store/           # State management (Zustand/Redux)
│   │   └── lib/             # API clients and utilities
│   └── netlify.toml         # Frontend deployment configuration
│
├── backend/                 # Node.js (Express) Orchestration API
│   ├── src/
│   │   ├── controllers/     # Request handling (Auth, Scans, Domains)
│   │   ├── models/          # MongoDB Schemas (User, Scan, Domain)
│   │   ├── routes/          # API endpoint definitions
│   │   └── server.js        # Application entry point
│   └── .env                 # Backend configuration
│
└── scanner/                 # Python (FastAPI) Security Engine
    ├── checks/              # Security scanning modules
    │   ├── dns_check.py
    │   ├── ssl_check.py
    │   ├── network_check.py
    │   └── web_check.py
    ├── main.py              # FastAPI service and Risk scoring logic
    └── requirements.txt     # Python dependencies
```

---

# ⚙️ Working Mechanism

AlertMatrix operates as a **coordinated scanning pipeline** that transforms a domain input into a detailed security report.

---

## 1️⃣ User Input

A user enters a domain such as:

```
example.com
```

in the **frontend dashboard**.

---

## 2️⃣ Backend Orchestration

The **Node.js backend** performs the following tasks:

- Authenticates the user
- Validates the domain input
- Creates a **pending scan record**
- Stores metadata in **MongoDB**

---

## 3️⃣ Scanner Trigger

The backend sends a **POST request** to the Python scanning engine.

```
POST /scan
```

This activates the security scanning pipeline.

---

## 4️⃣ Parallel Security Checks

The Python scanning engine executes multiple checks simultaneously using:

```
ThreadPoolExecutor
```

This allows multiple security modules to run in **parallel**, improving scan speed.

---

### DNS / DNSSEC Analysis

Checks include:

- MX record validation
- SPF configuration
- DMARC policy verification
- DNSSEC validation

---

### SSL / TLS Inspection

The scanner analyzes:

- SSL certificate validity
- Expiration date
- Supported TLS versions
- Cipher strength

---

### Network Security Scan

The engine scans for **high-risk open ports**, such as:

```
21   FTP
3306 MySQL
3389 RDP
```

Open exposure of these services can increase attack surface.

---

### Web Server Security Analysis

The scanner checks important HTTP security headers including:

- HSTS
- Content Security Policy
- X-Frame-Options
- Server information leakage

---

## 5️⃣ Risk Assessment

The scanner calculates a **Risk Score (0-100)** based on the findings.

Severity levels include:

```
Critical
High
Medium
Low
```

Each finding is categorized based on its **impact and exploitability**.

---

## 6️⃣ Report Generation

The backend receives the scan results and:

- Updates the database
- Sends results to the frontend
- Displays a **professional security report**

---

# 📊 Example Output

```
Risk Score: 72

Findings:

[Critical]
Port 3389 exposed to internet

[High]
Missing HSTS header

[Medium]
Weak TLS cipher supported

[Low]
Server version disclosure detected
```

Each issue includes **recommended mitigation steps**.

---

# 🚀 Key Advantages

### 🔎 Comprehensive Security Coverage

AlertMatrix analyzes multiple security layers including:

- DNS hygiene
- SSL/TLS configuration
- Network exposure
- Web server security headers

---

### 🧠 Actionable Intelligence

Instead of simply reporting vulnerabilities, AlertMatrix provides **clear remediation instructions**, such as:

- Configure HTTPS 301 redirects
- Enable HSTS security headers
- Restrict dangerous ports using firewall rules

---

### ⚡ High Performance

The scanning engine uses:

- **FastAPI**
- **Async execution**
- **ThreadPoolExecutor**

This allows complex scans to complete in **seconds**.

---

### 🧩 Scalable Microservices Architecture

The system separates:

- Frontend UI
- Backend orchestration
- Scanner engine

This allows the **scanner service to run on powerful infrastructure** while the API remains lightweight.

---

### 🎨 Modern Security Dashboard

The frontend uses a **dark themed glassmorphism design** that makes security reports easy to understand for:

- Developers
- Security analysts
- Business stakeholders

---

### 🛡 Compliance Awareness

AlertMatrix performs checks aligned with:

- **OWASP Top 10**
- **Basic GDPR-related security practices**

This helps identify risks like:

- Missing encryption
- Weak security configurations
- Insecure service exposure

---

# 🛠 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AlertMatrix.git
cd AlertMatrix
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Scanner Setup

```bash
cd scanner
pip install -r requirements.txt
uvicorn main:app --reload
```

---

# 🌐 Deployment

Frontend can be deployed using:

- Netlify

Backend and scanner services can run on:

- Render

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Kuldeep  
Cybersecurity Enthusiast | Offensive Security | SOC Analysis
