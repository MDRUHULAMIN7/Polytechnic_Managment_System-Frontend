# PMS Frontend

Frontend for the PMS backend using:

- Next.js 16 (App Router + Turbopack)
- TypeScript
- Tailwind CSS v4
- socket.io
- React Hook Form
- Lucide React icons
- Framer Motion + GSAP animations

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Backend login endpoint used: `POST /api/v1/auth/login`
- Only `admin` and `superAdmin` are allowed into dashboard routes for now.
- Session is currently stored in browser storage/cookie for frontend routing.
