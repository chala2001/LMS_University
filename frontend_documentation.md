# LMS University - Frontend Documentation

This document outlines the architecture, components, and functionalities of the React frontend application built for the LMS University platform.

## 1. Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Vanilla CSS & CSS Modules (Dark Mode Glassmorphism)
- **HTTP Client:** Axios
- **Icons:** Lucide React

## 2. Directory Structure
```
d:\LMS_University\frontend\src\
├── api/
│   └── index.js           # Axios instance with JWT Interceptors
├── components/
│   └── Layout.jsx         # App Layout (Sidebar + Navbar Navbar)
├── context/
│   └── AuthContext.jsx    # Global Authentication State
├── pages/
│   ├── Auth/              # Login.jsx, Register.jsx
│   ├── Dashboard/         # Dashboard.jsx (Activity Feed, Metrics)
│   ├── Events/            # Events.jsx (Event list, RSVP)
│   ├── Jobs/              # Jobs.jsx (Job board, Applications)
│   ├── Profile/           # Profile.jsx (User Mgmt, Role Promos)
│   └── Research/          # Research.jsx (Projects, Team Join)
├── App.jsx                # Main Router (Protected Routes)
└── index.css              # Global Design Ecosystem
```

## 3. Core Functionalities Handled
All interactions are wired strictly to the Spring Boot REST API layer using Axios. Below are the key flows.

### 3.1 Authentication & State (`AuthContext`)
- `POST /api/users/login` and `POST /api/users/register` are executed inside `AuthContext`.
- Upon success, the **JWT Token** is saved to `localStorage` and attached to all future requests via `api.interceptors`.

### 3.2 Main Dashboard 
- Fetches `GET /api/analytics` mapped to the top 3 widget cards.
- Fetches `GET /api/posts`.
- Features a Create Post input mapped to `POST /api/posts`.
- Interactive `Like` and `Comment` buttons corresponding to `/posts/{id}/like` and `/posts/{id}/comments`.

### 3.3 Roles & Admin Features (`Profile > Role Management`)
- Specific endpoints like creating jobs, creating events, and upgrading users are physically guarded.
- The `Profile.jsx` detects if `user.role === 'ADMIN'`. If so, it renders the **Promote User** pane bridging to `PUT /api/users/{id}/role`.

### 3.4 Interactive University Modules
- **Jobs:** Fetches available careers (`GET /api/jobs`). Click *Apply* to trigger `POST /api/jobs/{id}/apply`.
- **Events:** Calendar/List. Click *Going/Not Going* to trigger `POST /api/events/{eventId}/rsvp`.
- **Research:** View active faculty/student projects mapped to `GET /api/research`. Click *Join Project* to trigger `POST /api/research/{projectId}/join`. 

## 4. How to Run Locally

### Start the Backend
1. Open PowerShell/Terminal.
2. Navigate to `d:\LMS_University\backend\decp-platform\decp-platform`.
3. Assure Java 17/21 is active `set JAVA_HOME=...`
4. Run `mvnw spring-boot:run`. The backend binds to port **8080**.

### Start the Frontend
1. Open a *new* PowerShell/Terminal tab.
2. Navigate to `d:\LMS_University\frontend`.
3. Run `npm run dev`. The Vite server will typically bind to port **5173**.
4. Open your browser and navigate to `http://localhost:5173`.
