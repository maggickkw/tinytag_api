**Project Overview**

- **Name:** Tinytag API
- **Description:** Backend REST API for the Tinytag application. Provides user authentication, session management, verification codes, and basic user endpoints.
- **Location:** Source lives under [src](src)

**Tech Stack**

- **Runtime:** `Node.js` (TypeScript)
- **Framework:** `Express` (v5)
- **Database:** `MongoDB` via `mongoose`
- **Auth:** `jsonwebtoken` and password hashing with `bcryptjs`
- **Validation:** `joi` / `zod` (project uses one or both in schema files)

**Quick Links**

- Package manifest: [package.json](package.json)
- App entry: [src/index.ts](src/index.ts)
- Configuration: [src/config](src/config)
- Routes: [src/routes](src/routes)
- Controllers: [src/controllers](src/controllers)
- Services: [src/services](src/services)

**Prerequisites**

- `Node.js` (16+ recommended)
- `npm` or `yarn`
- A running MongoDB instance (local or remote)

**Environment**

Create a `.env` file at the project root (or provide env vars via your deployment) with at least the following values. These names are typical for this project — confirm exact names inside [src/config](src/config).

- `PORT` — port to run the server (default `3000`)
- `MONGODB_URI` — MongoDB connection URI
- `JWT_SECRET` — secret used to sign JWTs
- `JWT_EXPIRES_IN` — optional, token lifetime (e.g., `1h`)
- `RESEND_API_KEY` — (if using Resend for email sending) API key
- `EMAIL_FROM` — sender address used in outgoing emails

**Install & Run**

- Install dependencies:

```bash
npm install
```

- Run in development mode (auto-reloads TypeScript changes):

```bash
npm run dev
```

- Build and run production bundle:

```bash
npm run build
npm start
```

**Available NPM scripts**

- **dev:** runs `ts-node-dev --poll --files src/index.ts index.d.ts` for local development
- **build:** runs `tsc` after cleaning `dist`
- **start:** compiles and runs `dist/index.js`

**Project Structure (high level)**

- `src/index.ts` — application entry and server bootstrap
- `src/config/` — db and third-party configuration (e.g., Resend)
- `src/constants/` — app-wide constants and enums
- `src/controllers/` — request handlers mapping routes to business logic
- `src/routes/` — Express route definitions (e.g., `auth.route.ts`, `user.route.ts`)
- `src/services/` — encapsulated business logic used by controllers
- `src/models/` — Mongoose schema models
- `src/middleware/` — auth and error handling middleware
- `src/utils/` — helpers and utilities (hashing, JWT helpers, mail sending)

**API Endpoints (summary)**

The project organizes endpoints under routes in [src/routes](src/routes). Typical endpoints include:

- `POST /auth/register` — register a new user (controller: `auth.controller.ts`)
- `POST /auth/login` — authenticate and receive a JWT
- `POST /auth/verify` — verify email or verification code
- `GET /session` — session-related endpoints (see [src/routes/session.route.ts](src/routes/session.route.ts))
- `GET /users` / `GET /users/:id` — user retrieval and management (see [src/routes/user.route.ts](src/routes/user.route.ts))

Refer to each route file in [src/routes](src/routes) and controllers in [src/controllers](src/controllers) for exact parameters, request bodies, and responses.

**Authentication**

- JWT-based authentication. Inspect `src/middleware/authenticate.ts` and `src/utils/jwt.ts` for token handling and required headers.
- Cookies may be used depending on configuration (`src/utils/cookies.ts`).

**Database & Models**

- Mongoose is used for schema definitions located in [src/models](src/models). Connect logic is in [src/config/db.ts](src/config/db.ts).

**Emailing**

- The project includes integration with Resend (`resend` package) and `nodemailer` utilities. See [src/config/resend.ts](src/config/resend.ts) and `src/utils/sendMail.ts`.

**Error Handling**

- Centralized error handling middleware is in [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts). Application-specific errors use `src/utils/AppError.ts` and assertions in `src/utils/appAssert.ts`.

**Testing**

- There are no tests included by default. Add unit and integration tests (e.g., with Jest or Vitest) to validate controllers and services.

**Linting & Formatting**

- This repository does not include ESLint/Prettier config by default; consider adding them for consistent style.

**Contributing**

- Fork the repo and open a PR with a clear description.
- Follow the existing TypeScript patterns and add tests for new functionality.

**Deployment Notes**

- Build with `npm run build` and run `npm start`.
- Ensure environment variables are provided to your host (e.g., in Docker, cloud provider env settings, or a process manager like PM2).

**Troubleshooting**

- If the server can't connect to MongoDB, check `MONGODB_URI` and network access.
- If JWT auth fails, confirm `JWT_SECRET` matches the value used when generating tokens.

**License**

- Add a license file if you plan to open-source the project (e.g., `MIT`).

**Further Improvements**

- Add automated tests and CI (GitHub Actions).
- Add API documentation (OpenAPI/Swagger).
- Add role-based access control and rate limiting for security.

**Caching, Queues & Background Jobs**

- Recommended for production workloads that need background processing, retries, delayed jobs, or fast shared caching.
- Redis: common choice to power caching, session stores, rate limiting, and job queues. Use a managed Redis instance (e.g., Redis Cloud, AWS ElastiCache) for reliability.
- Queue libraries:
	- `BullMQ` / `bull` — Redis-backed job queue with retries, delayed jobs, and concurrency control.
	- `bee-queue` — lightweight Redis queue alternative.
	- Message brokers (RabbitMQ, Kafka) — use when you need advanced messaging guarantees, pub/sub, or stream processing.
- Use-cases in this project:
	- Send verification emails and follow-ups via background workers instead of synchronous controller calls (`src/utils/sendMail.ts`).
	- Offload heavy tasks (image processing, analytics events) to worker processes.
	- Cache frequently-read DB queries or computed responses to reduce MongoDB load.
- Typical environment variables:

	- `REDIS_URL` — Redis connection URI
	- `QUEUE_NAME` — default queue name used by workers
	- `WORKER_CONCURRENCY` — number of worker threads/processes

- Implementation tips:
	- Keep job payloads small and idempotent-friendly.
	- Use separate Redis instances or logical databases for caching vs job queues in high-volume apps.
	- Add health checks for worker processes and visibility into queue lengths/failed jobs (e.g., BullMQ UI).


If you'd like, I can also:

- add `.env.example`, or
- scaffold tests and CI configuration.
