import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessible-button';
import { ExternalLink } from '@/components/external-link';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStateContext } from '@/context/app-state-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

const REQUEST_DURATION_MS = 6000;
const REQUEST_TICK_MS = 250;
const REQUEST_RETRY_LIMIT = 3;
const REQUEST_RETRY_DELAY_MS = 900;
const STORAGE_KEY = 'objective-4-lifecycle-state';
const DEFAULT_RESULT = 'No request started yet.';

type RequestStatus = 'idle' | 'running' | 'paused' | 'completed';

type PersistedState = {
  counter: number;
  note: string;
  requestStatus: RequestStatus;
  remainingMs: number;
  resultText: string;
  attemptsUsed: number;
  savedAt: string;
};

function normalizeRequestStatus(value: unknown): RequestStatus {
  if (value === 'running' || value === 'paused' || value === 'completed') {
    return value;
  }
  return 'idle';
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function LifecycleScreen() {
  const { getResponsiveGap, getResponsivePadding, isTablet } = useResponsiveLayout();
  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const {
    reportError,
    showSnackbar,
    simulateNetworkFailure,
    setSimulateNetworkFailure,
  } = useAppStateContext();

  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor({ light: '#ffffff', dark: '#1f2528' }, 'background');
  const borderColor = useThemeColor({ light: '#c6d2d8', dark: '#455057' }, 'icon');
  const mutedTextColor = useThemeColor({ light: '#566066', dark: '#b7c0c6' }, 'icon');

  const [counter, setCounter] = useState(0);
  const [note, setNote] = useState('');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [remainingMs, setRemainingMs] = useState(REQUEST_DURATION_MS);
  const [resultText, setResultText] = useState(DEFAULT_RESULT);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [appStateLabel, setAppStateLabel] = useState<AppStateStatus>(AppState.currentState);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const counterRef = useRef(counter);
  const noteRef = useRef(note);
  const requestStatusRef = useRef<RequestStatus>(requestStatus);
  const resultTextRef = useRef(resultText);
  const remainingMsRef = useRef(remainingMs);
  const attemptsUsedRef = useRef(attemptsUsed);
  const simulateFailureRef = useRef(simulateNetworkFailure);
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

  useEffect(() => {
    attemptsUsedRef.current = attemptsUsed;
  }, [attemptsUsed]);

  useEffect(() => {
    simulateFailureRef.current = simulateNetworkFailure;
  }, [simulateNetworkFailure]);

  const setStatus = useCallback((nextStatus: RequestStatus) => {
    requestStatusRef.current = nextStatus;
    setRequestStatus(nextStatus);
  }, []);

  const setResult = useCallback((nextResult: string) => {
    resultTextRef.current = nextResult;
    setResultText(nextResult);
  }, []);

  const setRetryCount = useCallback((attemptCount: number) => {
    attemptsUsedRef.current = attemptCount;
    setAttemptsUsed(attemptCount);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const persistState = useCallback(async () => {
    const payload: PersistedState = {
      counter: counterRef.current,
      note: noteRef.current,
      requestStatus: requestStatusRef.current,
      remainingMs: remainingMsRef.current,
      resultText: resultTextRef.current,
      attemptsUsed: attemptsUsedRef.current,
      savedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(new Date(payload.savedAt).toLocaleTimeString());
    } catch (error) {
      reportError(error, 'Unable to save your latest state.');
      setResult('State save failed. Check storage permissions and try again.');
    }
  }, [reportError, setResult]);

  const runNetworkRequestWithRetry = useCallback(async () => {
    for (let attempt = 1; attempt <= REQUEST_RETRY_LIMIT; attempt += 1) {
      setRetryCount(attempt);

      try {
        if (simulateFailureRef.current) {
          throw new Error('Simulated network failure is enabled.');
        }

        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as { title?: unknown };
        const title = typeof payload.title === 'string' ? payload.title : 'Request succeeded';

        return {
          attempt,
          title,
        };
      } catch (error) {
        if (attempt >= REQUEST_RETRY_LIMIT) {
          throw error;
        }

        setResult(
          `Attempt ${attempt} failed. Retrying in ${REQUEST_RETRY_DELAY_MS / 1000} seconds...`
        );
        await sleep(REQUEST_RETRY_DELAY_MS);
      }
    }

    throw new Error('Retry loop ended unexpectedly.');
  }, [setResult, setRetryCount]);

  const completeRequestWithRetry = useCallback(async () => {
    setResult('Countdown finished. Sending request...');

    try {
      const success = await runNetworkRequestWithRetry();
      setStatus('completed');
      setResult(`Request succeeded on attempt ${success.attempt}: ${success.title}`);
      showSnackbar('Request completed successfully.', 'info');
    } catch (error) {
      setStatus('paused');
      setResult(`Request failed after ${REQUEST_RETRY_LIMIT} attempts.`);
      reportError(error, 'Request failed after 3 retries. Try again.');
    } finally {
      void persistState();
    }
  }, [persistState, reportError, runNetworkRequestWithRetry, setResult, setStatus, showSnackbar]);

  const beginCountdown = useCallback(() => {
    clearTimer();

    timerRef.current = setInterval(() => {
      const nextRemaining = Math.max(0, remainingMsRef.current - REQUEST_TICK_MS);
      remainingMsRef.current = nextRemaining;
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0) {
        clearTimer();
        void completeRequestWithRetry();
      }
    }, REQUEST_TICK_MS);
  }, [clearTimer, completeRequestWithRetry]);

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

    const shouldRestartCountdown =
      requestStatusRef.current === 'idle' ||
      requestStatusRef.current === 'completed' ||
      remainingMsRef.current <= 0;

    if (shouldRestartCountdown) {
      remainingMsRef.current = REQUEST_DURATION_MS;
      setRemainingMs(REQUEST_DURATION_MS);
      setRetryCount(0);
      setResult('Mock request started.');
    } else {
      setResult('Mock request resumed.');
    }

    setStatus('running');
    beginCountdown();
    void persistState();
  }, [beginCountdown, persistState, setResult, setRetryCount, setStatus]);

  const resetDemo = useCallback(() => {
    clearTimer();
    setCounter(0);
    counterRef.current = 0;
    setNote('');
    noteRef.current = '';
    remainingMsRef.current = REQUEST_DURATION_MS;
    setRemainingMs(REQUEST_DURATION_MS);
    setRetryCount(0);
    setStatus('idle');
    setResult(DEFAULT_RESULT);
    void persistState();
  }, [clearTimer, persistState, setResult, setRetryCount, setStatus]);

  useEffect(() => {
    let isMounted = true;

    const restoreState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setIsHydrated(true);
          return;
        }

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

        if (typeof saved.attemptsUsed === 'number') {
          setRetryCount(Math.min(Math.max(saved.attemptsUsed, 0), REQUEST_RETRY_LIMIT));
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
      } catch (error) {
        reportError(error, 'Saved state could not be restored.');
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
  }, [clearTimer, reportError, setResult, setRetryCount, setStatus]);

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
            Objective 4: Persistence & Error Resilience
          </ThemedText>
          <ThemedText>
            Uses AsyncStorage for volatile UI state, central error notifications, and retry logic for
            network requests.
          </ThemedText>
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Volatile State (Persisted)
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
            Request Retry Demo
          </ThemedText>
          <ThemedText>AppState: {appStateLabel}</ThemedText>
          <ThemedText>Status: {requestStatus}</ThemedText>
          <ThemedText>Progress: {progressPercent}%</ThemedText>
          <ThemedText>
            Attempts Used: {attemptsUsed}/{REQUEST_RETRY_LIMIT}
          </ThemedText>
          <ThemedText>
            Simulated Network Failure: {simulateNetworkFailure ? 'Enabled' : 'Disabled'}
          </ThemedText>

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

          <AccessibleButton
            label={simulateNetworkFailure ? 'Disable Simulated Failure' : 'Enable Simulated Failure'}
            onPress={() => setSimulateNetworkFailure(!simulateNetworkFailure)}
            variant="outline"
            size={isTablet ? 'large' : 'medium'}
            accessibilityHint="Toggle simulated network errors to test retries and snackbar errors"
          />

          <ThemedText>Last saved: {lastSavedAt ?? 'Not saved yet'}</ThemedText>
        </ThemedView>

        <ThemedView style={{ gap }}>
          <ExternalLink href="https://react-native-async-storage.github.io/async-storage/docs/usage/">
            <ThemedText type="link">Read AsyncStorage documentation</ThemedText>
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
