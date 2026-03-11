import { US_STATES } from '@/constants/us-states';
import type { NpsPark, ParkOfTheDay } from '@/types/parks';

const NPS_API_BASE_URL = 'https://developer.nps.gov/api/v1';
const NPS_API_KEY =
  process.env.EXPO_PUBLIC_NPS_API_KEY ?? 'BZThuGxH9sZyl1XrB8dvVHDIHnHWht5muZSZzh9a';
const PARK_FIELDS = [
  'images',
  'entranceFees',
  'entrancePasses',
  'operatingHours',
  'contacts',
  'addresses',
  'activities',
  'topics',
  'weatherInfo',
].join(',');

type NpsParksResponse = {
  total: string;
  data: NpsPark[];
};

function buildNpsUrl(path: string, params: Record<string, string>) {
  const url = new URL(`${NPS_API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  // Keep query-key fallback for compatibility with older API behavior.
  url.searchParams.set('api_key', NPS_API_KEY);
  return url;
}

async function requestNps(path: string, params: Record<string, string>) {
  const url = buildNpsUrl(path, params);

  const response = await fetch(url.toString(), {
    headers: {
      'X-Api-Key': NPS_API_KEY,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NPS request failed (${response.status}): ${errorText || 'Unknown error'}`);
  }

  return (await response.json()) as NpsParksResponse;
}

function sortParksAlphabetically(parks: NpsPark[]) {
  return [...parks].sort((left, right) => left.fullName.localeCompare(right.fullName));
}

function getDateSeed(dateKey: string) {
  let hash = 7;
  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) % 1000003;
  }
  return hash;
}

export async function fetchParksByState(stateCode: string) {
  const normalizedStateCode = stateCode.trim().toUpperCase();
  if (!normalizedStateCode) {
    return [];
  }

  const result = await requestNps('/parks', {
    stateCode: normalizedStateCode,
    fields: PARK_FIELDS,
    limit: '600',
    start: '0',
  });

  return sortParksAlphabetically(result.data ?? []);
}

export async function fetchParkByCode(parkCode: string) {
  const result = await requestNps('/parks', {
    parkCode,
    fields: PARK_FIELDS,
    limit: '1',
    start: '0',
  });

  return result.data?.[0] ?? null;
}

export async function fetchParkOfTheDay(): Promise<ParkOfTheDay> {
  const dateLabel = new Date().toISOString().slice(0, 10);
  const seed = getDateSeed(dateLabel);

  for (let offset = 0; offset < US_STATES.length; offset += 1) {
    const state = US_STATES[(seed + offset) % US_STATES.length];
    const parks = await fetchParksByState(state.code);

    if (parks.length === 0) {
      continue;
    }

    const park = parks[seed % parks.length];
    return {
      park,
      dateLabel,
      sourceStateCode: state.code,
    };
  }

  throw new Error('No parks were returned by the NPS API for any state.');
}
