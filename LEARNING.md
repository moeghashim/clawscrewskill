# Learning

## ClawsCrew
- Repo root contains `/ui`, `/convex`, `/skill` only.
- Auth is single-user via `ADMIN_EMAIL` + `ADMIN_PASSWORD` (no email flows).
- Convex is the backend; CLI uses `MISSION_CONTROL_CONVEX_URL` + deploy key.
- UI uses Technical Minimalist styling (Paper #F7F7F5, Forest Green #1A3C2B, hairline borders).
- Convex + skill packages are set to ESM (`"type": "module"`) to support generated API imports.
