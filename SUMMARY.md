# Blue Harbor Audit Summary

Updated: 2026-05-14

## Current Status

- The major `bh_` migration breakages from the first audit are now fixed in the app and in the live Supabase schema.
- `npx tsc --noEmit` passes.
- `npm run build` now passes.
- `npx eslint app lib components types --ext .ts,.tsx` passes.

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
| 1 | medium | The public intake API still bypasses database RLS by using the service-role client directly and trusting an app-level `x-intake-token` header. | `app/api/intake/route.ts:4-16`, `app/api/intake/route.ts:41-64`, `app/api/intake/route.ts:108-190` | Security for public intake access still depends on route code and token secrecy, not on the anon role exercising the database access model directly. |
| 3 | low | Local email delivery is still disabled because `RESEND_API_KEY` is blank. | `.env.local:5`, `lib/resend.ts:6-12` | Report-ready, unlock, deep-dive, and admin notification emails no-op locally until a real key is configured. |
| 4 | low | The project still uses the deprecated `middleware.ts` file convention on Next.js 16. | `middleware.ts:4-37` | The current build passes, but future framework upgrades will require migrating this file to `proxy.ts`. |

## Verification Notes

- `npx tsc --noEmit` passed.
- `npm run build` passed on Next.js 16.2.5.
- `npm run build` still prints the framework warning about the deprecated `middleware` file convention.
- `npx eslint app lib components types --ext .ts,.tsx` passed after the Session 2 cleanup.

## Operational Note

- `.env.local` is currently gitignored (`git ls-files .env.local` returned no tracked file), so the local secrets in that file are not part of the committed repo state. They should still be rotated if they were ever shared outside your workstation.
