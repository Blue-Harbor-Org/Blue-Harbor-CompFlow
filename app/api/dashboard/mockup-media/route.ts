import { NextResponse } from 'next/server';
import { requireTeamMember, isAuthError } from '@/lib/auth-guard';
import { fetchPhotos, fetchIcon, getIndustryIcons, buildPhotoQuery } from '@/lib/mockup-media';

export async function POST(request: Request) {
  const auth = await requireTeamMember();
  if (isAuthError(auth)) return auth;

  const { industry = 'professional services', businessName = 'business' } = await request.json() as {
    industry?: string;
    businessName?: string;
  };

  const photoQuery = buildPhotoQuery(industry, businessName);
  const iconNames = getIndustryIcons(industry);

  const [photos, ...iconResults] = await Promise.all([
    fetchPhotos(photoQuery, 6),
    ...iconNames.map((name) => fetchIcon(name)),
  ]);

  const icons = iconResults.filter((icon): icon is NonNullable<typeof icon> => Boolean(icon));

  return NextResponse.json({ photos, icons });
}
