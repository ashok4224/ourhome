<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7898b336-1486-48d8-a0b5-d7218e906a45

## Run Locally

OurHome is a microservices app — see [ARCHITECTURE.md](ARCHITECTURE.md) for the full service breakdown.

**Prerequisites:** Node.js, PostgreSQL (or Docker)

1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env` and fill in at least `DATABASE_URL`, `JWT_SECRET`, and `INTERNAL_SERVICE_TOKEN` (required — the app won't boot without them)
3. Start Postgres (`docker compose up -d postgres`, or point `DATABASE_URL` at your own), then run migrations: `npm run db:migrate` and seed demo data: `npm run db:seed`
4. Run all 7 services + the gateway locally (no Docker needed for this step):
   `npm run dev`
5. Open `http://localhost:3000`

To run the whole stack containerized instead: `docker compose up -d` (builds and starts every service, including Postgres).
