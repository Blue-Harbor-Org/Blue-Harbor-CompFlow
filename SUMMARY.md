# Blue Harbor Audit Summary

Updated: 2026-05-14

## Current Status

- The major `bh_` migration breakages from the first audit are now fixed in the app and in the live Supabase schema.
- After Session 5 changes, re-run: `npx eslint app lib components types --ext .ts,.tsx`, `npx tsc --noEmit`, `npm run build`.

## Session 5 — Proposal Page + Client Portal + Intake RLS
Date: 2026-05-14
Completed:
- Public proposal acceptance page rebuilt — premium branded layout, pending/accepted states (`app/proposal`, `components/proposal/PublicProposal.tsx`)
- Proposal accepted → team notification email via Resend (optional portal link) + client “project started” email with portal URL (`lib/resend.ts`, `app/api/proposals/accept/route.ts`)
- Client status portal at `/portal/[token]` — stages, page status, progress bar, meta refresh every 30s while not live (`app/portal`, `components/portal/*`, `sql/bh-session5-portal.sql` RPC `get_portal_snapshot`)
- Intake hardened — `x-intake-token` required (401 if missing); mismatch returns 403 “Invalid or expired intake link”; validated against `bh_clients.intake_token` (`app/api/intake/route.ts`, `sql/bh-session5-intake-rls.sql`)
- Proposal status badges in pipeline (`ProposalStatusBadge`, `ClientCard`, `ClientTableView`)
- Quick actions on client detail + lead slideout; lead slideout resolves `bh_clients` id via `GET /api/dashboard/lead-client-bridge`
- Activity log: mockup approval route, recent activity on overview + slideout; key events logged from existing API routes
- Empty states: pipeline with no clients, buildout manager, client overview report/mockup copy
- `bh_proposals` extended fields + generate-pdf persistence (Session 5 SQL)
- SQL: `sql/bh-session5-proposal-fields.sql`, `sql/bh-session5-portal.sql`, `sql/bh-session5-intake-rls.sql`
Open findings: none — intake finding #1 mitigated with per-client `intake_token` + explicit 401/403 responses (full anon JWT RLS deferred)
Next session: Launch prep — rate limiting, error monitoring, onboarding email sequence, marketing page

## Session 4 — Proposal PDF + Email Delivery
Date: 2026-05-15
Completed:
- `lib/proposal-template.ts` — branded HTML template (cover, audit, executive summary, design block, scope, pricing, timeline, next steps, signature) with HTML escaping for dynamic content
- `lib/proposal-generator.ts` — Claude generates executive summary, scope, pricing, timeline, next steps
- `lib/proposal-pdf.ts` — Puppeteer + `@sparticuz/chromium` PDF path; jsPDF text fallback; HTML buffer last resort
- `lib/proposal-report-context.ts` — extracts findings and competitor comparison notes from `ReportData`
- `/api/dashboard/proposal/generate-pdf` — team auth, client + report + mockup context, storage upload to `documents` bucket, optional `bh_proposals` row update (`sql/bh-session4-proposal-pdf.sql`)
- `/api/dashboard/proposal/send` — Resend proposal email; updates latest proposal status
- `lib/resend.ts` — `getResendClient()` with placeholder-key guard; all sends return `{ id, error }`; `sendProposalEmail` + escaped HTML body fields
- Proposal builder UI — generate PDF, preview link, email client, regenerate (`components/proposal/ProposalBuilder.tsx`, `pdfMockupId` from proposal page)
- `middleware.ts` migrated to `proxy.ts` with `export async function proxy` (Next.js 16 convention)
- `next.config.ts` — `serverExternalPackages` for Puppeteer/Chromium

## Session 2 — UI/UX + Mockup Maker
Date: 2026-05-13
Completed:
- Team member assignment persistence fixed
- ESLint zero failures
- Design archetype system built (12 archetypes, lib/mockup-archetypes.ts)
- Mockup generation prompt rebuilt with uniqueness-first system
- Mockup maker UI rebuilt with 4-step flow
- Pipeline view, slideout, dashboard shell, client overview polished
Next session: Redesign wizard integration + proposal PDF from mockup

## Session 3 — Style Selection + Real Media + Full Buildout
Date: 2026-05-14
Completed:
- Visual archetype selector (12 cards with palette thumbnails) in mockup maker Step 1
- Unsplash + Pexels photo fetching wired into every mockup generation
- Iconify SVG icons wired per industry
- lib/mockup-media.ts, lib/buildout-pages.ts created
- bh_site_buildouts + bh_buildout_pages tables added
- /api/dashboard/buildout/generate — 4-page site generation
- /api/dashboard/buildout/deploy — Vercel programmatic deploy
- /api/dashboard/buildout/cms — CMS content save
- CmsEditor component (10 editable fields)
- DomainInstructions component (6 registrars)
- Buildout dashboard page at /dashboard/clients/[clientId]/buildout
- "Approve & Build Full Site" button wired in mockup maker
Next session: Proposal PDF generator from approved mockup + Resend email delivery

## Resolved Since Initial Audit

| Area | Status | Evidence |
| --- | --- | --- |
| Dashboard data layer now reads the `bh_` schema and resolves linked lead/report state for clients. | resolved | `lib/dashboard.ts:12-109`, `lib/bh-client-context.ts:26-95` |
| Public intake API now reads and writes `bh_clients` / `bh_intake_submissions` instead of the legacy non-prefixed tables. | resolved | `app/api/intake/route.ts:35-190` |
| Proposal flows now resolve `bh_proposals.client_id` through `bh_clients`, and the repo includes the FK repair migration. | resolved | `app/api/proposals/route.ts:8-124`, `app/api/proposals/accept/route.ts:4-38`, `sql/fix-bh-proposals-client-fk.sql:1-24` |
| Proposal builder now combines intake data and report data instead of passing `intakeData={null}`. | resolved | `app/dashboard/clients/[clientId]/proposal/page.tsx:22-109` |
| Dashboard auth is now centralized at the layout layer for team members. | resolved | `app/dashboard/layout.tsx:10-24` |
| Audited service-role report/proposal routes now enforce team membership before mutating data. | resolved | `app/api/generate-report/route.ts:16-20`, `app/api/generate-deepdive/route.ts:12-16`, `app/api/find-competitors/route.ts:9-13`, `app/api/lead-status/route.ts:16-20`, `app/api/leads/delete/route.ts:6-10`, `app/api/proposals/route.ts:8-10`, `app/api/unlock-report/route.ts:7-11`, `app/api/unlock-deepdive/route.ts:7-11` |
| Proposal anon RLS is now tightened around slug-based read/accept flows. | resolved | `sql/fix-rls-policies.sql:14-106`, `app/proposal/[publicSlug]/page.tsx:12-16`, `app/api/proposals/accept/route.ts:12-24` |

## Open Findings

| ID | Severity | Issue | Evidence | Impact |
| --- | --- | --- | --- | --- |
| 3 | low | Configure a real `RESEND_API_KEY` in `.env.local` when you want emails to send (placeholders and empty keys are ignored safely). | `.env.example`, `lib/resend.ts` (`getResendClient`) | Until set, Resend calls return `{ error: 'not_configured' }` and proposal/report emails are skipped without throwing. |
| 4 | resolved | Migrated deprecated `middleware.ts` to `proxy.ts` per Next.js 16. | `proxy.ts:4-31` | Build shows “ƒ Proxy (Middleware)” and the deprecation warning for `middleware.ts` is gone. |

## Verification Notes

- `npx tsc --noEmit` passed.
- `npm run build` passed on Next.js 16.2.5.
- `npx eslint app lib components types --ext .ts,.tsx` passed after Session 4.

## Operational Note

- `.env.local` is currently gitignored (`git ls-files .env.local` returned no tracked file), so the local secrets in that file are not part of the committed repo state. They should still be rotated if they were ever shared outside your workstation.
