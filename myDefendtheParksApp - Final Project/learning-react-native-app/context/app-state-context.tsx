import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SnackbarTone = 'info' | 'error';

type SnackbarMessage = {
  id: number;
  text: string;
  tone: SnackbarTone;
};

type AppStateContextValue = {
  simulateNetworkFailure: boolean;
  setSimulateNetworkFailure: (value: boolean) => void;
  snackbar: SnackbarMessage | null;
  showSnackbar: (text: string, tone?: SnackbarTone) => void;
  reportError: (error: unknown, fallbackMessage?: string) => void;
};

const SNACKBAR_DURATION_MS = 3600;
const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [simulateNetworkFailure, setSimulateNetworkFailure] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback((text: string, tone: SnackbarTone = 'info') => {
    setSnackbar({
      id: Date.now(),
      text,
      tone,
    });
  }, []);

  const reportError = useCallback(
    (error: unknown, fallbackMessage = 'Something went wrong. Please try again.') => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Objective4 Error]', message, error);
      showSnackbar(fallbackMessage, 'error');
    },
    [showSnackbar]
  );

  useEffect(() => {
    if (!snackbar) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSnackbar(null);
    }, SNACKBAR_DURATION_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [snackbar]);

  const contextValue = useMemo<AppStateContextValue>(
    () => ({
      simulateNetworkFailure,
      setSimulateNetworkFailure,
      snackbar,
      showSnackbar,
      reportError,
    }),
    [reportError, showSnackbar, simulateNetworkFailure, snackbar]
  );

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used inside AppStateProvider');
  }
  return context;
}

export function GlobalSnackbar() {
  const { snackbar } = useAppStateContext();

  if (!snackbar) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View
        style={[
          styles.container,
          snackbar.tone === 'error' ? styles.errorContainer : styles.infoContainer,
        ]}>
        <Text style={styles.text}>{snackbar.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: 16,
    zIndex: 99,
  },
  container: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  infoContainer: {
    backgroundColor: '#204050',
    borderColor: '#76b7d4',
  },
  errorContainer: {
    backgroundColor: '#5a1d1d',
    borderColor: '#ff9696',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
