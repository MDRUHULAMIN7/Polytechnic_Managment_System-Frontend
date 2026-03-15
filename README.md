# PMS Frontend

Modern frontend for the Polytechnic Management System (PMS). Built with Next.js App Router and a UI stack optimized for fast, responsive public pages plus role-based dashboards.

## Highlights

- Public marketing pages (home, notices, events, alumni, departments, admissions, contact).
- Notice board with detail pages and read/acknowledge UX.
- Role-based dashboards for admin, instructor, and student flows.
- Real-time notifications (socket.io) with sound levels + toast alerts.
- Notification bell + notice dropdown.
- Public chatbot assistant (backend-powered).
- Theme toggle (light/dark) with consistent design tokens.
- Responsive public navbar + mobile sidebar with blur overlay.
- Rich motion UI using Framer Motion + GSAP.

## Tech Stack

- Next.js 16 (App Router + Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- React Hook Form
- socket.io-client
- Framer Motion + GSAP
- Vitest + Playwright

## Project Structure

- `app/` — route segments and layouts (public + dashboard).
- `components/` — shared UI, public sections, dashboard modules.
- `lib/` — API clients and domain logic.
- `utils/` — helpers (toasts, formatting, etc.).

## Environment

Set the API base URL for the backend:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-host/api/v1
```

Optional: set an explicit Socket.IO base URL (defaults to API base URL without `/api/v1`).

```
NEXT_PUBLIC_SOCKET_URL=https://your-backend-host
```

## Setup

```bash
cd frontend
npm install
npm run dev
```

Run the app at:

```
http://localhost:3000
```

## Scripts

- `npm run dev` — local dev (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint
- `npm run test` — unit tests (Vitest)
- `npm run test:watch` — watch tests
- `npm run test:e2e` — Playwright e2e
- `npm run test:e2e:list` — list e2e tests

## Notes

- Backend login endpoint used: `POST /api/v1/auth/login`
- Role routes exist for `admin`, `superAdmin`, `instructor`, `student`
- Current route guard allows `admin` and `superAdmin` into dashboard routes
- Session is stored in browser storage/cookie for frontend routing

## Users Credentials

Use the following accounts for testing:

- SuperAdmin
  - ID: 0001
  - Password: admin12345
- Admin
  - ID: A-0001
  - Password: admin1234
- Instructor
  - ID: I-0003
  - Password: Instructor@123
- Student
  - ID: 2027010001
  - Password: ruhul1234

