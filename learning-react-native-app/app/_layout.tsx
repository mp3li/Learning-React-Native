import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { AppStateProvider, GlobalSnackbar, useAppStateContext } from '@/context/app-state-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
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
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppNavigator />
          <GlobalSnackbar />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
