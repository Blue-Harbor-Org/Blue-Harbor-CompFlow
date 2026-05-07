/** Base site URL without trailing slash (emails, share links). */
export function getPublicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'https://blue-harbor-comp-flow.vercel.app';
  return raw;
}
