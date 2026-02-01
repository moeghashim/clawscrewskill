# Mission Control — Babanuj Ops

Real-time operations hub for Babanuj. Mission Control coordinates SEO, paid media, social content, customer support, and B2B relationships in one dashboard with live task tracking, approvals, and KPI visibility.

## Stack
- **Next.js (App Router) + TypeScript**
- **Convex** for realtime database + storage
- **Vercel** for hosting

## Features (current)
- Live dashboard (agents, KPIs, tasks)
- Support queue view (SLA + priority)
- B2B pipeline board (by stage)
- Approvals queue
- Activity feed

## Setup
```bash
cd mission-control
npm install
```

### 1) Configure Convex
```bash
npx convex dev --once
```

### 2) Seed starter data
```bash
npx convex run seed:run
```

### 3) Run locally
```bash
npm run dev
```
Open http://localhost:3000

## Deploy (Vercel)
- Project root: `mission-control`
- Set `NEXT_PUBLIC_CONVEX_URL` from `.env.local`

## Repo Notes
- Convex functions live in `convex/`
- UI is in `src/app/page.tsx`
- Spec: `docs/mission-control-spec.md`

## Roadmap
- Task detail drawer + comments
- Approvals actions (approve/reject)
- B2B pipeline actions
- Support SLA rules + filters
- Daily standup generator + Telegram digest
