# Quick Start Guide

Get the Agent Finance frontend running in 60 seconds.

## Prerequisites

- Node.js 18+ installed
- Backend API running (see parent README for backend setup)

## Installation

```bash
cd frontend
npm install
```

## Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your backend URL
# Default: VITE_API_URL=http://localhost:3000
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

**You'll see:**
1. Landing page at `/`
2. Dashboard at `/dashboard`

## What to Test

### Landing Page (/)
- [x] Hero section loads
- [x] Use cases displayed
- [x] Code example visible
- [x] "Access Dashboard" button works

### Dashboard (/dashboard)
- [x] Stats cards show metrics
- [x] Agents list appears (or empty state)
- [x] Transaction history (or empty state)
- [x] Activity feed (or empty state)
- [x] "New Agent" button opens modal

### Create Agent
1. Click "New Agent" button
2. Fill in form:
   - Agent ID: `test-agent-001`
   - Name: `Test Agent`
   - Type: OpenClaw
   - Email: `[email protected]`
3. Click "Create Agent"
4. Should call `POST /agents` endpoint

## Production Build

```bash
npm run build
```

This creates optimized files in `dist/`:
- `dist/index.html` - Entry point
- `dist/assets/` - CSS and JS bundles

## Deploy

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
netlify deploy --dir=dist --prod
```

### Manual (any static host)
1. Build: `npm run build`
2. Upload `dist/` folder to your host
3. Configure server to serve `index.html` for all routes

## Environment Variables

Set these in your deployment platform:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:3000` |

## Troubleshooting

### Port 5173 already in use
```bash
# Kill existing Vite process
pkill -f vite

# Or use a different port
npm run dev -- --port 3001
```

### API calls fail with CORS error
Check that your backend is running and allows CORS from `http://localhost:5173`.

Backend should include:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'your-production-domain.com']
}));
```

### Build warnings about imports
TypeScript false positives - safe to ignore. The build completes successfully.

### Missing dependencies
```bash
rm -rf node_modules package-lock.json
npm install --include=dev
```

## Next Steps

1. **Connect to real backend**: Update `.env` with actual API URL
2. **Customize branding**: Edit colors in `tailwind.config.js`
3. **Add features**: Create new components in `src/components/`
4. **Deploy**: Push to production with Vercel/Netlify

## File Structure

```
frontend/
├── src/
│   ├── api/client.ts          ← API client, edit endpoints here
│   ├── components/            ← Reusable UI components
│   ├── pages/                 ← Landing + Dashboard
│   ├── App.tsx                ← Router config
│   └── main.tsx               ← Entry point
├── public/                    ← Static assets
├── .env                       ← Your config (gitignored)
├── package.json               ← Dependencies
└── README.md                  ← Full documentation
```

## Help

- Check `README.md` for full documentation
- See `FEATURES.md` for complete feature list
- Review code in `src/` for examples

---

**You're ready to go!** 🚀
