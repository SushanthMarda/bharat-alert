<<<<<<< HEAD
# Bharat Alert – Web-Based Child Abduction Alert System

```
██████╗ ██╗  ██╗ █████╗ ██████╗  █████╗ ████████╗     █████╗ ██╗     ███████╗██████╗ ████████╗
██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝    ██╔══██╗██║     ██╔════╝██╔══██╗╚══██╔══╝
██████╔╝███████║███████║██████╔╝███████║   ██║       ███████║██║     █████╗  ██████╔╝   ██║   
██╔══██╗██╔══██║██╔══██║██╔══██╗██╔══██║   ██║       ██╔══██║██║     ██╔══╝  ██╔══██╗   ██║   
██████╔╝██║  ██║██║  ██║██║  ██║██║  ██║   ██║       ██║  ██║███████╗███████╗██║  ██║   ██║   
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   
                                                                                              
```

## 📝 Description

**Bharat Alert** is a simulation of an Amber Alert–style system for India. It is a fully web-managed alert system allowing users to report missing children, and enabling admins to track, verify, and manage alerts and sightings.


---

## 🌟 Core Features

✅ **Submit Reports:**  
- Child's name, age, gender  
- Last seen location (text + map pin)  
- Date/time, contact info, optional photo  

✅ **Admin Controls:**  
- Approve or reject pending reports  
- View live alerts  
- Mark reports as “Solved”  

✅ **Sighting Reports:**  
- Anyone can submit sightings tied to a missing child report  
- Location + comments are recorded  

✅ **Public Alert Board:**  
- Approved reports displayed with map pins showing last known locations  

---

## 🌐 Pages Overview

| Page | Description |
|------|-------------|
| `/submit-report` | Form to report a missing child |
| `/admin-dashboard` | Admin control panel |
| `/alerts` | Public alert board with live map |
| `/report/:id` | View detailed report and submit sighting |
| `/sighting/:id` | Submit a sighting for a specific report |

---

## 🗺️ Map Integration

- Built with **Leaflet.js + OpenStreetMap**
- Pin last seen/sighting locations
- Drop-a-pin while reporting
- View all sightings per report

---

## 🧪 Tech Stack

- **Frontend:** HTML, CSS, JS (React optional)
- **Map:** Leaflet.js or Google Maps (API key needed)
- **Database:** JSON-based mock database

```json
{
  "pending_reports": [],
  "approved_reports": [],
  "solved_reports": [],
  "sightings": []
}
```

---

## 📸 Screenshots

| User Report Form | Admin Dashboard |
|------------------|------------------|
| ![Form](screenshots/form.png) | ![Dashboard](screenshots/dashboardd.png) |

| Alerts Board | Sighting Report |
|--------------|------------------|
| ![Alerts](screenshots/alerts.png) | ![Sighting](screenshots/sighting.png) |



---

## 📧 Test Emails

Appears on login panel...

---

## 🎯 Goal

Simulate a real-world child abduction alert system for India – featuring:

- Full admin control
- Location-based alerting
- Public awareness via an online alert board
- Real-time tracking simulation

---

## 🙌 Contributing

👥 Developed by Sushanth and Tejesh
=======
# Bharat Alert
> One‑line tagline

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Key Implementation Details](#key-implementation-details)
- [Testing](#testing)
- [Future Improvements & Known Limitations](#future-improvements--known-limitations)
- [License](#license)

## Project Overview
Bharat Alert is a real‑time missing‑child alert system. It enables authorities and community members to report missing children, register as watchers, and receive instant alerts via WebSockets and SMS when a child is reported within a configurable radius.

**Target Users**
- Law enforcement and NGOs managing missing‑child cases
- Community volunteers acting as watchers
- General public wishing to stay informed about nearby alerts

## Features
- **User authentication** with JWT (admin & watcher roles)
- **Report creation** with optional photo, location, and details
- **Watcher registration** (stores location & phone for radius‑based alerts)
- **Real‑time alerts** via Socket.IO to nearby watchers
- **SMS notifications** for tier‑1 alerts using Fast2SMS
- **Admin dashboard** to approve/reject/solve reports
- **Map view** showing approved reports and sightings
- **Rate limiting** on endpoints to prevent abuse
- **Health check** endpoint

## Architecture
```
+-------------------+        +-------------------+
|   Frontend (React| <----> |   Flask Backend   |
|  + Vite, Tailwind|        |  + Flask-SocketIO |
|  + Leaflet map)   |        |  + SQLAlchemy      |
+-------------------+        +-------------------+
        ^                            ^
        | WebSocket / REST API       |
        v                            v
+-------------------+        +-------------------+
|   SQLite DB       |        |   Fast2SMS API   |
+-------------------+        +-------------------+
```

## Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Backend | Flask | - |
| | Flask‑CORS | - |
| | Flask‑SocketIO | - |
| | Flask‑Limiter | - |
| | SQLAlchemy | - |
| | PyJWT | - |
| | python‑dotenv | - |
| | Eventlet (async mode) | - |
| Database | SQLite | - |
| Frontend | React 18 | 18.2.0 |
| | Vite | 5.0.10 |
| | TypeScript | 5.3.3 |
| | Tailwind CSS | 3.4.0 |
| | Leaflet & React‑Leaflet | 1.9.4 / 4.2.1 |
| | Socket.IO client | 4.8.3 |
| | Others (clsx, lucide‑react, etc.) | see `frontend/package.json` |

## Project Structure
```
.
├── backend
│   ├── app.py               # Flask entry point, routes, SocketIO events
│   ├── models.py            # SQLAlchemy ORM definitions (User, Report, Sighting)
│   ├── utils.py             # Helper functions (haversine, watcher lookup)
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Example env variables
│   └── data.db              # SQLite DB (generated at runtime)
├── frontend
│   ├── src/
│   │   ├── components/      # UI components (button, card, map, etc.)
│   │   ├── contexts/        # Auth & Socket contexts
│   │   ├── lib/             # api.ts (wrapper around REST) & utils
│   │   ├── pages/           # React Router pages (Home, Login, Dashboard, …)
│   │   └── App.tsx          # Root component & route definitions
│   ├── index.html           # Main HTML entry
│   ├── package.json         # Node dependencies and scripts
│   └── tailwind.config.js   # Tailwind configuration
├── logo.png                 # Project logo
└── README.md                # *You are reading it now*
```

## Installation
### Prerequisites
- Python 3.9+ and `pip`
- Node.js 20+ and `npm`/`pnpm`
- SQLite (bundled with Python)
### Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit as needed (JWT secret, FAST2SMS key, etc.)
python app.py           # will seed a default admin (admin/admin123)
```
### Frontend setup
```bash
cd frontend
npm install
npm run dev            # Vite dev server at http://localhost:5173
```
### Environment variables
See `backend/.env.example` for required keys:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- `JWT_SECRET`
- `FAST2SMS_API_KEY` (optional for SMS)
- `ALERT_RADIUS_KM` (default 10 km)
- `DEBUG` (true/false)

## API Reference
All endpoints are prefixed with `/api` and return JSON `{ data: ..., error: null }` on success.
### Authentication
- **POST** `/api/auth/login` – body `{ username, password }` → returns JWT token and user info.
- **GET** `/api/auth/me` – admin‑only, returns decoded token payload.
### Reports
- **GET** `/api/reports` – optional `?status=` filter.
- **GET** `/api/reports/<id>` – single report.
- **POST** `/api/reports` – create report (rate‑limited). Triggers real‑time watcher alerts.
- **POST** `/api/reports/<id>/approve` – admin only, marks approved and sends SMS to nearby watchers.
- **POST** `/api/reports/<id>/reject` – admin only.
- **POST** `/api/reports/<id>/solve` – admin only, marks solved.
### Sightings
- **GET** `/api/sightings` – optional `?report_id=`.
- **POST** `/api/sightings` – create sighting (rate‑limited). Emits real‑time event.
### Watchers
- **POST** `/api/watchers/register` – register watcher, receives JWT.
### Stats & Map
- **GET** `/api/stats` – aggregated counts.
- **GET** `/api/map-data` – approved reports + sightings with lat/lon for map rendering.
- **GET** `/api/health` – health check.

## Database Schema
| Table | Columns |
|-------|---------|
| **users** | `id` (PK), `username`, `password_hash`, `role` (admin/watcher), `phone_number`, `lat`, `lon`, `created_at` |
| **reports** | `id` (PK), `child_name`, `age`, `last_seen_location`, `lat`, `lon`, `photo_url`, `reporter_name`, `reporter_contact`, `status` (pending/approved/solved), `submitted_at`, `resolved_at` |
| **sightings** | `id` (PK), `report_id` (FK), `description`, `lat`, `lon`, `submitted_by`, `submitted_at` |

## Key Implementation Details
- **Socket.IO alerts** – on report creation, server finds watchers within `ALERT_RADIUS_KM` (haversine) and emits `new_alert` to their socket session. Watcher sockets are mapped via `user_socket_map` on connection.
- **JWT authentication** – `create_jwt` encodes user id, username, role, and 8‑hour expiry. `require_admin` decorator validates token and role.
- **Geo‑radius watcher logic** – `utils.get_watchers_in_radius` uses the Haversine formula to filter watchers based on stored lat/lon.
- **Rate limiting** – Flask‑Limiter limits report creation (5/min) and sighting creation (10/min) to mitigate abuse.
- **SMS integration** – `send_sms` posts to Fast2SMS when a report is approved; the API key is optional for local development.
- **Async mode** – Flask‑SocketIO runs with `eventlet` for non‑blocking WebSocket handling.

## Testing
No dedicated test suite is present in the repository. Manual testing can be performed via the Swagger‑like API calls using tools like Postman or the provided frontend UI.

## Future Improvements & Known Limitations
- Add automated unit & integration tests (pytest, React Testing Library).
- Replace SQLite with a production‑grade DB (PostgreSQL/MySQL).
- Implement role‑based UI components for watchers vs. admins.
- Add pagination for large report/sighting lists.
- Improve error handling and input validation on the backend.
- Containerize the application (Docker) for easier deployment.

## License
The repository does not contain a LICENSE file; therefore the license is omitted.
>>>>>>> 6e1cb37 (Add comprehensive README)
