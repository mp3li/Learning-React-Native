import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { useResponsiveLayout, getScreenDimensions } from '@/hooks/use-responsive-layout';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { AccessibleButton } from '@/components/accessible-button';
import { MasterDetailComponent, type ListItem } from '@/components/master-detail';

export default function HomeScreen() {
  const router = useRouter();
  const {
    isTablet,
    isLandscape,
    screenWidth,
    screenHeight,
    getResponsiveGap,
    getResponsivePadding,
  } = useResponsiveLayout();
  const gap = getResponsiveGap();
  const padding = getResponsivePadding();
  const initialDimensions = getScreenDimensions();
  const orientationLabel = isLandscape ? 'landscape' : 'portrait';

  const demoItems: ListItem[] = [
    {
      id: 'layout',
      title: 'Responsive layout',
      description: 'Breakpoints and spacing',
    },
    {
      id: 'orientation',
      title: 'Orientation',
      description: isLandscape ? 'Landscape view' : 'Portrait view',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Labels, targets, and type',
    },
  ];

  const renderDetail = (item: ListItem) => {
    switch (item.id) {
      case 'layout':
        return (
          <ThemedView style={{ gap }}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Responsive layout details">
              Responsive layout
            </ThemedText>
            <ThemedText accessibilityRole="text">
              Current size: {Math.round(screenWidth)} x {Math.round(screenHeight)} (useWindowDimensions).
            </ThemedText>
            <ThemedText accessibilityRole="text">
              Initial size: {Math.round(initialDimensions.width)} x {Math.round(initialDimensions.height)} (Dimensions).
            </ThemedText>
            <ThemedText accessibilityRole="text">
              Breakpoints switch between phone and tablet layouts automatically.
            </ThemedText>
          </ThemedView>
        );
      case 'orientation':
        return (
          <ThemedView style={{ gap }}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Orientation details">
              Orientation
            </ThemedText>
            <ThemedText accessibilityRole="text">
              The layout is currently {orientationLabel}. Rotate to see spacing and layout adjust.
            </ThemedText>
            <ThemedText accessibilityRole="text">
              Buttons and content reflow when the device rotates.
            </ThemedText>
          </ThemedView>
        );
      case 'accessibility':
        return (
          <ThemedView style={{ gap }}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Accessibility details">
              Accessibility
            </ThemedText>
            <ThemedText accessibilityRole="text">
              Elements include labels, roles, and hints for screen readers.
            </ThemedText>
            <ThemedText accessibilityRole="text">
              Touch targets meet 48x48 minimums and text supports dynamic type scaling.
            </ThemedText>
          </ThemedView>
        );
      default:
        return null;
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
          contentFit="contain"
          accessibilityLabel="React Native logo"
          accessible={true}
        />
      }>
      <SafeAreaView style={{ flex: 1 }}>
        <ResponsiveContainer style={{ gap: padding }}>
          {/* Title Section */}
          <ThemedView style={[styles.titleContainer, { gap }]}>
            <ThemedText
              type="title"
              accessibilityRole="header"
              accessibilityLabel="Welcome to Responsive UI"
              accessibilityHint="This app demonstrates responsive design and accessibility features">
              Welcome!
            </ThemedText>
            <HelloWave />
          </ThemedView>

          {/* Responsive Step Sections */}
          <ThemedView style={[styles.stepContainer, { gap, paddingVertical: padding }]}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Step 1: Try it">
              Step 1: Try it
            </ThemedText>
            <ThemedText
              accessibilityLabel="Edit the index.tsx file to see changes. Press the developer menu shortcut to open developer tools."
              accessibilityRole="text">
              Edit{' '}
              <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
              Press{' '}
              <ThemedText type="defaultSemiBold">
                {Platform.select({
                  ios: 'cmd + d',
                  android: 'cmd + m',
                  web: 'F12',
                })}
              </ThemedText>{' '}
              to open developer tools.
            </ThemedText>
          </ThemedView>

          {/* Responsive Features Info */}
          <ThemedView style={[styles.stepContainer, { gap, paddingVertical: padding }]}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Responsive Design Features">
              Responsive Design Features
            </ThemedText>
            <ThemedText
              accessibilityLabel="This app uses useWindowDimensions and Dimensions API for screen size detection"
              accessibilityRole="text">
              This app uses{' '}
              <ThemedText type="defaultSemiBold">useWindowDimensions</ThemedText> and{' '}
              <ThemedText type="defaultSemiBold">Dimensions</ThemedText> for responsive layouts.
            </ThemedText>
            <ThemedText
              style={{ marginTop: gap }}
              accessibilityLabel="Safe area is handled with SafeAreaView from react-native-safe-area-context"
              accessibilityRole="text">
              Device safe areas are handled with{' '}
              <ThemedText type="defaultSemiBold">SafeAreaView</ThemedText> to ensure content
              doesn&apos;t overlap with system elements.
            </ThemedText>
            <ThemedText
              style={{ marginTop: gap }}
              accessibilityLabel="On tablets, the app switches to a split view master detail layout"
              accessibilityRole="text">
              On tablets, the app switches to a split-view (master-detail) layout for better use of
              screen space.
            </ThemedText>
            <ThemedText
              style={{ marginTop: gap }}
              accessibilityLabel="Current screen size and orientation"
              accessibilityRole="text">
              Screen size: {Math.round(screenWidth)} x {Math.round(screenHeight)} (live) and{' '}
              {Math.round(initialDimensions.width)} x {Math.round(initialDimensions.height)} (initial). Orientation: {orientationLabel}.
            </ThemedText>
          </ThemedView>

          {/* Accessibility Features */}
          <ThemedView style={[styles.stepContainer, { gap, paddingVertical: padding }]}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Accessibility Features">
              Accessibility Features
            </ThemedText>
            <ThemedText
              accessibilityLabel="All UI elements have proper accessibility labels and hints"
              accessibilityRole="text">
              All UI elements have proper{' '}
              <ThemedText type="defaultSemiBold">accessibility labels</ThemedText> and{' '}
              <ThemedText type="defaultSemiBold">hints</ThemedText>.
            </ThemedText>
            <ThemedText
              style={{ marginTop: gap }}
              accessibilityLabel="Touch targets are sized at minimum 48 by 48 points to meet accessibility guidelines"
              accessibilityRole="text">
              Touch targets meet the minimum{' '}
              <ThemedText type="defaultSemiBold">48x48 points</ThemedText> size requirement.
            </ThemedText>
            <ThemedText
              style={{ marginTop: gap }}
              accessibilityLabel="Text supports dynamic type scaling for better readability"
              accessibilityRole="text">
              Text supports <ThemedText type="defaultSemiBold">dynamic type scaling</ThemedText> for
              better readability.
            </ThemedText>
            <ThemedText
              style={{ marginTop: gap }}
              accessibilityLabel="Color contrast meets WCAG AA standards for both light and dark modes"
              accessibilityRole="text">
              Colors maintain <ThemedText type="defaultSemiBold">WCAG AA contrast</ThemedText> in
              both light and dark modes.
            </ThemedText>
          </ThemedView>

          {/* Master-Detail Demo */}
          <ThemedView style={[styles.stepContainer, { gap, paddingVertical: padding }]}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Master detail demo">
              Master-detail demo
            </ThemedText>
            <ThemedText
              accessibilityLabel="Select an item to view details"
              accessibilityRole="text">
              Select an item to view details. On tablets, the list and detail appear side-by-side.
            </ThemedText>
            <View style={[styles.masterDetailWrapper, isTablet && styles.masterDetailWrapperTablet]}>
              <MasterDetailComponent items={demoItems} renderDetail={renderDetail} />
            </View>
          </ThemedView>

          {/* Action Buttons */}
          <View
            style={[
              styles.buttonContainer,
              { gap },
              isLandscape && styles.buttonContainerLandscape,
            ]}>
            <AccessibleButton
              label="Open Demo"
              onPress={() => router.push('/demo')}
              variant="primary"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Open the demo page"
            />
            <AccessibleButton
              label="Learn More"
              onPress={() => {}}
              variant="secondary"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Open additional resources and documentation"
            />
          </View>

          {/* Link Example */}
          <ThemedView style={[styles.stepContainer, { gap, paddingVertical: padding }]}>
            <Link
              href="/modal"
              asChild
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open modal">
              <Link.Trigger>
                <ThemedText
                  type="subtitle"
                  style={{ color: '#0a7ea4', marginBottom: 8 }}>
                  Step 2: Explore
                </ThemedText>
              </Link.Trigger>
              <Link.Preview />
              <Link.Menu>
                <Link.MenuAction
                  title="Action"
                  icon="cube"
                  onPress={() => alert('Action pressed')}
                />
                <Link.MenuAction
                  title="Share"
                  icon="square.and.arrow.up"
                  onPress={() => alert('Share pressed')}
                />
                <Link.Menu title="More" icon="ellipsis">
                  <Link.MenuAction
                    title="Delete"
                    icon="trash"
                    destructive
                    onPress={() => alert('Delete pressed')}
                  />
                </Link.Menu>
              </Link.Menu>
            </Link>

            <ThemedText
              accessibilityLabel="Tap the Explore tab to learn more about what is included in this starter app"
              accessibilityRole="text">
              Tap the Explore tab to learn more about what&apos;s included in this app.
            </ThemedText>
          </ThemedView>

          {/* Final Step */}
          <ThemedView style={[styles.stepContainer, { gap, paddingVertical: padding }]}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="Step 3: Get a fresh start">
              Step 3: Get a fresh start
            </ThemedText>
            <ThemedText
              accessibilityLabel="When you are ready, run npm run reset-project to get a fresh app directory"
              accessibilityRole="text">
              When you&apos;re ready, run{' '}
              <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
              <ThemedText type="defaultSemiBold">app</ThemedText> directory.
            </ThemedText>
          </ThemedView>
        </ResponsiveContainer>
      </SafeAreaView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginVertical: 16,
  },
  buttonContainerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  masterDetailWrapper: {
    minHeight: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  masterDetailWrapperTablet: {
    minHeight: 320,
  },
});
