This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Model Configuration

Report generation model is controlled by a 3-level priority chain:

1. `ANTHROPIC_REPORT_MODEL` env var — if set, always wins (Vercel / production lock)
2. Admin sidebar toggle — Haiku or Sonnet, stored in `bh_report_model` cookie
3. Default — Haiku (used for public form submissions with no cookie)

### Env variable values
| Model | String |
|-------|--------|
| Haiku 4.5 | `claude-haiku-4-5-20251001` |
| Sonnet 4.5 | `claude-sonnet-4-5-20250514` |

### Cost reference (approximate)
| Model | Per report (~5k in / 4k out) |
|-------|------------------------------|
| Haiku | ~$0.01 |
| Sonnet | ~$0.09 |

### Recommended setup
- Leave `ANTHROPIC_REPORT_MODEL` commented out in local dev
- Public leads default to Haiku automatically
- Use the admin sidebar toggle when you want Sonnet for a specific generation
- To lock production to Haiku: set `ANTHROPIC_REPORT_MODEL=claude-haiku-4-5-20251001` in Vercel
