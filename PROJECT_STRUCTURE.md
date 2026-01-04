# NH Chittagong Project Structure & File Guide

This document provides a comprehensive overview of the National Hospital Chittagong application's directory structure and core files.

## 📁 Root Directory

- `/frontend`: The core React application (built with Vite).
- `/frontend/server`: Node.js proxy for secure AI interactions.
  - `proxy.js`: Google Gemini 2.5 integration and fallback logic.
- `FEATURES_ADDED.md`: A detailed record of all enhancements and fixes implemented.
- `PROJECT_STRUCTURE.md`: This file (documentation of the codebase).
- `README.md`: General project overview and setup instructions.

---

## 📁 `frontend/` (React Application)

### 📂 `src/` (Source Code)

#### 📂 `src/components/` (Reusable UI & Layout)

- `layout/`: High-level layout components.
  - `DashboardLayout.tsx`: Wrapper for all dashboard pages, providing the sidebar and main content area.
  - `DashboardSidebar.tsx`: The primary navigation sidebar with role-based links.
- `billing/`:
  - `InvoicePDF.tsx`: Professional PDF invoice component built with `@react-pdf/renderer`.
- `ui/`: Standardized, low-level UI components (Buttons, Inputs, Cards, etc.) ensuring visual consistency.
- `ProtectedRoute.tsx`: A wrapper that ensures only authenticated users with specific roles can access certain routes.

#### 📂 `src/contexts/` (State Management)

- `AuthContext.tsx`: Manages user authentication state, provides login/logout functions, and syncs the user profile in real-time from Firestore.
- `ThemeContext.tsx`: Manages the application's light/dark mode and aesthetic preferences.

#### 📂 `src/lib/` (Utilities)

- `firebase.ts`: Initialization and configuration of the Firebase SDK.
- `firebase-utils.ts`: Custom utility functions for Firestore (e.g., `listenToCollection`, `addDocument`, `updateDocument`) to simplify data operations.
- `pdf-utils.tsx`: Utility for triggering PDF generation and browser downloads.
- `seed-data.ts`: Professional medical test catalog and database seeding logic.
- `utils.ts`: General helper functions for Tailwind CSS class merging and styling.

#### 📂 `src/pages/` (View Layer)

All pages are organized by role and functionality for better maintainability.

- **Admin Pages** (`/pages/admin/`)
  - `AdminDashboard.tsx`: High-level system overview, stats, and health monitoring.
  - `UsersPage.tsx`: Admin-only portal to manage user roles and account statuses.
  - `AnalyticsPage.tsx`: Global system metrics and departmental performance monitoring.
  - `SystemStatusPage.tsx`: Real-time cloud database integrity and resource monitoring.
- **Doctor Pages** (`/pages/doctor/`)
  - `DoctorDashboard.tsx`: Real-time view of today's patient queue and status updates.
  - `AvailabilityPage.tsx`: Interface for doctors to manage their weekly time slots.
  - `SearchPage.tsx`: Searchable directory of doctors for patients.
  - `SlotsPage.tsx`: The booking interface where patients select specific time slots.
- **Patient Pages** (`/pages/patient/`)
  - `PatientDashboard.tsx`: Overview for patients (upcoming appointments, recent prescriptions).
  - `MedicalRecordsPage.tsx`: Portal for patients to upload and view their medical history.
  - `PrescriptionsPage.tsx`: List of issued medications and tests with real-time status updates.
  - `TestBookingPage.tsx`: Interface for patients to book diagnostic tests prescribed by doctors.
  - `BillingPage.tsx`: Searchable list of all patient bills with PDF download options.
- **Core Pages** (`/pages/`)
  - `LandingPage.tsx`: The public face of MediHub.
  - `NotificationsPage.tsx`: Real-time alerts for all user types.
  - `SettingsPage.tsx`: User profile and preference management.
  - `AnalyticsPage.tsx`: Visualized data insights for Doctors and Admins.
  - `AIReportSummaryPage.tsx`: Premium interface for AI-powered medical report analysis.
- **Auth Pages** (`/pages/auth/`)
  - Standardized Login, Registration, and Password Reset flows.

---

### 📂 `src/hooks/` (Custom Hooks)

- `use-mobile.tsx`: Utility for responsive design and mobile-specific viewport handling.

---

## ⚙️ Configuration Files

- `App.tsx`: The standard application entry component.
- `router.tsx`: The primary routing engine (built with TanStack Router).
- `index.css`: Global styles and Tailwind v4 design system (variables, `@theme`, and utilities).
- `main.tsx`: Entry point for the React application.
- `vite.config.ts`: Configuration for the Vite build tool and Tailwind CSS plugin.
- `tsconfig.json`: TypeScript compiler settings and path aliases (`@/*`).
