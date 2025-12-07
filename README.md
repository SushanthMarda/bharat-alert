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

---

## 🤝 How to Contribute

Thanks for checking out **Bharat Alert** — contributions are welcome! If you'd like to help, here are a few ways to get started.

### ✅ Good first issues
- Fix small typos or wording in the UI / README.
- Add missing form validations (client-side).
- Improve accessibility: add `aria-*` attributes to form controls.
- Add unit tests for small utility functions.
- Add more screenshots or an animated demo GIF.

---

## 🛠 Running locally (quick)

1. **Clone the repo:**

    git clone git@github.com:Sushanth-Goud/bharat-alert.git
    cd bharat-alert

2. **Install dependencies (if applicable):**

    npm install    # or yarn

3. **Start the dev server:**

    npm start

4. **Open your browser:**

    http://localhost:3000

> **If this project is static (HTML/CSS/JS)**, simply open `index.html` in your browser or use a tiny server:

    python3 -m http.server 8000

---

## 🔁 Workflow for contributors (recommended)

- Fork the repo & create a new branch:

    git switch -c fix/readme-typo

- Make small, focused commits.
- Rebase and squash where appropriate.
- Open a Pull Request with a clear description.
- Link related issues and add screenshots if UI changes were made.

---

## 🧪 Testing

### Automated tests

    npm test

### Manual test checklist

- Submit a report with/without a photo  
- Approve/reject from admin panel  
- Submit a sighting  
- Verify map pin updates correctly  

---

## 📋 PR checklist

- [ ] Code compiles, no console errors  
- [ ] Lints pass (if applicable)  
- [ ] UI changes include screenshots  
- [ ] README updated for new features  
- [ ] No sensitive keys committed  

---

## 📜 Code of Conduct

Be respectful and constructive during discussions.  
Report any inappropriate behavior to the maintainers.

---

## 📬 Contact / Maintainers

**Maintainers:** Sushanth, Tejesh  
**Repo:** https://github.com/Sushanth-Goud/bharat-alert

For major changes, open an issue before submitting a PR.

---

Thanks for helping improve **Bharat Alert** — even small contributions matter!
