import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { US_STATE_NAME_BY_CODE } from '@/constants/us-states';
import { useAppStateContext } from '@/context/app-state-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { fetchParksByState } from '@/services/nps-api';
import type { NpsPark } from '@/types/parks';

export default function StateParksScreen() {
  const router = useRouter();
  const { reportError } = useAppStateContext();
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();

  const { stateCode } = useLocalSearchParams<{ stateCode: string }>();
  const normalizedStateCode = (stateCode ?? '').toUpperCase();

  const [parks, setParks] = useState<NpsPark[]>([]);
  const [loading, setLoading] = useState(true);

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const loadStateParks = useCallback(async () => {
    if (!normalizedStateCode) {
      return;
    }

    try {
      setLoading(true);
      const data = await fetchParksByState(normalizedStateCode);
      setParks(data);
    } catch (error) {
      reportError(error, `Unable to load parks for ${normalizedStateCode}.`);
    } finally {
      setLoading(false);
    }
  }, [normalizedStateCode, reportError]);

  useEffect(() => {
    void loadStateParks();
  }, [loadStateParks]);

  const stateDisplayName = useMemo(
    () => US_STATE_NAME_BY_CODE[normalizedStateCode] ?? normalizedStateCode,
    [normalizedStateCode]
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ResponsiveContainer style={{ gap: padding, paddingTop: 0, paddingBottom: padding }}>
        <ThemedView style={{ gap }}>
          <ThemedText type="title" accessibilityRole="header">
            {stateDisplayName}
          </ThemedText>
          <ThemedText>
            National Parks are shown below in alphabetical order. Select one for more information.
          </ThemedText>
          <ThemedText>Total sites found: {parks.length}</ThemedText>
        </ThemedView>

        {loading ? (
          <ThemedText>Loading parks...</ThemedText>
        ) : (
          <FlatList
            data={parks}
            keyExtractor={(item) => item.parkCode}
            contentContainerStyle={{ gap, paddingBottom: 28 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/parks/${item.parkCode}` as Href)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.fullName}`}
                style={({ pressed }) => [styles.parkRow, pressed && styles.pressed]}>
                {item.images[0]?.url ? (
                  <Image
                    source={{ uri: item.images[0].url }}
                    style={styles.thumbnail}
                    contentFit="cover"
                    accessibilityLabel={item.images[0].altText || item.fullName}
                  />
                ) : null}
                <ThemedView style={{ gap: 6 }}>
                  <ThemedText type="defaultSemiBold">{item.fullName}</ThemedText>
                  <ThemedText>{item.designation || 'National Park Service Site'}</ThemedText>
                  <ThemedText numberOfLines={3}>{item.description}</ThemedText>
                </ThemedView>
              </Pressable>
            )}
            ListEmptyComponent={
              <ThemedView style={styles.parkRow}>
                <ThemedText>No NPS sites were returned for this state code.</ThemedText>
              </ThemedView>
            }
          />
        )}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  parkRow: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#d6e0e8',
  },
});
