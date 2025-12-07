# Hospital Management System - Frontend

React application with Firebase and Webpack setup.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase project credentials from Firebase Console

## Available Scripts

- `npm run dev` - Start development server with hot reload (opens browser automatically)
- `npm start` - Start development server
- `npm run build` - Build for production

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── firebase/
│   │   └── config.js       # Firebase configuration
│   ├── App.js              # Main App component
│   ├── App.css             # App styles
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── webpack.config.js       # Webpack configuration
├── .babelrc                # Babel configuration
└── package.json            # Dependencies and scripts
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click the web icon (</>)
5. Copy the configuration values to your `.env` file

## Development

The development server runs on `http://localhost:3000` by default.

