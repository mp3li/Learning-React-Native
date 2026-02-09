import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';

import { AccessibleButton } from '@/components/accessible-button';
import { ExternalLink } from '@/components/external-link';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

const REQUEST_DURATION_MS = 6000;
const REQUEST_TICK_MS = 250;
const DEFAULT_RESULT = 'No request started yet.';

type RequestStatus = 'idle' | 'running' | 'paused' | 'completed';

type PersistedState = {
  counter: number;
  note: string;
  requestStatus: RequestStatus;
  remainingMs: number;
  resultText: string;
  savedAt: string;
};

function normalizeRequestStatus(value: unknown): RequestStatus {
  if (value === 'running' || value === 'paused' || value === 'completed') {
    return value;
  }
  return 'idle';
}

export default function LifecycleScreen() {
  const { getResponsiveGap, getResponsivePadding, isTablet } = useResponsiveLayout();
  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor({ light: '#ffffff', dark: '#1f2528' }, 'background');
  const borderColor = useThemeColor({ light: '#c6d2d8', dark: '#455057' }, 'icon');
  const mutedTextColor = useThemeColor({ light: '#566066', dark: '#b7c0c6' }, 'icon');

  const stateFileUri = useMemo(() => {
    if (!FileSystem.documentDirectory) {
      return null;
    }
    return `${FileSystem.documentDirectory}objective-3-lifecycle-state.json`;
  }, []);

  const [counter, setCounter] = useState(0);
  const [note, setNote] = useState('');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [remainingMs, setRemainingMs] = useState(REQUEST_DURATION_MS);
  const [resultText, setResultText] = useState(DEFAULT_RESULT);
  const [appStateLabel, setAppStateLabel] = useState<AppStateStatus>(AppState.currentState);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const counterRef = useRef(counter);
  const noteRef = useRef(note);
  const requestStatusRef = useRef<RequestStatus>(requestStatus);
  const resultTextRef = useRef(resultText);
  const remainingMsRef = useRef(remainingMs);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    counterRef.current = counter;
  }, [counter]);

  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    requestStatusRef.current = requestStatus;
  }, [requestStatus]);

  useEffect(() => {
    resultTextRef.current = resultText;
  }, [resultText]);

  useEffect(() => {
    remainingMsRef.current = remainingMs;
  }, [remainingMs]);

  const setStatus = useCallback((nextStatus: RequestStatus) => {
    requestStatusRef.current = nextStatus;
    setRequestStatus(nextStatus);
  }, []);

  const setResult = useCallback((nextResult: string) => {
    resultTextRef.current = nextResult;
    setResultText(nextResult);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const persistState = useCallback(async () => {
    if (!stateFileUri) {
      return;
    }

    const payload: PersistedState = {
      counter: counterRef.current,
      note: noteRef.current,
      requestStatus: requestStatusRef.current,
      remainingMs: remainingMsRef.current,
      resultText: resultTextRef.current,
      savedAt: new Date().toISOString(),
    };

    try {
      await FileSystem.writeAsStringAsync(stateFileUri, JSON.stringify(payload));
      setLastSavedAt(new Date(payload.savedAt).toLocaleTimeString());
    } catch {
      setResult('State save failed. Check storage permissions and try again.');
    }
  }, [setResult, stateFileUri]);

  const beginCountdown = useCallback(() => {
    clearTimer();

    timerRef.current = setInterval(() => {
      const nextRemaining = Math.max(0, remainingMsRef.current - REQUEST_TICK_MS);
      remainingMsRef.current = nextRemaining;
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0) {
        clearTimer();
        setStatus('completed');
        setResult(`Mock request completed at ${new Date().toLocaleTimeString()}.`);
        void persistState();
      }
    }, REQUEST_TICK_MS);
  }, [clearTimer, persistState, setResult, setStatus]);

  const pauseRequest = useCallback(
    (reason: string) => {
      if (requestStatusRef.current !== 'running') {
        return;
      }
      clearTimer();
      setStatus('paused');
      setResult(reason);
      void persistState();
    },
    [clearTimer, persistState, setResult, setStatus]
  );

  const resumeRequest = useCallback(
    (reason: string) => {
      if (requestStatusRef.current !== 'paused' || remainingMsRef.current <= 0) {
        return;
      }
      setStatus('running');
      setResult(reason);
      beginCountdown();
      void persistState();
    },
    [beginCountdown, persistState, setResult, setStatus]
  );

  const startRequest = useCallback(() => {
    if (requestStatusRef.current === 'running') {
      return;
    }

    if (requestStatusRef.current === 'idle' || requestStatusRef.current === 'completed') {
      remainingMsRef.current = REQUEST_DURATION_MS;
      setRemainingMs(REQUEST_DURATION_MS);
      setResult('Mock request started.');
    } else {
      setResult('Mock request resumed.');
    }

    setStatus('running');
    beginCountdown();
    void persistState();
  }, [beginCountdown, persistState, setResult, setStatus]);

  const resetDemo = useCallback(() => {
    clearTimer();
    setCounter(0);
    counterRef.current = 0;
    setNote('');
    noteRef.current = '';
    remainingMsRef.current = REQUEST_DURATION_MS;
    setRemainingMs(REQUEST_DURATION_MS);
    setStatus('idle');
    setResult(DEFAULT_RESULT);
    void persistState();
  }, [clearTimer, persistState, setResult, setStatus]);

  useEffect(() => {
    let isMounted = true;

    const restoreState = async () => {
      if (!stateFileUri) {
        setIsHydrated(true);
        return;
      }

      try {
        const fileInfo = await FileSystem.getInfoAsync(stateFileUri);
        if (!fileInfo.exists) {
          setIsHydrated(true);
          return;
        }

        const raw = await FileSystem.readAsStringAsync(stateFileUri);
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        if (!isMounted) {
          return;
        }

        if (typeof saved.counter === 'number') {
          setCounter(saved.counter);
          counterRef.current = saved.counter;
        }

        if (typeof saved.note === 'string') {
          setNote(saved.note);
          noteRef.current = saved.note;
        }

        if (typeof saved.resultText === 'string') {
          setResult(saved.resultText);
        }

        if (typeof saved.remainingMs === 'number') {
          const clamped = Math.min(Math.max(saved.remainingMs, 0), REQUEST_DURATION_MS);
          setRemainingMs(clamped);
          remainingMsRef.current = clamped;
        }

        const restoredStatus = normalizeRequestStatus(saved.requestStatus);
        if (restoredStatus === 'running') {
          setStatus('paused');
          setResult('Restored an in-progress request. It will resume when app is active.');
        } else {
          setStatus(restoredStatus);
        }

        if (typeof saved.savedAt === 'string') {
          setLastSavedAt(new Date(saved.savedAt).toLocaleTimeString());
        }
      } catch {
        setResult('Saved state could not be restored.');
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void restoreState();

    return () => {
      isMounted = false;
      clearTimer();
    };
  }, [clearTimer, setResult, setStatus, stateFileUri]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      setAppStateLabel(nextState);

      const movedToBackground =
        previousState === 'active' && (nextState === 'inactive' || nextState === 'background');
      const movedToForeground =
        (previousState === 'inactive' || previousState === 'background') && nextState === 'active';

      if (movedToBackground) {
        pauseRequest('App moved to background. Request paused.');
        void persistState();
      } else if (movedToForeground) {
        resumeRequest('App returned to foreground. Request resumed.');
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [pauseRequest, persistState, resumeRequest]);

  useEffect(() => {
    if (!isHydrated || requestStatusRef.current !== 'paused' || appStateRef.current !== 'active') {
      return;
    }
    resumeRequest('Restored request resumed on active app state.');
  }, [isHydrated, resumeRequest]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const timeout = setTimeout(() => {
      void persistState();
    }, 400);
    return () => {
      clearTimeout(timeout);
    };
  }, [counter, isHydrated, note, persistState]);

  const progressPercent = useMemo(() => {
    const elapsed = REQUEST_DURATION_MS - remainingMs;
    return Math.round((elapsed / REQUEST_DURATION_MS) * 100);
  }, [remainingMs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ResponsiveContainer style={{ gap: padding }}>
        <ThemedView style={{ gap }}>
          <ThemedText type="title" accessibilityRole="header">
            Objective 3: Lifecycle-Aware UI
          </ThemedText>
          <ThemedText>
            Uses AppState to pause and resume a mock network task, then persists volatile UI state.
          </ThemedText>
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Volatile State
          </ThemedText>
          <ThemedText>Counter: {counter}</ThemedText>

          <View style={[styles.row, { gap }]}>
            <AccessibleButton
              label="Decrease"
              onPress={() => setCounter((value) => value - 1)}
              variant="secondary"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Decrease the counter value"
            />
            <AccessibleButton
              label="Increase"
              onPress={() => setCounter((value) => value + 1)}
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Increase the counter value"
            />
          </View>

          <ThemedText accessibilityRole="text">Notes</ThemedText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Type something to restore after background/quit"
            placeholderTextColor={mutedTextColor}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: inputBackground,
                borderColor,
              },
            ]}
            accessibilityLabel="Notes input"
            accessibilityHint="Type text that should be restored when the app returns"
          />
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Lifecycle Request Demo
          </ThemedText>
          <ThemedText>AppState: {appStateLabel}</ThemedText>
          <ThemedText>Status: {requestStatus}</ThemedText>
          <ThemedText>Progress: {progressPercent}%</ThemedText>

          <View style={[styles.progressTrack, { borderColor }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: tintColor,
                },
              ]}
            />
          </View>

          <ThemedText>{resultText}</ThemedText>

          <View style={[styles.row, { gap }]}>
            <AccessibleButton
              label={requestStatus === 'running' ? 'Request Running' : 'Start Request'}
              onPress={startRequest}
              disabled={requestStatus === 'running'}
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Start the mock network request"
            />
            <AccessibleButton
              label="Reset"
              onPress={resetDemo}
              variant="secondary"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Reset all values in this demo"
            />
          </View>

          <ThemedText>Last saved: {lastSavedAt ?? 'Not saved yet'}</ThemedText>
          {!stateFileUri && (
            <ThemedText style={{ color: mutedTextColor }}>
              Persistence file is unavailable on this platform.
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={{ gap }}>
          <ExternalLink href="https://reactnative.dev/docs/appstate">
            <ThemedText type="link">Read AppState documentation</ThemedText>
          </ExternalLink>
        </ThemedView>
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
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
