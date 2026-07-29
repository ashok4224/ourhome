# Architecture

OurHome is a microservices application: 7 domain services plus a gateway,
each independently deployable, talking to each other over plain HTTP, and
verifying auth independently via a shared JWT. One Postgres database is
still shared across all of them — see "Data ownership" below for what that
does and doesn't buy you.

## Services

| Service | Port | Owns (Prisma models) |
|---|---|---|
| `auth-service` | 4001 | `User` — the only service that signs a JWT; see Auth below |
| `properties-service` | 4002 | `Property` |
| `appointments-service` | 4003 | `Appointment` |
| `inquiries-service` | 4004 | `Inquiry` — also exposes an internal endpoint (see below) |
| `favorites-service` | 4005 | `SavedProperty` |
| `support-service` | 4006 | `SupportRequest` |
| `chat-service` | 4007 | `ChatMessage`, `ChatInvitation`, plus an in-process SSE hub |
| `gateway` | 3000 | nothing — the only public entry point, reverse-proxies to everything above and serves the frontend |

Each service is its own npm workspace under `services/<name>/`, with the same
internal shape: `index.ts` (composition root — Express app, health check,
mounts the router), `routes.ts` (thin HTTP layer), `service.ts` (business
logic + the only code in that service allowed to call `prisma.<Model>` for
the models it owns), `config.ts` (env var loading). `packages/shared/` holds
everything more than one service needs — JWT sign/verify, the auth
middleware, the logger, Zod validation schemas, the Prisma client, and the
inert (not-yet-wired-to-a-route) payments/notifications/maps integration
adapters.

## Auth: stateless JWT

`auth-service` is the only service that signs a JWT (on `POST /api/auth/login`,
via `packages/shared/src/jwt.ts`), delivered as an httpOnly, `sameSite=lax`
cookie (`ourhome.jwt`). Every other service verifies that JWT independently
via `requireAuth`/`requireRole` from `@ourhome/shared` — there is no shared
session store and no service calls auth-service to check if a request is
authenticated. `JWT_SECRET` must be identical across every service (it's how
"signed by auth-service" and "verified by properties-service" agree on
trust) — set once, shared via `docker-compose.yml` / the k8s Secret.

24h expiry, no refresh-token flow. That's a known simplification, not an
oversight — add refresh tokens if/when session length becomes a real
product problem.

## Data ownership: shared Postgres, per-service discipline

One database, one `prisma/schema.prisma`, but each service's `service.ts`
only queries the Prisma models listed in the table above. This is a
**convention, not a hard wall** — nothing at the database or Prisma level
stops, say, `support-service` from importing `prisma.property` if someone
writes that code. The accepted trade-off: you keep referential integrity
(the `Property → Inquiry` foreign key still works at the DB level) and skip
the real cost of DB-per-service (distributed transactions, data
duplication/sync) — at the cost of every service being coupled to the same
database's uptime and schema migrations. Revisit this if/when a service
needs to scale its data layer independently of the others.

**The one place this boundary was actually enforced over the network**, not
just by convention: `properties-service` needs each property's inquiry
count. It used to be a Prisma relation `include` straight into the Inquiry
table (fine in a monolith); now it's a real HTTP call —
`GET /internal/inquiry-counts?propertyIds=...` on `inquiries-service`
(`services/inquiries-service/src/internalRoutes.ts`), batched, guarded by a
shared `INTERNAL_SERVICE_TOKEN` header (not a public gateway path), called
from `services/properties-service/src/inquiriesClient.ts`. If
`inquiries-service` is unreachable, `properties-service` logs a warning and
degrades to showing `0` rather than failing the whole properties list —
deliberately, so one service being down doesn't cascade.

## Gateway: dumb proxy, on purpose

`services/gateway` has no auth logic and no business logic. It reverse-proxies
`/api/<domain>/*` to the matching service (`services/gateway/src/proxy.ts`)
using `http-proxy-middleware`, mounted so the full path (including the
`/api/<domain>` prefix) reaches the backend unchanged — every service mounts
its router at that exact same public path, so a request looks identical
whether you hit it through the gateway or the service directly. It also
serves the frontend (Vite dev middleware in development, the built `dist/`
in production — same logic the old monolith's `server.ts` had) and exposes
`GET /api/health`, which fans out to every service's own `/health` and
returns an aggregate (`services/gateway/src/health.ts`).

The gateway deliberately does **not** parse JSON request bodies — doing so
would drain the request stream before the proxy could forward it untouched,
breaking every proxied POST/PATCH. Each backend service parses its own body.

## Known, explicitly-accepted limitations

- **chat-service's real-time state is in-process memory** (connected SSE
  clients, live typing indicators — `services/chat-service/src/realtime.ts`).
  Now that chat is a genuinely separate deployable service, this is the
  concrete thing that breaks the moment it runs more than one replica: a
  broadcast on one pod never reaches a client connected to another. The k8s
  manifest pins `chat-service` to `replicas: 1` for exactly this reason. Add
  Redis pub/sub before ever scaling it — this is the single highest-priority
  follow-up once real traffic shows up.
- **Shared-DB discipline is convention-enforced**, as above.
- **No refresh tokens.**
- **`k8s/` is a baseline**, not production-hardened: no autoscaling, no
  service mesh, no NetworkPolicies, no external secrets manager. See
  `k8s/README.md`.

## Local development

`npm run dev` at the repo root starts all 8 processes (7 services + gateway)
via `concurrently`, each with plain `tsx watch` — no Docker required day to
day. `docker compose up -d` runs the same set as containers, wired by
Docker's compose-network DNS (each service reachable at its compose service
name). Both need `JWT_SECRET`, `INTERNAL_SERVICE_TOKEN`, and `DATABASE_URL`
set — see `.env.example`.

## Adding a new external integration

Unchanged from before this pass — `packages/shared/src/integrations/<capability>/`
holds a provider-agnostic adapter (`types.ts` interface, `noop.ts` default,
a real implementation, `index.ts` picking one based on env vars). None of
`payments`, `notifications`, or `maps` are wired into a live route yet; when
a real feature needs one, the owning service imports it directly from
`@ourhome/shared`.
