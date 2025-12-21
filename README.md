# MediHub - AI-Powered Hospital Management System

MediHub is a comprehensive, modern healthcare platform designed to streamline the interaction between patients, doctors, and administrators using real-time data and AI-powered insights.

## 🚀 Key Features

### 👤 Patient Dashboard

- **Real-time Appointments**: View scheduled and in-progress consultations.
- **Digital Prescriptions**: Access medication history and test results instantly.
- **Medical Records**: Upload and manage health documents securely (Firebase Storage).
- **AI Health Insights**: Personalized health recommendations based on patient data.
- **Doctor Discovery**: Search and book appointments with specialized doctors.

### 🩺 Doctor Dashboard

- **Patient Queue**: Real-time management of daily appointments using local timezone logic.
- **Enhanced Prescriptions**: Add multiple medications and diagnostic tests per visit.
- **Consultation Management**: Transition appointments from 'scheduled' to 'in-progress' and 'completed'.
- **Availability Control**: Manage working hours and consultation slots dynamically.

### 🛡️ Admin Panel

- **Comprehensive Analytics**: Monitor daily/weekly appointment trends with localized charts.
- **User Management**: Activate/deactivate accounts and manage role-based permissions.
- **System Health**: Oversight of total patients, active doctors, and system-wide statistics.

### ⚙️ Platform Features

- **Real-Time Sync**: Powered by Firebase Firestore for instant data reflection across all devices.
- **Local Timezone Precision**: All scheduling and statistical calculations respect the user's local time.
- **Secure Authentication**: Robust role-based access control via Firebase Auth.
- **Notification System**: Instant alerts for appointment updates and prescriptions.
- **Profile Customization**: Manage personal details, specialization, and avatars.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (animations), Shadcn UI
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📖 How to Run

1. Install dependencies: `npm install`
2. Configure Firebase: Set up your `.env` with Firebase credentials.
3. Start development server: `npm run dev`
