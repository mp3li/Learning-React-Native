import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStateContext } from '@/context/app-state-context';
import { useSavedParks } from '@/context/saved-parks-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

export default function SavedParksScreen() {
  const router = useRouter();
  const { showSnackbar } = useAppStateContext();
  const { getResponsiveGap, getResponsivePadding, isTablet } = useResponsiveLayout();
  const { isHydrated, savedParks, removePark } = useSavedParks();

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ResponsiveContainer style={{ gap: padding }}>
        <ThemedView style={{ gap }}>
          <ThemedText type="title" accessibilityRole="header">
            My Saved Parks
          </ThemedText>
          <ThemedText>
            View your list of saved National Parks, view the page for each park, or delete park(s)
            from your list.
          </ThemedText>
        </ThemedView>

        {!isHydrated ? (
          <ThemedText>Loading your saved parks...</ThemedText>
        ) : (
          <FlatList
            data={savedParks}
            keyExtractor={(item) => item.parkCode}
            contentContainerStyle={{ gap, paddingBottom: 28 }}
            renderItem={({ item }) => (
              <ThemedView style={[styles.card, { gap }]}>
                <ThemedText type="defaultSemiBold">{item.fullName}</ThemedText>
                <ThemedText>{item.designation || 'National Park Service Site'}</ThemedText>
                <ThemedText>States: {item.states}</ThemedText>
                <ThemedText>Saved: {new Date(item.savedAt).toLocaleString()}</ThemedText>

                <View style={[styles.row, { gap }]}>
                  <AccessibleButton
                    label="Open"
                    onPress={() => router.push(`/parks/${item.parkCode}` as Href)}
                    size={isTablet ? 'large' : 'medium'}
                  />
                  <AccessibleButton
                    label="Remove"
                    onPress={() => {
                      void removePark(item.parkCode);
                      showSnackbar('Removed from saved list.', 'info');
                    }}
                    variant="secondary"
                    size={isTablet ? 'large' : 'medium'}
                  />
                </View>
              </ThemedView>
            )}
            ListEmptyComponent={
              <ThemedView style={[styles.card, { gap }]}> 
                <ThemedText>You have not saved any parks yet.</ThemedText>
                <AccessibleButton
                  label="Browse States"
                  onPress={() => router.push('/explore' as Href)}
                  variant="outline"
                />
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
  card: {
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
