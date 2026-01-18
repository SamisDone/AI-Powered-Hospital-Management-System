# 🏥 MediHub Codebase Guide: In-Depth MVC Architectural Breakdown

This guide provides an "extreme detail" look at the MediHub codebase, specifically structured to help you build a comprehensive **MVC (Model-View-Controller)** architectural diagram.

---

## 🏗️ The MVC Mapping for MediHub

In a modern React + Firebase application, the traditional MVC pattern is distributed across the frontend and backend services.

| Layer          | Component in MediHub                            | Responsibility                                                    |
| :------------- | :---------------------------------------------- | :---------------------------------------------------------------- |
| **Model**      | Firestore + `src/lib/firebase-utils.ts`         | Data storage, retrieval, and structural definitions (Interfaces). |
| **View**       | `src/pages/` + `src/components/`                | Rendering the user interface, handling layout, and animations.    |
| **Controller** | `src/router.tsx` + `src/contexts/` + `proxy.js` | Business logic, authentication, routing, and AI orchestration.    |

---

## 📊 1. The MODEL Layer (Data & State)

The Model layer is responsible for the data structure and interaction with the database.

### 🗄️ Firestore Collections (The "Database Model")

- `users`: Stores `UserProfile` data (UID, role, contact info, bio).
- `appointments`: Tracks doctor-patient consultations (date, time, status, reason).
- `prescriptions`: Contains medication details, dosage, and status.
- `medical_records`: Links to files in Firebase Storage for patient history.
- `bills`: Financial records with total amounts and status.

### 🛠️ Key Files in the Model Layer

- **[firebase-utils.ts](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/lib/firebase-utils.ts)**:
  - **Extreme Detail**: This is the "Data Access Object" (DAO). It abstracts Firebase SDK calls into reusable functions like `listenToCollection` and `updateDocument`. It handles the conversion of Firestore data into strongly-typed TypeScript objects.
  - **Logic**: It implements the real-time syncing logic (`onSnapshot`) which keeps the View updated without manual refreshes.
- **[firebase.ts](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/lib/firebase.ts)**:
  - **Extreme Detail**: The singleton entry point for the Firebase SDK. It initializes `auth`, `firestore`, and `storage` using environment variables.

---

## 🎨 2. The VIEW Layer (UI & Presentation)

The View layer is purely about how things look and how they are presented to the user.

### 📂 Page View Hierarchy (`src/pages/`)

Pages are organized by **Role**, which is a critical design pattern in this system.

- **Admin View**: focus on system metrics (`AnalyticsPage.tsx`) and management (`UsersPage.tsx`).
- **Doctor View**: focus on the queue (`DoctorDashboard.tsx`) and availability (`AvailabilityPage.tsx`).
- **Patient View**: focus on personal health (`PatientDashboard.tsx`) and record management.

### 📂 Presentation Components (`src/components/`)

- **[DashboardLayout.tsx](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/components/layout/DashboardLayout.tsx)**:
  - **Extreme Detail**: A "Template View". It defines the consistent shell for all interior pages, including the `DashboardSidebar` and `ThemeToggle`.
- **[ui/](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/components/ui/)**:
  - **Extreme Detail**: These are "Atom" components (Buttons, Cards, Inputs). They use **Tailwind v4** and **Framer Motion** for a premium "Glassmorphism" look.
  - `GlassCard.tsx`: Provides the frosted-glass aesthetic.
  - `StatsCard.tsx`: A specialized view for displaying metrics with icons.

---

## 🕹️ 3. The CONTROLLER Layer (Logic & Routing)

The Controller connects the Model and the View, handling user input and deciding what to show.

### 🛣️ Routing Controller

- **[router.tsx](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/router.tsx)**:
  - **Extreme Detail**: Built with **TanStack Router**. It maps URLs to specific Page Components.
  - **Security Logic**: It implements "Route Guarding" by checking the user's role from the `AuthContext` before allowing access to `/admin` or `/doctor` paths.

### 🧠 State Controllers (Contexts)

- **[AuthContext.tsx](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/contexts/AuthContext.tsx)**:
  - **Extreme Detail**: The core "App Controller". It manages the user session. When a user logs in, it triggers a listener on the `users` collection to fetch the full `UserProfile`.
  - **State Flow**: Login Trigger -> Firebase Auth -> Firestore Profile Fetch -> Global State Update -> View Re-render.
- **[ThemeContext.tsx](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/src/contexts/ThemeContext.tsx)**:
  - **Extreme Detail**: Manages the aesthetic state (Light/Dark mode) by injecting CSS classes into the root `<html>` element.

### 🌐 AI Proxy Controller

- **[proxy.js](file:///c:/Users/User/AI-Powered-Hospital-Management-System/frontend/server/proxy.js)**:
  - **Extreme Detail**: This is a backend-side Controller (Node.js/Express). It acts as a gateway for sensitive AI operations.
  - **Responsibility**: It hides the Gemini API keys from the frontend, handles prompt orchestration, and provides a fallback mechanism if the primary AI model fails.

---

## 🔄 4. Example Sequence: Booking an Appointment

To help with your diagram, here is how a single action flows through the MVC:

1.  **User (View)**: Patient clicks a time slot on `SlotsPage.tsx`.
2.  **Controller (Page Logic)**: The page function calls `addDocument('appointments', data)` from `firebase-utils.ts`.
3.  **Model (Firestore)**: A new record is created in the `appointments` collection.
4.  **Model -> Controller (Real-time)**: The `listenToCollection` listener in `PatientDashboard.tsx` detects the change.
5.  **Controller (State)**: The local `appointments` state is updated.
6.  **View (UI)**: The `PatientDashboard` automatically re-renders, showing the new appointment in the `StatsCard`.

---

## 🛠️ Configuration & Environment

- `vite.config.ts`: View builder configuration (Tailwind, TypeScript).
- `index.css`: The "Style Model"—defines the design tokens that all Views must follow.
- `package.json`: Lists the controllers (TanStack Router) and view engines (React, Framer Motion).

> [!TIP]
> When drawing your diagram, use different colors for **Model (Blue)**, **View (Green)**, and **Controller (Orange)** to visualize the separation of concerns clearly!
