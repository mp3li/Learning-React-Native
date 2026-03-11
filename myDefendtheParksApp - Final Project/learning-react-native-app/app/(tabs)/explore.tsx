import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { US_STATES } from '@/constants/us-states';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function StatesScreen() {
  const router = useRouter();
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();
  const borderColor = useThemeColor({ light: '#c5d0d8', dark: '#4c5a62' }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor({ light: '#f6fbfe', dark: '#1f2b31' }, 'background');

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const [query, setQuery] = useState('');

  const filteredStates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return US_STATES;
    }

    return US_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(normalized) || state.code.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ResponsiveContainer style={{ gap: padding }}>
        <ThemedView style={{ gap }}>
          <ThemedText type="title" accessibilityRole="header">
            States
          </ThemedText>
          <ThemedText>
            Select a state to view a list of all national parks in that state.
          </ThemedText>
        </ThemedView>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by state name"
          placeholderTextColor="#7a8a95"
          style={[
            styles.searchInput,
            {
              borderColor,
              color: textColor,
              backgroundColor: inputBackground,
            },
          ]}
          accessibilityLabel="Search states"
          accessibilityHint="Filters the list of all 50 states"
        />

        <FlatList
          data={filteredStates}
          keyExtractor={(item) => item.code}
          contentContainerStyle={{ gap, paddingBottom: 28 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/states/${item.code}` as Href)}
              accessibilityRole="button"
              accessibilityLabel={`Open parks for ${item.name}`}
              style={({ pressed }) => [
                styles.stateRow,
                {
                  borderColor,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText>{item.code}</ThemedText>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedView style={styles.emptyState}>
              <ThemedText>No states match your search.</ThemedText>
            </ThemedView>
          }
        />
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  stateRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyState: {
    borderRadius: 10,
    padding: 12,
  },
});
