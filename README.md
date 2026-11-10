# Academia NG — Next-Generation Nigerian University Academic Platform

Premium, production-oriented academic companion for Nigerian university students.  
Inspired by LFX Academia, rebuilt with modern architecture, stronger learning tools, and a polished mobile experience.

## Architecture Overview

```
academia-ng/
├── backend/                 # Express + Prisma + PostgreSQL API
├── mobile/                  # React Native (Expo) + TypeScript + Expo Router
├── admin/                   # (Phase 10) Admin web dashboard
└── docs/                    # Architecture, API, design system docs
```

### Technology Stack

**Mobile**
- React Native + Expo
- TypeScript
- Expo Router
- NativeWind (Tailwind for RN)
- React Query + Zustand

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT (access + refresh token rotation)
- Zod validation
- Cloudinary, Firebase Cloud Messaging, OpenAI, Paystack

Frontend and backend remain completely separate applications.

## Phase 1 Status (Current)

- [x] Monorepo structure
- [x] Complete project architecture
- [x] Database schema (Prisma)
- [x] API route structure & middleware skeleton
- [x] Design system tokens & base components plan
- [x] Environment variable documentation
- [x] Local development instructions

Later phases will implement authentication, home dashboard, learning module, CBT engine, AI Tutor, GPA calculator, communities, payments, and admin dashboard.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Expo CLI / Expo Go app on device
- Git

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, etc.

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

API will run at `http://localhost:4000`

### 2. Mobile

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Environment Variables

See `backend/.env.example` and `mobile/.env.example`.

Never commit real secrets. Use environment-specific values for development, staging, and production.

## Development Phases

1. **Foundation** (this commit) — architecture, schema, design system, project setup
2. Authentication, onboarding & profiles
3. Home dashboard, universities, courses
4. Learning materials & document management
5. Past questions & CBT examination engine
6. GPA / CGPA calculator
7. AI Academic Tutor
8. Student communities
9. Notifications, payments & subscriptions
10. Admin dashboard, security hardening & production readiness

## Security Notes

- JWT access + refresh token rotation
- Password hashing with bcrypt
- Zod validation on every request
- Rate limiting
- Role-based access control
- Examination answers never sent to the client before submission
- API keys (OpenAI, Cloudinary, Paystack, Firebase) stay on the server only

## License

Private — all rights reserved.
