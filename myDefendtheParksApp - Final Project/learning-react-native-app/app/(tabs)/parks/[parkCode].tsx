import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParkDetailContent } from '@/components/park/park-detail-content';
import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStateContext } from '@/context/app-state-context';
import { useSavedParks } from '@/context/saved-parks-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { fetchIndigenousContextByCoordinates } from '@/services/native-land-api';
import { fetchParkByCode } from '@/services/nps-api';
import type { IndigenousContextData, NpsPark } from '@/types/parks';

export default function ParkDetailScreen() {
  const { parkCode } = useLocalSearchParams<{ parkCode: string }>();
  const normalizedParkCode = (parkCode ?? '').toLowerCase();

  const { reportError, showSnackbar } = useAppStateContext();
  const { getResponsivePadding } = useResponsiveLayout();
  const { isParkSaved, toggleSavedPark } = useSavedParks();

  const [park, setPark] = useState<NpsPark | null>(null);
  const [indigenousContext, setIndigenousContext] = useState<IndigenousContextData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPark = useCallback(async () => {
    if (!normalizedParkCode) {
      return;
    }

    try {
      setLoading(true);
      const parkResult = await fetchParkByCode(normalizedParkCode);
      if (!parkResult) {
        setPark(null);
        setIndigenousContext(null);
        return;
      }

      setPark(parkResult);

      const indigenousResult = await fetchIndigenousContextByCoordinates(
        parkResult.latitude,
        parkResult.longitude
      );
      setIndigenousContext(indigenousResult);
    } catch (error) {
      reportError(error, 'Unable to load the selected park profile.');
    } finally {
      setLoading(false);
    }
  }, [normalizedParkCode, reportError]);

  useFocusEffect(
    useCallback(() => {
      void loadPark();
    }, [loadPark])
  );

  const toggleSaved = useCallback(async () => {
    if (!park) {
      return;
    }

    const savedNow = await toggleSavedPark(park);
    showSnackbar(savedNow ? 'Park saved to your list.' : 'Park removed from your list.', 'info');
  }, [park, showSnackbar, toggleSavedPark]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ResponsiveContainer style={{ paddingTop: 0, paddingBottom: getResponsivePadding() }}>
        {loading ? (
          <ThemedView style={styles.statusCard}>
            <ThemedText>Loading park details...</ThemedText>
          </ThemedView>
        ) : !park ? (
          <ThemedView style={styles.statusCard}>
            <ThemedText>Park not found for code: {normalizedParkCode}</ThemedText>
            <AccessibleButton
              label="Try Reload"
              onPress={() => {
                void loadPark();
              }}
              variant="secondary"
            />
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <ParkDetailContent
              park={park}
              indigenousContext={indigenousContext}
              isSaved={isParkSaved(park.parkCode)}
              onToggleSave={() => {
                void toggleSaved();
              }}
            />
          </ScrollView>
        )}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  statusCard: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
});
