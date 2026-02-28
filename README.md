# envii

**envii** is an open-source SaaS platform + CLI for securely backing up, versioning, and sharing environment variables across teams and projects.

> **Live demo:** [hosted on pxl](https://envii.pxl.app) &nbsp;·&nbsp; **Database:** Supabase (PostgreSQL)

---

## What it does

- Back up `.env` files with full version history and encrypted storage
- Restore any previous version from the web app or CLI with one command
- Share repos with teammates using role-based access (Owner, Editor, Contributor, Viewer)
- Explore public env templates from the community marketplace
- Subscribe to paid plans via Paystack with webhook-driven billing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Auth | NextAuth v5 (Google, GitHub, credentials) |
| Payments | Paystack |
| Realtime | Supabase Realtime channels |
| AI | Groq API (llama-3.3-70b-versatile) |
| Editor | Monaco Editor |
| Styling | Tailwind CSS 4 + Radix UI |
| CLI | Node.js npm package (`envii-cli`) |
| Testing | Jest + Cypress |
| CI/CD | GitHub Actions |

---

## Features

- **Encrypted backup & restore** — AES-256-GCM encryption, optional zero-knowledge mode
- **Version history** — commit messages, diffs, and one-click rollback
- **Public/private repos** — stars, forks, follows, trending feed, and search
- **Team collaboration** — invite members, assign roles, audit logs
- **Billing** — Free, Basic (₦800), Pro (₦2400), Team (₦4000) via Paystack subscriptions
- **AI suggestions** — Groq-powered env key suggestions with fallback
- **CLI tool** — `login`, `init`, `backup`, `restore`, `push`, `pull`, `fork`, `star`, `watch`
- **Integrations** — Slack export, CI/CD config export
- **Referrals & notifications** — credit system and in-app notification feed
- **PWA** — service worker with offline fallback
- **Observability** — Sentry error tracking + PostHog analytics

---

## Project Structure

```
envii/
├── app/                  # Next.js pages and API routes
│   ├── api/              # 35+ API endpoints
│   ├── dashboard/
│   ├── editor/
│   ├── explore/
│   ├── billing/
│   └── ...
├── lib/                  # Shared server/client utilities
│   ├── crypto.ts         # AES-256-GCM encryption
│   ├── plans.ts          # Billing plan definitions
│   ├── paystack.ts       # Paystack client
│   └── supabase.ts       # Supabase client
├── prisma/
│   └── schema.prisma     # Database schema
├── cli/                  # envii-cli npm package
├── .github/workflows/    # CI and CLI publish pipelines
└── .env.example          # All required environment variables
```

---

## Self-Hosting

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Paystack](https://paystack.com) account (for billing)

### 1. Clone and install

```bash
git clone https://github.com/AbasThomas/envvy.git
cd envii
npm install
cd cli && npm install && cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`. The required variables are:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Supabase direct connection (for Prisma migrations) |
| `AUTH_SECRET` | Random secret for NextAuth sessions |
| `ENCRYPTION_MASTER_KEY` | 32+ character key for AES-256-GCM |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |

Optional variables (OAuth, AI, analytics, error tracking) are documented in `.env.example`.

### 3. Set up the database

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Deploying to Production

### Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy the **Connection string** (pooled) into `DATABASE_URL` and the **Direct connection** into `DIRECT_URL`.
3. Copy your project URL and keys into the `NEXT_PUBLIC_SUPABASE_*` variables.

### Vercel (or any Node host)

1. Push the repo to GitHub.
2. Import the project in Vercel and add all variables from `.env.example` in the project settings.
3. Set the Paystack webhook URL in your Paystack dashboard:

```
https://<your-domain>/api/webhooks/paystack
```

4. Deploy:

```bash
vercel --prod
```

---

## CLI

The CLI is a standalone npm package in `./cli`.

```bash
npm install -g envii-cli

envii login           # authenticate with your envii account
envii init            # link current directory to a repo
envii backup          # push current .env to envii
envii restore         # pull the latest version
envii list            # list all versions
envii commit -m "msg" # backup with a commit message
envii push            # push to a remote repo
envii pull            # pull from a remote repo
envii fork <slug>     # fork a public repo
envii star <slug>     # star a public repo
envii watch           # watch for .env changes and auto-backup
```

### Publish CLI to npm

Add `NPM_TOKEN` to your GitHub repository secrets, then trigger:

```bash
gh workflow run publish-cli.yml
```

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes and add tests where appropriate
3. Run the test suite: `npm test`
4. Open a pull request with a clear description of what changed and why

Please keep PRs focused — one feature or fix per PR.

---

## Security

- All env values are encrypted with AES-256-GCM before being stored (`lib/crypto.ts`)
- Optional zero-knowledge mode: encrypt on the client before sending
- Rate limiting is applied to all API routes (`middleware.ts`)
- Security headers are set in `next.config.ts` and `vercel.json`

To report a security vulnerability, please open a [GitHub issue](https://github.com/your-username/envii/issues) marked **[SECURITY]** or email directly.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
