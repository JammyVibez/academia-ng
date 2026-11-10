# Phase 2 Complete — Authentication & Profiles

## Backend (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create student account |
| POST | `/login` | No | Email + password |
| POST | `/refresh` | No | Rotate refresh token |
| POST | `/logout` | No | Revoke refresh token |
| POST | `/forgot-password` | No | Placeholder reset |
| GET | `/universities` | No | List active universities |
| GET | `/universities/:id/faculties` | No | Faculties for university |
| GET | `/faculties/:id/departments` | No | Departments for faculty |
| GET | `/me` | Yes | Current profile |
| PATCH | `/me` | Yes | Update profile |

### Security
- bcrypt (12 rounds)
- JWT access (15m) + refresh (7d) with rotation
- Refresh tokens stored and revoked on logout / reuse
- Zod validation on all inputs
- Correct answers never exposed (CBT later)

### Seed
```bash
cd backend
npx prisma db seed   # or npm run seed
```
Demo: `demo@academia.ng` / `Student123`

## Mobile
- Auth gate on launch (SecureStore tokens)
- Login / Register / Forgot password screens
- University → Faculty → Department cascading pickers
- Profile screen with edit name + logout
- Home greets by name and shows academic context
- Axios interceptor auto-refreshes access token

## How to run

1. Backend: set `.env`, `npm install`, `npx prisma migrate dev`, `npm run seed`, `npm run dev`
2. Mobile: set `EXPO_PUBLIC_API_URL`, `npm install`, `npx expo start`

## Next: Phase 3
Home dashboard data, university/course management endpoints.
