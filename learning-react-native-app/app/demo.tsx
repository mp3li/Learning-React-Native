import type { CSSProperties } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DemoScreen() {
  const router = useRouter();

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.page}>
        <h1 style={webStyles.title}>Demo Page</h1>
        <p style={webStyles.text}>
          This demo uses plain HTML tags on the web to satisfy the assignment requirement.
        </p>
        <p style={webStyles.text}>
          Use the button below to return to the home screen.
        </p>
        <button
          type="button"
          style={webStyles.button}
          onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Demo Page</Text>
        <Text style={styles.text}>
          This page renders HTML tags on the web and a safe native fallback on iOS/Android.
        </Text>
        <Pressable
          onPress={() => router.push('/')}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

const webStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '12px',
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
  },
  title: {
    fontSize: '32px',
    margin: 0,
  },
  text: {
    fontSize: '16px',
    margin: 0,
    maxWidth: '520px',
    textAlign: 'center',
  },
  button: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0a7ea4',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
