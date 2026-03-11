export type NpsItem = {
  id: string;
  name: string;
};

export type NpsParkImage = {
  credit: string;
  title: string;
  altText: string;
  caption: string;
  url: string;
};

export type NpsAddress = {
  postalCode: string;
  city: string;
  stateCode: string;
  countryCode: string;
  provinceTerritoryCode: string;
  line1: string;
  line2: string;
  line3: string;
  type: string;
};

export type NpsPhoneNumber = {
  phoneNumber: string;
  description: string;
  extension: string;
  type: string;
};

export type NpsEmailAddress = {
  description: string;
  emailAddress: string;
};

export type NpsOperatingHours = {
  name: string;
  description: string;
  standardHours: Record<string, string>;
  exceptions: Array<{
    name: string;
    startDate: string;
    endDate: string;
    exceptionHours: Record<string, string>;
  }>;
};

export type NpsFee = {
  cost: string;
  description: string;
  title: string;
};

export type NpsPark = {
  id: string;
  parkCode: string;
  name: string;
  fullName: string;
  description: string;
  states: string;
  designation: string;
  url: string;
  weatherInfo: string;
  directionsInfo: string;
  directionsUrl: string;
  latLong: string;
  latitude: string;
  longitude: string;
  activities: NpsItem[];
  topics: NpsItem[];
  images: NpsParkImage[];
  addresses: NpsAddress[];
  entranceFees: NpsFee[];
  entrancePasses: NpsFee[];
  operatingHours: NpsOperatingHours[];
  contacts: {
    phoneNumbers: NpsPhoneNumber[];
    emailAddresses: NpsEmailAddress[];
  };
};

export type ParkOfTheDay = {
  park: NpsPark;
  dateLabel: string;
  sourceStateCode: string;
};

export type IndigenousSummary = {
  territories: number;
  languages: number;
  treaties: number;
};

export type IndigenousContextData = {
  placeNames: string[];
  nameMeanings: Array<{
    name: string;
    meaning: string;
  }>;
  territories: string[];
  languages: string[];
  treaties: string[];
  referenceLinks: string[];
  summary: IndigenousSummary;
  keyRequired: boolean;
  infoMessage?: string;
};

export type SavedPark = {
  parkCode: string;
  fullName: string;
  states: string;
  designation: string;
  description: string;
  imageUrl?: string;
  savedAt: string;
};
