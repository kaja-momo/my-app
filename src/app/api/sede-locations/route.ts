import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask':
        'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri',
    },
    body: JSON.stringify({
      textQuery: 'Sede Cafe Mexico City',
      languageCode: 'en',
      regionCode: 'MX',
      maxResultCount: 20,
    }),
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Places API error' }, { status: 502 });
  }

  const data = await response.json();

  const places = (data.places ?? []).map((p: Record<string, unknown>) => ({
    name: (p.displayName as { text?: string })?.text ?? 'Sede Café',
    address: (p.formattedAddress as string) ?? '',
    lat: (p.location as { latitude?: number })?.latitude ?? null,
    lng: (p.location as { longitude?: number })?.longitude ?? null,
    rating: (p.rating as number) ?? null,
    reviewCount: (p.userRatingCount as number) ?? 0,
    status: (p.businessStatus as string) ?? 'UNKNOWN',
    mapsUri: (p.googleMapsUri as string) ?? '',
  }));

  return NextResponse.json(places);
}
