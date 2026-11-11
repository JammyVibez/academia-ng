# Academia NG — Next-Generation Nigerian University Academic Platform

Premium academic companion for Nigerian university students.

**Repo:** https://github.com/JammyVibez/academia-ng

## Status

| Phase | Status |
|-------|--------|
| 1 — Foundation, schema, design system | Done |
| 2 — Auth, onboarding, profiles | Done |
| 3 — Home dashboard, courses | Done |
| 4–10 | Planned |

## Stack

- **Mobile:** React Native, Expo (SDK 58), Expo Router, TypeScript, React Query, Zustand, SecureStore, StyleSheet design tokens
- **Backend:** Node, Express, TypeScript, Prisma, PostgreSQL, JWT (access + refresh rotation), Zod

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (32+ chars each)
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed           # UNILAG, UI, OAU, ABU, UNN + demo user
npm run dev            # http://localhost:4000
```

Demo login: `demo@academia.ng` / `Student123`

### Mobile

```bash
cd mobile
cp .env.example .env    # EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4000/api (not localhost on a device)
npm install
npx expo start
```

Screens: sign in / create account (university → faculty → department cascade, level), Home dashboard
(registered courses, units, recommendations with one-tap enrol), Learn catalogue (search, level and
semester filters, enrol/unenrol, paging) and Profile (academic details, name editing, API server, logout).
Run `npm run typecheck` to check the app without starting Metro.

### Web preview (no Expo needed)

```bash
cd web
python3 -m http.server 3000   # or any static file server
```

Open `http://localhost:3000`. The client calls `http://localhost:4000/api` by default; point it at your
API with the **API server** field on the login screen, or open `http://localhost:3000/?api=https://your-api.vercel.app/api`.

Screens: sign in / create account (university → faculty → department cascade), home dashboard with
registered courses and recommendations, course catalogue with search + level/semester filters and
enrol/unenrol, and profile with name editing and logout.

## Auth API (Phase 2)

- `POST /api/auth/register` — name, email, password, university, faculty, department, level
- `POST /api/auth/login`
- `POST /api/auth/refresh` — token rotation
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `GET /api/auth/universities` (+ nested faculties / departments)
- `GET|PATCH /api/auth/me` — profile (authenticated)

## Security

- bcrypt password hashing (12 rounds)
- JWT access (short-lived) + refresh with server-side rotation & revocation
- Zod validation on all inputs
- No third-party API keys in the mobile app

## License

Private — all rights reserved.
