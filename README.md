# 🎓 Digital Education & Collaboration Platform (DECP)

Welcome to the **Digital Education & Collaboration Platform (DECP)**! This is a comprehensive, full-stack Learning Management System (LMS) designed to foster engagement and bridge the gap between Students, Alumni, and University Administrators. 

The platform delivers a seamless, unified experience across a **Web Dashboard** and a **React Native Mobile Application**, featuring real-time social feeds, dynamic event management, job portals, research collaboration, and direct messaging.

---

## ✨ Key Features & Capabilities

### 🛡️ Authentication & Role Management
* **Secure Architecture:** JWT-based stateless authentication backed by Spring Security and BCrypt password hashing.
* **Role-Based Access Control (RBAC):** Distinct hierarchical permissions for `STUDENT`, `ALUMNI`, and `ADMIN`.
* **Profile Management:** Users can update their credentials natively. Admins possess a unique terminal to dynamically promote user roles (e.g., upgrading a Student to Alumni or Admin).

### 📰 Social Feed & Dashboard Analytics
* **Interactive Timeline:** A dynamic feed where users can author posts, like, and comment to share academic thoughts or university announcements.
* **Full CRUD:** Authors can edit or delete their own posts and comments natively on both web and mobile.
* **Admin Analytics:** A dedicated, colorful statistics grid displaying live metrics of total users, active events, and job postings (Visible to Admins only).

### 💼 Career & Job Portal
* **Opportunity Discovery:** Students can seamlessly search, filter, and apply for posted career opportunities.
* **Recruiter Controls:** Admins and Alumni act as recruiters, with the ability to create, edit, and delete job postings.
* **Applicant Tracking System (ATS):** Recruiters can view a compiled list of applicants natively within a modal interface.

### 📅 Event Management & Scheduling
* **Dynamic RSVP System:** Users can manage their attendance strictly by marking themselves as "Going" or "Decline" for upcoming university workshops or seminars.
* **Organizer Tools:** Full lifecycle management (Create, Update, Delete) for event scheduling.
* **Live Attendee Roster:** Organizers can view precisely who has RSVP'd to their events in real-time.

### 🔬 Research & Innovation Hub
* **Project Proposals:** Drive academic innovation by proposing new research initiatives and defining project objectives.
* **Team Building:** Interested students/alumni can use the "Request to Join" functionality for open projects.
* **Lifecycle Management:** Project creators can update project statuses (`PLANNING`, `ACTIVE`, `COMPLETED`) and manage their team rosters.

### 💬 Real-Time Direct Messaging
* **Global University Directory:** A fully searchable directory of all registered platform users.
* **Live Chat Engine:** Chronological message tracking with accurate timestamps.
* **Smart UI Organization:** The directory automatically sorts by the most recent interactions, dynamically pulls the latest message snippet, and tracks live unread message counters.

---

## 🛠️ Technology Stack & Architecture

This project is built using a modern, scalable, and decoupled microservices-inspired architecture.

### ⚙️ Backend (RESTful API)
* **Framework:** Java Spring Boot 3.x
* **Security:** Spring Security & JWT (JSON Web Tokens)
* **Database:** MySQL 8.0 with Spring Data JPA & Hibernate ORM
* **Build Tool:** Maven

### 💻 Web Client (Frontend)
* **Framework:** React.js (via Vite)
* **Styling:** Custom Vanilla CSS featuring a modern, premium **Glassmorphism** aesthetic. 
* **Routing:** React Router DOM
* **HTTP Client:** Axios with dynamic interceptors
* **Icons:** Lucide React

### 📱 Mobile Application
* **Framework:** React Native (Built with Expo)
* **Navigation:** React Navigation (Bottom Tabs & Native Stack)
* **Storage:** Expo Secure Store for persistent Session/Token Management
* **Networking:** Axios mapping to secure LocalTunnels for local testing

### 🐳 DevOps & Deployment
* **Containerization:** Docker & Docker Compose
* **Web Server:** Nginx (Serves the optimized React production build)
* **Networking:** Custom Docker Bridge Networks

---

## 🚀 Getting Started & Local Development

### Prerequisites
Before you begin, ensure you have the following installed:
* [Docker](https://www.docker.com/) & Docker Compose
* [Node.js](https://nodejs.org/) (v18+)
* [Java 17+](https://adoptium.net/) (If running the backend independently)
* **Expo Go** app installed on your physical iOS or Android device.

---

### Step 1: Start the Web App & Backend (Dockerized)

The easiest way to spin up the database, backend services, and web frontend is using the included `docker-compose.yml` orchestration.

```bash
# Clone the repository
https://github.com/chala2001/LMS_University.git
cd decp-platform

# Spin up the containers (MySQL, Spring Boot Backend, Nginx Frontend)
docker-compose up --build -d
```

**Services will be mapped to:**
* 🌐 **Web Frontend:** [http://localhost:5173](http://localhost:5173)
* 🔌 **Backend API:** [http://localhost:8080](http://localhost:8080)
* 🗄️ **MySQL Database:** `localhost:3307` 

*(Note: The database completely initializes the schema automatically via Hibernate `update` on the first run).*

---

### Step 2: Run the Mobile Application (React Native / Expo)

Because the mobile application runs wirelessly on your physical device, it requires a secure tunnel to communicate with your local machine's containerized backend API.

#### A. Expose the Backend via LocalTunnel
Open a new terminal and run:
```bash
cd mobile_frontend
npx localtunnel --port 8080
```
> **Keep this terminal open!** Copy the generated secure URL (e.g., `https://your-tunnel-url.loca.lt`).

#### B. Configure & Start Expo
1. Open the file: `mobile_frontend/src/api/index.js`
2. Update the `API_URL` variable to match the Localtunnel URL you just generated.
3. Open a second terminal and start the React Native bundler:
```bash
cd mobile_frontend
npm install
npx expo start --tunnel
```
4. **Scan the generated QR code** using the **Expo Go** app on your phone to launch the application natively!

---

## 🧪 Testing Credentials & Admin Access

To fully explore the platform, you can organically register a new `STUDENT` account from the Login screen. 

To test **Recruiter features, Administrator controls, and Analytics**, you must inject an Admin user directly into the initialized Docker database. 

Run this command in your terminal while Docker is running:
```bash
docker exec -i decp-mysql mysql -uroot -proot LMS_db -e "INSERT INTO users (email, name, password, role) VALUES ('admin@university.edu', 'System Admin', '\$2a\$10\$BLRsPrkVUpHfmTlAYe7MMuC2Q.phZuqGe2P8Z5.Y6uMlA2aLSsbBG', 'ADMIN');"
```
You can now log into the web or mobile app using:
* **Email:** `admin@university.edu`
* **Password:** `123456`

---

## 📂 Project Directory Structure

```text
├── backend/
│   └── decp-platform/             # Spring Boot Java Backend
│       ├── src/main/java          # Business Logic & Controllers
│       └── src/main/resources     # Application Properties
├── frontend/
│   ├── src/                       # React Web Source Code
│   │   ├── components/            # Reusable UI Blocks
│   │   ├── pages/                 # Full Screen Views (Dashboard, Messages)
│   │   └── context/               # AuthContext State Management
│   ├── index.css                  # Global Glassmorphism Styling
│   ├── Dockerfile                 # Multi-stage Vite build pipeline
│   └── nginx.conf                 # Nginx proxy configuration
├── mobile_frontend/
│   ├── src/                       # React Native Mobile Source Code
│   │   ├── screens/               # Mobile Views (mirrors Web Pages natively)
│   │   ├── api/                   # Axios Interceptors & Networking
│   │   └── context/               # SecureStore Context
│   ├── App.js                     # Root Navigation Controller
│   └── package.json               # Mobile Dependencies
└── docker-compose.yml             # Unified Docker orchestration
```

---

## 🤝 Contributing
Contributions, bug reports, and feature requests are highly welcome! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License
This software is strictly for educational and portfolio purposes.  
It is open-source and available under the terms of the [MIT License](LICENSE).
