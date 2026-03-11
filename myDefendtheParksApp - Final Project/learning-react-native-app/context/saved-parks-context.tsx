import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { NpsPark, SavedPark } from '@/types/parks';

const STORAGE_KEY = 'my-defend-the-parks-saved-parks-v1';

type SavedParksContextValue = {
  isHydrated: boolean;
  savedParks: SavedPark[];
  isParkSaved: (parkCode: string) => boolean;
  savePark: (park: NpsPark) => Promise<void>;
  removePark: (parkCode: string) => Promise<void>;
  toggleSavedPark: (park: NpsPark) => Promise<boolean>;
};

const SavedParksContext = createContext<SavedParksContextValue | null>(null);

function toSavedPark(park: NpsPark): SavedPark {
  return {
    parkCode: park.parkCode,
    fullName: park.fullName,
    states: park.states,
    designation: park.designation,
    description: park.description,
    imageUrl: park.images[0]?.url,
    savedAt: new Date().toISOString(),
  };
}

export function SavedParksProvider({ children }: { children: ReactNode }) {
  const [savedParks, setSavedParks] = useState<SavedPark[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) {
          return;
        }

        if (!stored) {
          setIsHydrated(true);
          return;
        }

        const parsed = JSON.parse(stored) as SavedPark[];
        const normalized = Array.isArray(parsed)
          ? parsed
              .filter((item) => typeof item?.parkCode === 'string' && item.parkCode.length > 0)
              .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
          : [];

        setSavedParks(normalized);
      } catch (error) {
        console.error('Failed to hydrate saved parks', error);
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedParks));
      } catch (error) {
        console.error('Failed to persist saved parks', error);
      }
    };

    void persist();
  }, [isHydrated, savedParks]);

  const isParkSaved = useCallback(
    (parkCode: string) => savedParks.some((savedPark) => savedPark.parkCode === parkCode),
    [savedParks]
  );

  const savePark = useCallback(async (park: NpsPark) => {
    setSavedParks((current) => {
      if (current.some((item) => item.parkCode === park.parkCode)) {
        return current;
      }
      const next = [toSavedPark(park), ...current];
      return next.sort((left, right) => right.savedAt.localeCompare(left.savedAt));
    });
  }, []);

  const removePark = useCallback(async (parkCode: string) => {
    setSavedParks((current) => current.filter((item) => item.parkCode !== parkCode));
  }, []);

  const toggleSavedPark = useCallback(
    async (park: NpsPark) => {
      const currentlySaved = isParkSaved(park.parkCode);
      if (currentlySaved) {
        await removePark(park.parkCode);
        return false;
      }

      await savePark(park);
      return true;
    },
    [isParkSaved, removePark, savePark]
  );

  const value = useMemo<SavedParksContextValue>(
    () => ({
      isHydrated,
      savedParks,
      isParkSaved,
      savePark,
      removePark,
      toggleSavedPark,
    }),
    [isHydrated, isParkSaved, removePark, savePark, savedParks, toggleSavedPark]
  );

  return <SavedParksContext.Provider value={value}>{children}</SavedParksContext.Provider>;
}

export function useSavedParks() {
  const context = useContext(SavedParksContext);
  if (!context) {
    throw new Error('useSavedParks must be used inside SavedParksProvider');
  }
  return context;
}
