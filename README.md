# Placement Experiences Platform

A MERN stack web app where students sign in with Google (Firebase Auth), browse company recruitment processes, and download placement experience PDFs. Admins manage all content.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Firebase Auth
- **Backend:** Node.js, Express, Firebase Admin SDK
- **Database:** MongoDB Atlas (Mongoose)
- **File storage:** Local `server/uploads/` (dev)

## Project structure

```
├── client/          # React frontend
├── server/          # Express API
├── package.json     # Root scripts to run both
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

Copy the example files and fill in your credentials:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server (`server/.env`):**
- `MONGODB_URI` — MongoDB Atlas connection string
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — from Firebase service account JSON
- `CLIENT_URL=http://localhost:5173`

**Client (`client/.env`):**
- `VITE_API_URL=http://localhost:5000`
- `VITE_FIREBASE_*` — from Firebase web app config

### 3. Seed sample companies (optional)

```bash
npm run seed
```

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## First admin setup

After your first Google sign-in, promote your account to admin in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@gmail.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass / Atlas UI to change your user's `role` field from `student` to `admin`.

## Features

- Google sign-in via Firebase Authentication
- Searchable company grid with logos
- Company detail page with recruitment round timeline
- Experience PDF download
- Admin dashboard for companies, rounds, and PDF uploads

## API routes

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/sync` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/companies` | Authenticated |
| GET | `/api/companies/:slug` | Authenticated |
| GET | `/api/experiences/:id/download` | Authenticated |
| POST/PUT/DELETE | `/api/admin/*` | Admin only |

## Security notes

- Never commit `.env` files or Firebase service account JSON
- Firebase Admin private key must use `\n` for newlines in `.env`
- All API routes require a valid Firebase ID token
