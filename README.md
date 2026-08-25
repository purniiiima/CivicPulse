# CivicPulse — Municipal Incident Reporting & Resolution Platform

> CivicPulse bridges the gap between citizens, city administrators, and field engineers. Report local infrastructure issues with photo and location, dispatch certified field specialists, track SLA progress, and verify fixes in your community.

---

## 1. Overview

**CivicPulse** is a civic-tech platform engineered to streamline public infrastructure reporting, automated municipal dispatching, and resolution auditing. Built for transparency, speed, and cross-role collaboration, CivicPulse provides intuitive workflows for citizens to flag municipal hazards, for city administrators to prioritize work orders, and for field specialists to execute repairs.

---

## 2. Project Structure

The repository is organized into clearly separated frontend, backend, and static asset directories:

```text
CivicPulse/
├── frontend/                     # React + TypeScript Client Application
│   ├── src/
│   │   ├── components/           # UI components (Navbar, Sidebar, Maps, Badges, Modals)
│   │   ├── context/              # AppContext & AuthContext (REST Polling & Auth)
│   │   ├── pages/                # Role views (Citizen, Worker, Admin, Super Admin, Auth)
│   │   ├── services/             # REST API client & Map services
│   │   ├── types/                # Global TypeScript types and interfaces
│   │   └── utils/                # Validation and helper routines
│   ├── public/                   # Static favicon and browser assets
│   ├── index.html                # Single Page Application HTML entry point
│   ├── package.json              # Frontend client package configuration
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── vite.config.ts            # Frontend Vite build & API proxy configuration
│
├── backend/                      # Python FastAPI / SQLAlchemy Backend
│   ├── app/
│   │   ├── core/                 # App configuration and security routines
│   │   ├── database/             # PostgreSQL / SQLite connection & session factory
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── repositories/         # Database access repositories
│   │   ├── routes/               # REST API endpoints & route controllers
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Business logic & dispatch services
│   │   └── utils/                # Password hashing and helper utilities
│   ├── alembic/                  # Database migration scripts
│   ├── tests/                    # Backend API and unit tests
│   └── requirements.txt          # Python backend dependencies
│
├── assets/                       # Static Design Resources
├── package.json                  # Workspace script definitions
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Root Vite integration configuration
├── .gitignore                    # Git ignore definitions
├── .env.example                  # Environment configuration template
└── README.md                     # Project documentation
```

---

## 3. Technology Stack

- **Frontend**:
  - **Framework**: React 18+ with TypeScript
  - **Build Tool**: Vite
  - **Styling**: Tailwind CSS (CivicPulse palette: Oxford Navy, Teal, Gold, Slate)
  - **Icons**: Lucide React
  - **Mapping Engine**: Leaflet & OpenStreetMap (100% open-source, zero API cost)
  - **Charts**: Recharts
  - **Animations & Effects**: Motion & Canvas Confetti

- **Backend**:
  - **Framework**: Python / FastAPI
  - **Architecture**: 100% RESTful API with automated polling state synchronization
  - **Authentication**: JWT & Role-Based Access Control (`CITIZEN`, `WORKER`, `ORGANIZATION_ADMIN`, `SUPER_ADMIN`)
  - **Database**: PostgreSQL / SQLite

---

## 4. User Roles & Access Control

| Role | Permissions & Workflows |
| :--- | :--- |
| **Citizen** | Report civic issues, pin map or enter manual locations, attach photos, track own reports, upvote community issues, add comments, and verify/rate resolved tickets. |
| **Field Worker** | View assigned repair tasks, update job status (*Assigned* → *In Progress* → *Resolved*), upload photo proof of completion, and view profile. |
| **Organization Admin** | Access operations command center, manage departmental issues, dispatch specialists, export CSV reports, view SLA charts, and audit municipal tasks (read-only profile). |
| **Super Admin** | Full metropolitan governance, municipal organization management, organization administrator provisioning, and citywide infrastructure audit (read-only profile). |

---

## 5. Setup & Running the Application

### Option A: Independent Frontend & Backend Development (Recommended)

#### 1. Start the Backend Independently
Open a terminal at the project root:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/api/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

#### 2. Start the Frontend Independently
In a second terminal at the project root:
```bash
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- Automatic API proxying forwards `/api`, `/auth`, and `/ws` requests to `http://127.0.0.1:8000`.

---

### Option B: Unified Gateway / Cloud Container Server
For unified container execution or deployment via `server.ts`:
```bash
npm install
npm run dev
```
- **Unified Server**: `http://localhost:3000`

---

### Production Build & Launch
```bash
npm run build
npm start
```
