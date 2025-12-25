# CORS Fix - Proxy Server Setup

## Problem
The CORS error occurs because Hugging Face's API doesn't allow direct browser requests. Browsers block cross-origin requests for security.

## Solution
We've created a **proxy server** that runs locally and forwards requests to Hugging Face.

```
Frontend (localhost:5173) → Proxy Server (localhost:3001) → Hugging Face API
```

## Setup Instructions

### Step 1: Install Server Dependencies
```bash
cd server
npm install
```

### Step 2: Start the Proxy Server
Open a **new terminal** and run:
```bash
cd server
npm start
```

You should see:
```
🚀 Hugging Face Proxy Server running on http://localhost:3001
✅ CORS enabled for http://localhost:5173
📡 Ready to proxy requests to Hugging Face API
```

### Step 3: Keep Both Servers Running
You need **TWO terminals**:

**Terminal 1** - Frontend (already running):
```bash
npm run dev
```

**Terminal 2** - Proxy Server (new):
```bash
cd server
npm start
```

## Testing

1. Make sure both servers are running
2. Navigate to the AI Report Summary page
3. Select a medical record
4. Click "Generate AI Summary"
5. Wait for the analysis

## Troubleshooting

### "Failed to fetch" or "Connection refused"
- **Cause**: Proxy server not running
- **Fix**: Start the proxy server in a new terminal

### "HUGGINGFACE_API_KEY not configured"
- **Cause**: `.env` file missing in server directory
- **Fix**: Copy `.env` to `server/.env`
  ```bash
  cp .env server/.env
  ```

### Port 3001 already in use
- **Cause**: Another app using port 3001
- **Fix**: Change port in `server/proxy.js` (line 7) and `src/lib/huggingface.ts` (line 2)

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
│  localhost:5173 │
└────────┬────────┘
         │
         │ HTTP Request
         │ (No CORS issue - same origin policy doesn't apply)
         ▼
┌─────────────────┐
│  Proxy Server   │
│  (Express.js)   │
│  localhost:3001 │
└────────┬────────┘
         │
         │ HTTP Request with API Key
         │ (Server-to-server, no CORS)
         ▼
┌─────────────────┐
│  Hugging Face   │
│   Inference API │
│  (Cloud)        │
└─────────────────┘
```

## Files Created

- `server/proxy.js` - Express proxy server
- `server/package.json` - Server dependencies
- `src/lib/huggingface.ts` - Updated to use proxy
- `CORS_FIX.md` - This file

## Development Workflow

### Starting Development
```bash
# Terminal 1 - Start frontend
npm run dev

# Terminal 2 - Start proxy
cd server && npm start
```

### Stopping Development
Press `Ctrl+C` in both terminals

## Production Deployment

For production, you'll need to:
1. Deploy the proxy server separately (e.g., on Heroku, Railway, or Vercel)
2. Update `PROXY_URL` in `src/lib/huggingface.ts` to point to your deployed proxy
3. Set environment variables on your proxy server

Example for production:
```typescript
// src/lib/huggingface.ts
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';
```

Then set `VITE_PROXY_URL=https://your-proxy-server.com` in production.
