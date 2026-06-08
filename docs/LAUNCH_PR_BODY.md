# RentEazy App Launch

## Scope

This branch launches the RentEazy app lane:

- app shell with Feed, Swipe, Likes, Post, Profile, Perks, and Billing routes
- RentEazy-native feed and swipe scaffolds
- backend API state/bootstrap/mutation contracts
- honest anonymous preview state
- preview write guards
- Clerk-backed auth bridge where configured
- launch media assets
- API deployment manifest
- deploy/smoke/readiness tooling

## Claude / Codex Split

Claude owns presentational UI polish:

- `src/app/screens/*`
- `src/app/components/*`

Codex owns backend and contracts:

- `server/**`
- `src/lib/feedEngine.js`
- auth helpers
- stored-state keys
- preview write guards
- mutation handlers
- launch scripts

## Verification

Run before deploy:

```powershell
npm test
npm run typecheck:server
npm run build
npm run launch:doctor -- --require-build
```

Run after deploy:

```powershell
$env:RENTEAZY_APP_URL="https://<frontend-host>"
$env:RENTEAZY_API_URL="https://<api-host>"
npm run launch:smoke
```

## Deploy Notes

- Frontend: static Vite build, publish `dist`.
- API: Node service, `npm start`, healthcheck `/api/health`.
- API host must set `CLERK_SECRET_KEY` and `RENTEAZY_ADMIN_EMAILS`.
- Frontend host must set `VITE_RENTEAZY_API_URL` to the deployed API origin.
