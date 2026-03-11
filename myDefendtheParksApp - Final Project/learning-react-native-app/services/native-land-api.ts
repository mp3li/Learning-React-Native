import type { IndigenousContextData } from '@/types/parks';

const NATIVE_LAND_BASE_URL = 'https://native-land.ca/api/index.php';
const NATIVE_LAND_API_KEY = process.env.EXPO_PUBLIC_NATIVE_LAND_API_KEY ?? '';

type NativeLandFeature = {
  properties?: Record<string, unknown>;
};

type NativeLandResponse = NativeLandFeature[] | { error?: string };

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return '';
}

function cleanName(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueSorted(values: Iterable<string>) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function uniqueNameMeaningPairs(values: Array<{ name: string; meaning: string }>) {
  const seen = new Set<string>();
  const pairs: Array<{ name: string; meaning: string }> = [];

  values.forEach((value) => {
    const key = `${value.name}::${value.meaning}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    pairs.push(value);
  });

  return pairs.sort((left, right) => left.name.localeCompare(right.name));
}

function getCategoryFromLink(link: string) {
  const lower = link.toLowerCase();
  if (lower.includes('/territories/')) {
    return 'territory';
  }
  if (lower.includes('/languages/')) {
    return 'language';
  }
  if (lower.includes('/treaties/')) {
    return 'treaty';
  }
  return 'unknown';
}

export async function fetchIndigenousContextByCoordinates(
  latitude: string,
  longitude: string
): Promise<IndigenousContextData> {
  const lat = Number.parseFloat(latitude);
  const lon = Number.parseFloat(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return {
      placeNames: [],
      nameMeanings: [],
      territories: [],
      languages: [],
      treaties: [],
      referenceLinks: [],
      summary: {
        territories: 0,
        languages: 0,
        treaties: 0,
      },
      keyRequired: false,
      infoMessage: 'This park did not include valid coordinates for an Indigenous context lookup.',
    };
  }

  const url = new URL(NATIVE_LAND_BASE_URL);
  url.searchParams.set('maps', 'territories,languages,treaties');
  url.searchParams.set('position', `${lat},${lon}`);
  if (NATIVE_LAND_API_KEY) {
    url.searchParams.set('key', NATIVE_LAND_API_KEY);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      placeNames: [],
      nameMeanings: [],
      territories: [],
      languages: [],
      treaties: [],
      referenceLinks: [],
      summary: {
        territories: 0,
        languages: 0,
        treaties: 0,
      },
      keyRequired: false,
      infoMessage: `Native Land request failed (${response.status}): ${errorText || 'Unknown error'}`,
    };
  }

  const payload = (await response.json()) as NativeLandResponse;

  if (!Array.isArray(payload)) {
    const errorMessage = typeof payload.error === 'string' ? payload.error : 'Unknown Native Land API response.';
    const keyRequired = errorMessage.toLowerCase().includes('api key');
    return {
      placeNames: [],
      nameMeanings: [],
      territories: [],
      languages: [],
      treaties: [],
      referenceLinks: [],
      summary: {
        territories: 0,
        languages: 0,
        treaties: 0,
      },
      keyRequired,
      infoMessage: errorMessage,
    };
  }

  const territories: string[] = [];
  const languages: string[] = [];
  const treaties: string[] = [];
  const placeNames: string[] = [];
  const nameMeanings: Array<{ name: string; meaning: string }> = [];
  const referenceLinks: string[] = [];

  payload.forEach((feature) => {
    const properties = feature.properties ?? {};
    const name = cleanName(
      firstString(properties, ['Name', 'name', 'title', 'territory', 'nation', 'language', 'treaty'])
    );
    const referenceLink = firstString(properties, [
      'description',
      'url',
      'source',
      'source_url',
      'website',
      'wikipedia',
      'citation',
    ]);
    const possibleMeaning = cleanName(
      firstString(properties, ['meaning', 'Meaning', 'translation', 'Translation', 'definition'])
    );

    if (referenceLink) {
      referenceLinks.push(referenceLink);
    }

    if (!name) {
      return;
    }

    const category = getCategoryFromLink(referenceLink);
    if (category === 'territory') {
      territories.push(name);
      placeNames.push(name);
    } else if (category === 'language') {
      languages.push(name);
      placeNames.push(name);
    } else if (category === 'treaty') {
      treaties.push(name);
    } else {
      // Unknown category still carries potentially useful naming context.
      placeNames.push(name);
    }

    if (possibleMeaning) {
      nameMeanings.push({
        name,
        meaning: possibleMeaning,
      });
    }
  });

  const uniqueTerritories = uniqueSorted(territories);
  const uniqueLanguages = uniqueSorted(languages);
  const uniqueTreaties = uniqueSorted(treaties);
  const uniquePlaceNames = uniqueSorted(placeNames);
  const uniqueNameMeanings = uniqueNameMeaningPairs(nameMeanings);

  return {
    placeNames: uniquePlaceNames,
    nameMeanings: uniqueNameMeanings,
    territories: uniqueTerritories,
    languages: uniqueLanguages,
    treaties: uniqueTreaties,
    referenceLinks: uniqueSorted(referenceLinks),
    summary: {
      territories: uniqueTerritories.length,
      languages: uniqueLanguages.length,
      treaties: uniqueTreaties.length,
    },
    keyRequired: false,
    infoMessage:
      uniquePlaceNames.length === 0
        ? 'No Indigenous records were returned for this location from Native Land.'
        : undefined,
  };
}
