# 🎓 Digital Education & Collaboration Platform (DECP)

> A comprehensive full-stack Learning Management System (LMS) bridging Students, Alumni, and Administrators. Features web and React Native mobile applications with real-time social feeds, event management, job portals, research collaboration, and live messaging.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=spring-boot)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=flat-square&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-005C84?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![JWT](https://img.shields.io/badge/Security-JWT-000000?style=flat-square&logo=json-web-tokens)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features--capabilities)
- [Technology Stack](#-technology-stack--architecture)
- [System Architecture](#-system-architecture-diagram)
- [Getting Started](#-getting-started--local-development)
- [API Documentation](#-rest-api-documentation)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-directory-structure)
- [Deployment](#-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

**DECP** is an enterprise-grade Learning Management System designed to foster academic engagement and collaboration. The platform bridges the gap between:

- 👨‍🎓 **Students** - Access courses, jobs, events, research opportunities
- 🎓 **Alumni** - Mentor students, post opportunities, collaborate on research
- 🛡️ **Administrators** - Manage users, moderate content, monitor analytics

### Key Highlights

✅ **Multi-Platform** - Web (React + Vite) & Mobile (React Native + Expo)  
✅ **Real-Time** - Live messaging, social feeds, instant notifications  
✅ **Secure** - JWT authentication, BCrypt hashing, role-based access control  
✅ **Scalable** - Microservices-inspired architecture, horizontal scaling ready  
✅ **Production-Ready** - Docker containerization, comprehensive error handling  
✅ **Full-Stack** - Spring Boot backend, React frontend, MySQL database  

---

## ✨ Key Features & Capabilities

### 🛡️ Authentication & Role Management

- **Secure JWT Architecture** - Stateless token-based authentication
- **Spring Security Integration** - Built-in protection against common attacks
- **BCrypt Password Hashing** - Industry-standard password encryption
- **Role-Based Access Control (RBAC)**
  - `STUDENT` - Access courses, apply for jobs, register for events
  - `ALUMNI` - Post opportunities, mentor, collaborate on research
  - `ADMIN` - Full platform management, user promotion, analytics
- **Profile Management** - Users update credentials, Admins manage roles

### 📰 Social Feed & Dashboard Analytics

- **Interactive Timeline** - Post, like, comment, share academic insights
- **Full CRUD Operations** - Authors can edit/delete posts and comments
- **Admin Dashboard** - Real-time metrics (total users, active events, job postings)
- **Rich Text Formatting** - Enhanced post creation with styling options

### 💼 Career & Job Portal

- **Opportunity Discovery** - Search, filter, and apply for opportunities
- **Recruiter Controls** - Admins/Alumni post, edit, delete listings
- **Applicant Tracking System (ATS)** - View applicants in a dedicated modal
- **Application History** - Track submitted applications and statuses

### 📅 Event Management & Scheduling

- **Dynamic RSVP System** - Mark attendance as "Going" or "Decline"
- **Event Organization** - Create, update, delete, manage attendees
- **Live Attendee Roster** - Real-time view of who RSVP'd
- **Calendar Integration** - Upcoming events timeline

### �
