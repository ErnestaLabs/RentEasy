# RentEazy App Launch PRD

## Scope

Ship the app experience, not another landing-page pass. Claude owns presentational UI. Codex owns state, backend, auth, data contracts, preview behavior, and verification gates.

## Launch Must-Haves

- Anonymous users can preview Feed, Swipe, Likes, Post, Profile, and Billing without seeing fake personal identity or fabricated personal stats.
- Anonymous users cannot write data. Like, post, match, message, save, share reward, billing, and profile mutation actions require account creation.
- Signed-in users land inside the app and can use the same surfaces with persisted local/server-backed state where already wired.
- Feed and Swipe must feel like the product core: social discovery plus focused matching, not admin dashboards.
- No public UI exposes internal terms such as upsell, placeholder, Mastodon, Duolicious, Postiz, Fediverse, ActivityPub, or fake member states.
- Billing and paid visibility stay separate from trust. Paid reach never implies better reputation.
- Pre-deploy readiness can be run with `npm run launch:doctor -- --require-build`.
- Production smoke can be run with `RENTEAZY_APP_URL=<frontend> RENTEAZY_API_URL=<api> npm run launch:smoke`.
- Build, tests, and server typecheck must pass before launch handoff.

## Defer Until After Launch

- Full production marketplace liquidity.
- Production-grade payments and Clerk billing enforcement.
- Full AI personalization and external social ingestion.
- Graph/vector database migration.
- Full ads manager, bidding, conversion pixels, and advertiser self-serve.
- Video rooms and paid communications.

## Codex Lane

- Keep preview state honest and block anonymous writes server-side.
- Keep `/api/bootstrap` and mutation contracts stable for Claude.
- Remove launch-breaking fake personal identity fallbacks.
- Preserve app route/data wiring while Claude changes visual UI.
- Keep tests/build green after each backend or contract change.

## Deployment Contract

- The app can be hosted as a static Vite build, but the Node API must be deployed separately with `npm start`.
- `railway.json` is the API deployment manifest: Nixpacks build, `npm start`, `/api/health` healthcheck, restart on failure.
- Production frontend deployments must set `VITE_RENTEAZY_API_URL` to the deployed API origin. Without it, a static host rewrites `/api/*` to `index.html` and the app falls back to offline/demo state.
- API deployments must set `CLERK_SECRET_KEY` for Clerk token verification.
- API deployments must set `RENTEAZY_ADMIN_EMAILS` to a comma-separated list of admin emails before exposing moderation tools.
- `PORT` is respected by the API host; `RENTEAZY_API_PORT` is only the local fallback.

## Claude Lane

- UI-only polish on `src/app/screens/*` and presentational `src/app/components/*`.
- Fix the Post preview gate so it has clear value, not empty space.
- Fix mobile overflow on Likes at 440px and below.
- Keep the Swipe screen focused: no distracting panels inside the swipe moment.
- Do not edit backend, server routes, auth logic, stored-state keys, feed ranking, or write handlers.

## Launch QA Checklist

- `/app/feed` loads for anonymous and signed-in states.
- `/app/swipe` shows a focused deck; anonymous swipe attempts prompt account creation, not daily-limit copy.
- `/app/post` explains why creating an account is worth it and does not look empty.
- `/app/profile` does not show a hardcoded member identity to anonymous visitors.
- `/app/likes` has no horizontal clipping at 440px.
- `/app/billing` uses product language, not internal monetization language.
- `npm run launch:doctor -- --require-build` passes before deployment.
- `RENTEAZY_APP_URL=<frontend> RENTEAZY_API_URL=<api> npm run launch:smoke` passes against the deployed app/API.
- Tests, server typecheck, and build pass.
