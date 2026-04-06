# PMS Frontend

Production-facing Next.js frontend for the Polytechnic Management System. This app combines a public institutional website with role-aware dashboards for `student`, `instructor`, `admin`, and `superAdmin` users.

Live site: [https://polytechnic-managment.vercel.app/](https://polytechnic-managment.vercel.app/)

## Overview

The frontend is built around two major experiences:

- Public website pages for visitors, guardians, faculty discovery, events, notices, and institutional updates.
- Secure dashboard experiences for academic operations, classroom delivery, profile management, and administrative control.

The current build includes recent production-grade improvements such as:

- role-aware student, instructor, admin, and super admin overview dashboards
- responsive analytics charts for admin operations
- profile update flow with image upload support
- realtime notifications with sound controls
- backend wake-up modal for slow first requests on free hosting

## Core Product Areas

### Public experience

- Home landing page
- Academic calendar
- Academic instructor directory and detail pages
- Events page
- Notices listing and detail pages
- Alumni page
- Public chatbot entry point
- Responsive public navbar with login-aware actions

### Dashboard experience

- Student dashboard with semester-aware class overview
- Instructor dashboard with teaching workload overview
- Admin dashboard with operational KPIs and interactive charts
- Super admin extended overview with user-access monitoring
- Profile page with editable personal details and profile image upload
- Role-safe routing and forbidden handling

### Platform UX systems

- Light and dark theme support
- Toast-based feedback
- Realtime notification bell and dropdown
- Socket.IO-powered live updates
- Motion-enhanced UI with Framer Motion and GSAP
- Backend cold-start communication modal for first public visits

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- TanStack Query
- Chart.js + react-chartjs-2
- Framer Motion
- GSAP
- React Hook Form
- socket.io-client
- Vitest
- Playwright

## Repository Layout

- `app/`
  Next.js route tree for public pages, auth flows, API routes, and dashboards.
- `components/`
  Shared UI, public sections, dashboard modules, providers, and interaction shells.
- `lib/`
  API clients, server helpers, domain types, and integration utilities.
- `actions/`
  Server actions for write operations in dashboard flows.
- `utils/`
  Formatting, query helpers, toast helpers, and dashboard utilities.
- `tests/`
  Unit and e2e tests.

## Key Environment Variables

Create `frontend/.env` with the values that match your deployment:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-host/api/v1
NEXT_PUBLIC_SITE_URL=https://your-frontend-host
NEXT_PUBLIC_SOCKET_URL=https://your-backend-host
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` is required.
- `NEXT_PUBLIC_SITE_URL` is recommended for proper metadata and canonical URL generation.
- `NEXT_PUBLIC_SOCKET_URL` is optional. If omitted, the app derives the socket base URL from `NEXT_PUBLIC_API_BASE_URL`.

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Default local URL:

```txt
http://localhost:3000
```

## Available Scripts

- `npm run dev` starts the local development server with Turbopack.
- `npm run build` creates the production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.
- `npm run test` runs Vitest unit tests.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run test:e2e` runs Playwright e2e tests.
- `npm run test:e2e:list` lists available Playwright tests.

## Authentication and Session Notes

- The frontend consumes the backend auth flow through `/api/auth/login` and `/api/auth/logout`.
- Role-aware navigation and route protection rely on cookies such as `pms_access_token` and `pms_role`.
- Theme preference is persisted through `pms_theme`.
- Dashboard access is segmented for `student`, `instructor`, `admin`, and `superAdmin`.

## Deployment Notes

The live frontend is deployed on Vercel:

- Live URL: [https://polytechnic-managment.vercel.app/](https://polytechnic-managment.vercel.app/)

Recommended production setup:

1. Deploy the frontend to Vercel.
2. Point `NEXT_PUBLIC_API_BASE_URL` to the backend REST API.
3. Point `NEXT_PUBLIC_SOCKET_URL` to the backend host if realtime notifications are enabled.
4. Ensure the backend `CORS_ORIGINS` includes the frontend domain.

### Cold-start UX note

If the backend is hosted on a free tier that sleeps after inactivity, the frontend now includes a wake-up modal on public routes. The modal only appears when the first health-check request is slow enough to affect UX, so normal visits are not impacted.

## Quality and Maintenance

This frontend is structured for ongoing feature growth:

- route-level server rendering for dashboard data assembly
- reusable domain types across modules
- server/client API helpers split by responsibility
- responsive and theme-safe UI patterns
- dedicated providers for query state and realtime notifications

## Demo Access

If you are running seeded local/demo data, these sample accounts may exist:

- Super Admin
  ID: `0001`
  Password: `admin12345`
- Admin
  ID: `A-0001`
  Password: `admin1234`
- Instructor
  ID: `I-0003`
  Password: `Instructor@123`
- Student
  ID: `2027010001`
  Password: `ruhul1234`

Use demo credentials only for local or controlled environments.
