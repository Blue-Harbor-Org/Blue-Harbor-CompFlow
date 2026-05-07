export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractDomainName(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const hostname = new URL(normalized).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
