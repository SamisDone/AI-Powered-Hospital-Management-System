# National Hospital Chittagong - AI-Powered Management System

National Hospital Chittagong (NHC) is a comprehensive, modern healthcare platform designed to streamline the interaction between patients, doctors, and administrators using real-time data and advanced AI-powered insights.

## 🚀 Key Features

### 👤 Patient Dashboard

- **Real-time Appointments**: View scheduled and in-progress consultations with local timezone precision.
- **Digital Prescriptions**: Access medication history and diagnostic test results instantly.
- **AI Report Genius**: Upload medical records for instant analysis powered by **Gemini 2.5**.
- **Medical Records**: Securely upload and manage health documents via Firebase.
- **Doctor Discovery**: Search and book appointments with specialized doctors at NHC.

### 🩺 Doctor Dashboard

- **Patient Queue**: Real-time management of daily appointments with live status updates.
- **Enhanced Prescriptions**: Add multiple medications and diagnostic tests per visit.
- **Doctor Attribution**: Automated doctor name tracking on all prescriptions and test orders.
- **Availability Control**: Manage working hours and consultation slots dynamically.

### 🛡️ Admin Panel

- **Financial Oversight**: Global visibility into billing and payment statuses across the network.
- **System Analytics**: High-level monitoring of growth, activity peaks, and departmental performance.
- **User Management**: Unified portal to manage roles, permissions, and account statuses.
- **System Status**: Real-time health monitoring of database and infrastructure.

### ⚙️ Platform Features

- **Gemini 2.5 Integration**: Advanced AI medical analysis using the latest Flash and Pro models.
- **Real-Time Sync**: Powered by Firebase Firestore for instant data reflection.
- **Premium UI/UX**: Modern dark-mode aesthetic with fluid animations and dynamic theme toggling.
- **Unified Branding**: Professional hospital branding across all pages, reports, and PDF invoices.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS (v4)
- **Animations**: Framer Motion
- **AI Engine**: Google Gemini 2.5 (via secure Node.js proxy)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **PDF Engine**: @react-pdf/renderer

## 📖 How to Run

### 1. Install Dependencies

You need to install dependencies for both the frontend and the AI proxy server:

- **Frontend**:
  ```bash
  cd frontend
  npm install
  ```
- **AI Proxy Server**:
  ```bash
  cd frontend/server
  npm install
  ```

### 2. Configure Environment

Set up your `.env` in the `frontend` directory. A template/existing `.env` is already provided with Firebase and Gemini keys.

### 3. Start the Application

You must run both the proxy server and the frontend concurrently:

- **Terminal 1 (AI Proxy)**:
  ```bash
  cd frontend/server
  npm start
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```
