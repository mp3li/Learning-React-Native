import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { Palette } from '@/constants/theme';
import { AppStateProvider, GlobalSnackbar, useAppStateContext } from '@/context/app-state-context';
import { SavedParksProvider } from '@/context/saved-parks-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.rust,
    background: Palette.mist,
    card: Palette.gold,
    text: Palette.plum,
    border: Palette.blueGray,
    notification: Palette.rust,
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.gold,
    background: Palette.plum,
    card: Palette.rust,
    text: Palette.mist,
    border: Palette.blueGray,
    notification: Palette.gold,
  },
};

function AppNavigator() {
  const { reportError } = useAppStateContext();

  return (
    <AppErrorBoundary
      onError={(error) => {
        reportError(error, 'The app hit a rendering issue and recovered.');
      }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </AppErrorBoundary>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <SavedParksProvider>
          <ThemeProvider value={colorScheme === 'dark' ? AppDarkTheme : AppLightTheme}>
            <AppNavigator />
            <GlobalSnackbar />
            <StatusBar style="auto" />
          </ThemeProvider>
        </SavedParksProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
