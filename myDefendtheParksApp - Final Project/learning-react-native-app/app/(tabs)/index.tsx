import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParkDetailContent } from '@/components/park/park-detail-content';
import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { US_STATE_NAME_BY_CODE } from '@/constants/us-states';
import { Colors } from '@/constants/theme';
import { useAppStateContext } from '@/context/app-state-context';
import { useSavedParks } from '@/context/saved-parks-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { fetchIndigenousContextByCoordinates } from '@/services/native-land-api';
import { fetchParkOfTheDay } from '@/services/nps-api';
import type { IndigenousContextData, ParkOfTheDay } from '@/types/parks';

function formatDateWithOrdinal(isoDate: string) {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? 'st'
      : day % 10 === 2 && day % 100 !== 12
        ? 'nd'
        : day % 10 === 3 && day % 100 !== 13
          ? 'rd'
          : 'th';

  return `${month} ${day}${suffix}, ${year}`;
}

function getFeaturedStateName(stateCodes: string) {
  const firstStateCode = stateCodes
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .find((value) => value.length > 0);

  if (!firstStateCode) {
    return stateCodes;
  }

  return US_STATE_NAME_BY_CODE[firstStateCode] ?? firstStateCode;
}

export default function HomeScreen() {
  const router = useRouter();
  const { reportError, showSnackbar } = useAppStateContext();
  const { isParkSaved, toggleSavedPark } = useSavedParks();
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const [parkOfTheDay, setParkOfTheDay] = useState<ParkOfTheDay | null>(null);
  const [featuredIndigenousContext, setFeaturedIndigenousContext] =
    useState<IndigenousContextData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadParkOfTheDay = useCallback(async () => {
    try {
      setLoading(true);
      const nextPark = await fetchParkOfTheDay();
      setParkOfTheDay(nextPark);

      const indigenous = await fetchIndigenousContextByCoordinates(
        nextPark.park.latitude,
        nextPark.park.longitude
      );
      setFeaturedIndigenousContext(indigenous);
    } catch (error) {
      reportError(error, 'Unable to load today\'s featured park.');
    } finally {
      setLoading(false);
    }
  }, [reportError]);

  useEffect(() => {
    void loadParkOfTheDay();
  }, [loadParkOfTheDay]);

  const toggleSavedFeaturedPark = useCallback(async () => {
    if (!parkOfTheDay?.park) {
      return;
    }

    const savedNow = await toggleSavedPark(parkOfTheDay.park);
    showSnackbar(savedNow ? 'Park saved to your list.' : 'Park removed from your list.', 'info');
  }, [parkOfTheDay?.park, showSnackbar, toggleSavedPark]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ResponsiveContainer style={{ gap: padding }}>
        <ScrollView contentContainerStyle={{ gap: padding, paddingBottom: 28 }}>
          <ThemedView style={{ gap }}>
            <ThemedText
              type="subtitle"
              style={styles.mainTitle}
              lightColor={Colors.light.tint}
              darkColor={Colors.dark.tint}
              accessibilityRole="header">
              myDefendtheParksApp
            </ThemedText>
            <ThemedText>
              Welcome to myDefendtheParksApp made by mp3li. This app is in active development.
              {'\n\n'}
              This app helps you explore national parks while also learning about the deeper history
              of the land they exist on. Many of the places we now call parks have been home to
              Indigenous nations for thousands of years. By viewing parks alongside the peoples
              connected to them, we can better understand the full story of these landscapes.
              {'\n\n'}
              Inside this app you can browse parks, learn about the Indigenous nations associated
              with the land, read about the history of each park, and find ways to support and
              protect these places for future generations.
              {'\n\n'}
              National parks belong to all of us to care for, but their histories reach far beyond the
              park system itself. Understanding that history is one step toward protecting these
              lands and respecting the people connected to them.
              {'\n\n'}
              Explore the parks, learn the history of the land, and help defend the parks.
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.card, { gap }]}>
            {loading ? (
              <ThemedText>Loading featured park...</ThemedText>
            ) : parkOfTheDay ? (
              <>
                <ThemedText type="subtitle">
                  Featured Park of the Day - {formatDateWithOrdinal(parkOfTheDay.dateLabel)}
                </ThemedText>
                {parkOfTheDay.park.images[0]?.url ? (
                  <Image
                    source={{ uri: parkOfTheDay.park.images[0].url }}
                    style={styles.featuredImage}
                    contentFit="cover"
                    accessibilityLabel={parkOfTheDay.park.images[0].altText || parkOfTheDay.park.fullName}
                  />
                ) : null}
                <ThemedText type="defaultSemiBold">{parkOfTheDay.park.fullName}</ThemedText>
                <ThemedText>State: {getFeaturedStateName(parkOfTheDay.park.states)}</ThemedText>
                <AccessibleButton
                  label={isParkSaved(parkOfTheDay.park.parkCode) ? 'Remove From My List' : 'Save This Park To My List'}
                  onPress={() => {
                    void toggleSavedFeaturedPark();
                  }}
                  variant={isParkSaved(parkOfTheDay.park.parkCode) ? 'secondary' : 'primary'}
                />
                <ParkDetailContent
                  park={parkOfTheDay.park}
                  indigenousContext={featuredIndigenousContext}
                  isSaved={isParkSaved(parkOfTheDay.park.parkCode)}
                  onToggleSave={() => {
                    void toggleSavedFeaturedPark();
                  }}
                  showHeroSection={false}
                  showSaveButton={false}
                />
              </>
            ) : (
              <ThemedText>No featured park is available right now.</ThemedText>
            )}
          </ThemedView>

          <ThemedView style={[styles.card, { gap }]}>
            <ThemedText type="subtitle">Quick Actions</ThemedText>
            <AccessibleButton
              label="Browse All 50 States"
              onPress={() => router.push('/explore' as Href)}
              variant="secondary"
              accessibilityHint="Opens the state list and then park list by state"
            />
            <AccessibleButton
              label="Open My Saved Parks"
              onPress={() => router.push('/lifecycle' as Href)}
              variant="outline"
              accessibilityHint="Opens your saved park list"
            />
            <AccessibleButton
              label="Refresh Park of the Day"
              onPress={() => {
                void loadParkOfTheDay();
              }}
              variant="secondary"
              accessibilityHint="Loads the current featured park again from the API"
            />
          </ThemedView>
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontStyle: 'italic',
  },
  card: {
    borderRadius: 12,
    padding: 14,
  },
  featuredImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#dce5eb',
  },
});
