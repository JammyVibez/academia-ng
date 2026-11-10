# Academia NG — System Architecture (Phase 1)

## High-Level Overview

```
┌─────────────────────┐     HTTPS / JWT      ┌──────────────────────┐
│  Mobile App         │ ◄──────────────────► │  Express API         │
│  (Expo + RN)        │                      │  (Node + TypeScript) │
│  Expo Router        │                      │  Prisma + PostgreSQL │
│  React Query        │                      │  Zod + JWT           │
│  Zustand            │                      └──────────────────┬───────────┘
└─────────────────────┘                                 │
                                                        │
                       ┌────────────────────────────────┼───────────────┐
                       │                                │                │
                       ▼                                ▼                ▼
                ┌─────────────┐               ┌──────────────┐   ┌────────────┐
                │ Cloudinary  │               │ OpenAI API   │   │ Paystack    │
                │ (files)     │               │ (AI Tutor)   │   │ (payments)  │
                └─────────────┘               └──────────────┘   └────────────┘
```

## Mobile Navigation (Bottom Tabs)

1. **Home** — personalised dashboard
2. **Learn** — course library & materials
3. **CBT** — past questions & timed exams
4. **AI Tutor** — academic assistant
5. **Profile** — settings, GPA, academic info

Community is reachable from Home and dedicated entry points.

## Database Entities (Prisma)

Core models defined in `backend/prisma/schema.prisma`:

- **User** + RefreshToken (auth)
- **University → Faculty → Department → Course**
- **Resource** (lecture notes, PDFs, videos)
- **PastQuestionSet → Question**
- **Exam → ExamAttempt** (CBT engine; correct answers never sent pre-submission)
- **GpaRecord**
- **Community → CommunityPost → CommunityComment**
- **Notification**, **Subscription**

Roles: `STUDENT | MODERATOR | CONTENT_MANAGER | ADMINISTRATOR | SUPER_ADMIN`

## API Structure (REST)

All routes under `/api/*`. Planned modules:

| Module          | Base Path              | Phase |
|-----------------|------------------------|-------|
| Health          | `/api/health`          | 1     |
| Auth            | `/api/auth`            | 2     |
| Users           | `/api/users`           | 2     |
| Universities    | `/api/universities`    | 3     |
| Courses         | `/api/courses`         | 3     |
| Resources       | `/api/resources`       | 4     |
| Exams / CBT     | `/api/exams`           | 5     |
| GPA             | `/api/gpa`             | 6     |
| AI Tutor        | `/api/ai`              | 7     |
| Communities     | `/api/communities`     | 8     |
| Notifications   | `/api/notifications`   | 9     |
| Payments        | `/api/payments`        | 9     |
| Admin           | `/api/admin/*`         | 10    |

## Security Principles

- Access + refresh token rotation
- bcrypt password hashing
- Zod validation on every input
- Role-based middleware
- Rate limiting
- Examination integrity: correct answers stay server-side until submission
- All third-party API keys live only on the backend

## Design System (Mobile)

See `docs/DESIGN_SYSTEM.md`.

Calm, sophisticated, professional. Excellent typography, consistent spacing, refined cards, light + dark themes. No excessive gradients or neon colours.
