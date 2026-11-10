# Phase 3 — Home dashboard, courses & enrolments

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/courses` | No | List/filter courses |
| GET | `/api/courses/:id` | No | Course detail |
| GET | `/api/courses/me/dashboard` | Yes | Home dashboard payload |
| GET | `/api/courses/me/enrolled` | Yes | My registered courses |
| POST | `/api/courses/enroll` | Yes | Enrol `{ courseId }` |
| DELETE | `/api/courses/enroll/:courseId` | Yes | Unenrol |

Query filters: `universityId`, `departmentId`, `facultyId`, `academicLevel`, `semester`, `search`, `page`, `limit`

## Schema

- `CourseEnrollment` (userId + courseId unique)

## Mobile

- Home: loads dashboard (registered, continue learning, recommended)
- Learn: course catalogue + enrol/unenrol

## Seed

8 UNILAG CS courses; demo user enrolled in 3 Year 2 courses.
