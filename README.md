# envii

envii is a full-stack SaaS + CLI platform for environment variable backup and collaboration.

- Web app: Next.js App Router + Prisma + NextAuth + Supabase + Paystack
- CLI: `envii-cli` with login/init/backup/restore/list/commit/push/pull/fork/star/watch
- Pricing: Free, Basic (₦800), Pro (₦2400), Team (₦4000)

## Features Implemented

- Encrypted env backup and restore with version history
- Public/private repo model with stars, forks, follows, trending, and search
- Team sharing via invites and role-based access
- Paystack billing initialization, verification, and webhook processing
- AI env suggestions endpoint (Groq + fallback)
- Slack + CI export integrations
- Referrals, notifications, analytics endpoint, templates marketplace base
- Monaco editor page with real-time activity channel (Supabase Realtime)
- PWA manifest + service worker offline fallback
- Jest tests + Cypress smoke E2E
- GitHub Actions CI + CLI publish workflow

## Project Layout

- `app/`: pages and API route handlers
- `lib/`: shared server/client utilities
- `prisma/schema.prisma`: database schema
- `cli/`: npm-publishable CLI package
- `.github/workflows/`: CI/CD pipelines

## Quick Start

1. Install dependencies:

```bash
npm install
cd cli && npm install && cd ..
```

2. Configure env vars:

```bash
cp .env.example .env.local
```

3. Run Prisma setup:

```bash
npm run db:generate
npm run db:migrate
```

4. Start app:

```bash
npm run dev
```

5. Build CLI locally:

```bash
cd cli
npm run build
node ./bin/envii.js --help
```

## Database Notes

The schema supports all requested core entities:

- users, repos, envs, shares/invites, stars, forks, audit logs, payments
- plus follows, notifications, templates, purchases, referrals, and NextAuth tables

## Billing Notes

- Plans are encoded in `lib/plans.ts`
- `/api/billing/initialize` creates Paystack transactions
- `/api/billing/verify` verifies and updates user plan
- `/api/webhooks/paystack` handles subscription lifecycle updates

## Security Notes

- AES-256-GCM encryption in `lib/crypto.ts`
- Optional zero-knowledge mode by passing client-encrypted blobs from CLI
- Rate limiting in `middleware.ts`
- Security headers configured in `next.config.ts` and `vercel.json`

## Deploy (Vercel + Supabase)

1. Create Supabase project and Postgres DB.
2. Add all variables from `.env.example` in Vercel project settings.
3. Set Paystack webhook URL to:

```text
https://<your-domain>/api/webhooks/paystack
```

4. Deploy:

```bash
vercel --prod
```

## CLI Publish

Set `NPM_TOKEN` in GitHub secrets and trigger `.github/workflows/publish-cli.yml`.
