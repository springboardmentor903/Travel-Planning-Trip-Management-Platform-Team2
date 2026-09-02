# TripNest - Project Status & Documentation

> **Last Updated**: September 2026  
> **Platform**: Full-Stack Travel Planning & Trip Management Platform

---

## 1. Project Overview & Architecture

TripNest is an interactive, full-stack travel platform for individual travelers and collaborative group trips.

### Technology Stack
* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Axios, Chart.js
* **Backend**: Spring Boot 3/4, Java 17/25, Spring Security, JWT, Google OAuth2 Client, Spring Data JPA, PostgreSQL
* **Database**: PostgreSQL 18 (Local instance `jdbc:postgresql://localhost:5432/tripnest`)
* **Integrations**: OpenWeather API (Live Weather & Forecasts), OpenStreetMap / Nominatim

---

## 2. Active Services & Ports

| Service | Port / URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | **Running** | Next.js App Router UI with Glassmorphism Theme |
| **Backend** | `http://localhost:8081` | **Running** | Spring Boot REST API |
| **Database** | `localhost:5432/tripnest` | **Running** | PostgreSQL database with auto-seeded schema |

### Default Credentials
* **Administrator**: `admin@tripnest.com` / `Admin@123` (Role: `ADMINISTRATOR`)

---

## 3. Implemented Modules & Features

### A. Authentication & User Management
* **JWT Authentication**: Secure stateless token issuance with expiration & refresh.
* **OAuth2**: Google OAuth login support.
* **User Profile**: Personal info, profile photo upload, password reset, favorite destination.
* **Admin Control Center**: User list, role management (`TRAVELER`, `GROUP_ADMIN`, `ADMINISTRATOR`), global stats.

### B. Trip Management & Group Collaboration
* **Trip Lifecycle**: Create, edit, list, and delete trips with destination, start/end dates, budget, and description.
* **Trip Membership Records**:
  * Members mapped with roles (`MEMBER` or `GROUP_ADMIN`).
  * Add members by email with immediate feedback.
  * Role change dropdown (`MEMBER` <-> `GROUP_ADMIN`).
  * Member removal with confirmation dialog.
* **Trip Join Requests**:
  * Search trips by title with relationship tracking (`OWNER`, `GROUP_ADMIN`, `MEMBER`, `REQUEST_PENDING`, `NONE`).
  * Submit request with optional message to trip admin.
  * Admin Accept / Decline flow with instant collaborative access.
  * User "My Requests" tracker.
* **Reusable Access Check**: `TripAccessService` guarding Trip, Itinerary, Activity, Budget, and Expense operations.

### C. Daywise Itinerary & Activities
* **Daywise Calendar Selection**: Date picker input (`<input type="date">`) supporting custom date selection and notes.
* **Day Selector Filter Pills**: "All Days", "Day 1 (01 Sep)", "Day 2 (02 Sep)" quick date switcher.
* **Chronological Sorting**: Auto-sorted by day date.
* **Edit & Delete Days**: Update day date or remove days and cascading activities.
* **Activity Tracking**: Add/edit/delete activities per day with location, start/end time, type, and description.

### D. Budget & Expense Management
* **Trip Budgeting**: Total budget, spent amount, remaining budget, and over-budget alerts.
* **Category Expenses**: Transportation, Hotel, Food, Shopping, Entertainment, Miscellaneous.
* **Visual Breakdown**: Interactive category expense charts and breakdown tables.

### E. Notifications System
* **Entity & Storage**: `Notification` entity linked to user, title, message, type, related trip, read flag, and timestamp.
* **Automated Triggers**:
  * Triggered when added to a trip (`TRIP_INVITE`).
  * Triggered when a join request is received (`JOIN_REQUEST`).
  * Triggered when a join request is approved or rejected (`JOIN_APPROVED` / `JOIN_REJECTED`).
* **Frontend Notification Bell**: Bell icon in Navbar with unread badge counter, popover notification list, direct trip navigation, and "Mark as Read" / "Mark all as read".

### F. Destinations & Weather
* **Curated Spots**: Seeded top Indian and international travel destinations.
* **Live Weather Integration**: Real-time temperature, humidity, wind, and forecast from OpenWeather API (`6955965b1508c538e2efc62411ca6871`).

---

## 4. Key API Endpoints Reference

### Members & Collaboration
* `POST /api/trips/{tripId}/members` &mdash; Add member by email
* `GET /api/trips/{tripId}/members` &mdash; List trip members
* `DELETE /api/trips/{tripId}/members/{memberId}` &mdash; Remove member
* `PUT /api/trips/{tripId}/members/{memberId}/role` &mdash; Change member role
* `GET /api/trips/search?name={name}` &mdash; Search trips
* `POST /api/trips/{tripId}/join-requests` &mdash; Send join request
* `GET /api/trips/{tripId}/join-requests` &mdash; List trip join requests
* `PUT /api/trips/{tripId}/join-requests/{requestId}/accept` &mdash; Accept join request
* `PUT /api/trips/{tripId}/join-requests/{requestId}/reject` &mdash; Decline join request
* `GET /api/trips/join-requests/my` &mdash; List user's sent requests

### Itinerary
* `POST /api/trips/{tripId}/itineraries` &mdash; Add day with date & notes
* `GET /api/trips/{tripId}/itineraries` &mdash; List days
* `PUT /api/trips/{tripId}/itineraries/{itineraryId}` &mdash; Update day date & notes
* `DELETE /api/trips/{tripId}/itineraries/{itineraryId}` &mdash; Delete day & activities

### Notifications
* `GET /api/notifications` &mdash; Get current user's notifications
* `GET /api/notifications/unread-count` &mdash; Get unread count
* `PUT /api/notifications/{id}/read` &mdash; Mark notification as read
* `PUT /api/notifications/read-all` &mdash; Mark all as read

---

## 5. Running & Building Locally

### Run Backend
```powershell
cd tripnest-backend
.\mvnw.cmd spring-boot:run
```

### Run Frontend
```powershell
cd frontend
npm run dev
```

### Run Tests
```powershell
cd tripnest-backend
.\mvnw.cmd test
```
