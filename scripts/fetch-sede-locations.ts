/**
 * fetch-sede-locations.ts
 * Fetches all Sede Cafe locations in Mexico City from Google Places API.
 * Run with: npx tsx scripts/fetch-sede-locations.ts
 */

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error("Missing GOOGLE_MAPS_API_KEY in environment.");
  process.exit(1);
}

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

async function fetchSedeLocations() {
  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.regularOpeningHours,places.businessStatus,places.rating,places.userRatingCount,places.googleMapsUri",
    },
    body: JSON.stringify({
      textQuery: "Sede Cafe Mexico City",
      languageCode: "en",
      regionCode: "MX",
      maxResultCount: 20,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Google Places API error:", error);
    process.exit(1);
  }

  const data = await response.json();
  const places = data.places ?? [];

  if (places.length === 0) {
    console.log("No locations found for Sede Cafe in Mexico City.");
    return;
  }

  console.log(`Found ${places.length} location(s):\n`);

  for (const place of places) {
    const name = place.displayName?.text ?? "Unknown";
    const address = place.formattedAddress ?? "No address";
    const status = place.businessStatus ?? "UNKNOWN";
    const rating = place.rating ? `${place.rating} ⭐ (${place.userRatingCount} reviews)` : "No rating";
    const mapsLink = place.googleMapsUri ?? "";

    const hours = place.regularOpeningHours?.weekdayDescriptions?.join("\n    ") ?? "Hours not available";

    console.log(`📍 ${name}`);
    console.log(`   Address : ${address}`);
    console.log(`   Status  : ${status}`);
    console.log(`   Rating  : ${rating}`);
    console.log(`   Hours   :\n    ${hours}`);
    console.log(`   Maps    : ${mapsLink}`);
    console.log();
  }
}

fetchSedeLocations();
