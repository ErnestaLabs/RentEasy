# RentEazy Launch Handoff

Branch: `app-ui-uplift`

## Current State

- App/backend launch branch is pushed to origin.
- Local launch gates are green.
- Frontend is a static Vite build.
- API is a Node service started with `npm start`.
- `railway.json` is the API deploy manifest.
- `netlify.toml` keeps `/api/*` from being swallowed by the SPA fallback.

## Claude UI Lane

Claude should continue UI-only work on:

- `src/app/screens/*`
- `src/app/components/*`

Do not touch:

- `server/**`
- `src/lib/feedEngine.js`
- auth helpers
- stored-state keys
- preview write guards
- mutation handlers
- launch scripts

Highest-priority UI items:

1. Make `/app/post` preview feel valuable, not empty.
2. Fix `/app/likes` overflow at `440px` and below.
3. Keep `/app/swipe` focused: no side panels or distracting mechanics inside the swipe moment.
4. Keep Feed social and relaxed; avoid admin/dashboard language.

## Codex Backend Contract

Anonymous preview users:

- can browse Feed, Swipe, Likes, Post, Profile, Billing
- cannot like, save, post, match, message, share, buy, boost, mark read, mutate profile, or write signals
- must not see fake personal identity or invented personal stats

Signed-in users:

- use the same screens
- can write via the API where handlers are already wired
- are identified through Clerk when `CLERK_SECRET_KEY` is present

## Pre-Deploy Gate

Run before deploying:

```powershell
npm test
npm run typecheck:server
npm run build
npm run launch:doctor -- --require-build
```

Expected:

- all tests pass
- build exits successfully
- launch doctor passes every check

Known build warnings:

- Clerk package references unresolved internal image aliases during Vite build.
- These warnings are non-fatal as long as `npm run build` exits `0`.

## Deploy Contract

Frontend host:

- build command: `npm run build`
- publish directory: `dist`
- set `VITE_RENTEAZY_API_URL` to the deployed API origin

API host:

- deploy from the same branch
- start command: `npm start`
- healthcheck: `/api/health`
- set `CLERK_SECRET_KEY`
- set `RENTEAZY_ADMIN_EMAILS`
- set `PORT` if the platform does not inject one

## Post-Deploy Smoke

Run after frontend and API are live:

```powershell
$env:RENTEAZY_APP_URL="https://<frontend-host>"
$env:RENTEAZY_API_URL="https://<api-host>"
npm run launch:smoke
```

This verifies:

- API health
- API bootstrap response shape
- `/app/feed`
- `/app/swipe`
- `/app/post`
- `/app/profile`
- `/app/likes`
- `/app/billing`
- frontend host does not rewrite `/api/bootstrap` to HTML
- forbidden public launch terms are absent

## Current External Blocker

GitHub CLI is not authenticated in this environment, so Codex cannot create, merge, or inspect the PR from here. A logged-in operator must create/land the PR or authenticate `gh`, then run the deploy and smoke sequence above.
