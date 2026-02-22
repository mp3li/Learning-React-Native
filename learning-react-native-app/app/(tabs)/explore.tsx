import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { ResponsiveContainer } from '@/components/responsive-layout';

export default function TabTwoScreen() {
  const { isTablet, getResponsiveGap, getResponsivePadding } = useResponsiveLayout();
  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <SafeAreaView style={{ flex: 1 }}>
        <ResponsiveContainer style={{ gap: padding }}>
          {/* Title */}
          <ThemedView style={{ gap }}>
            <ThemedText
              type="title"
              style={{
                fontFamily: Fonts.rounded,
              }}
              accessibilityRole="header"
              accessibilityLabel="Explore section">
              Explore
            </ThemedText>
            <ThemedText
              accessibilityLabel="This app includes example code to help you get started"
              accessibilityRole="text">
              This app includes example code to help you get started.
            </ThemedText>
          </ThemedView>

          {/* File-based Routing Section */}
          <Collapsible
            title="File-based routing"
            accessibilityLabel="File-based routing section"
            accessibilityHint="Expand to learn about the file-based routing structure">
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="This app has two screens in the tabs directory: index and explore">
              This app has two screens:{' '}
              <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
              <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="The layout file in app tabs defines the tab navigator">
              The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
              sets up the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText
                type="link"
                accessibilityRole="link"
                accessibilityLabel="Learn more about Expo Router, opens external link">
                Learn more
              </ThemedText>
            </ExternalLink>
          </Collapsible>

          {/* Platform Support Section */}
          <Collapsible
            title="Android, iOS, and web support"
            accessibilityLabel="Platform support section"
            accessibilityHint="Expand to learn about multi-platform support">
            <ThemedText
              accessibilityLabel="You can open this project on Android, iOS, and the web">
              You can open this project on Android, iOS, and the web. To open the web version, press{' '}
              <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
            </ThemedText>
          </Collapsible>

          {/* Images Section */}
          <Collapsible
            title="Images and responsive assets"
            accessibilityLabel="Images and responsive assets section"
            accessibilityHint="Expand to learn about image optimization">
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="For static images you can use the @2x and @3x suffixes for different screen densities">
              For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText>{' '}
              and <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
              different screen densities
            </ThemedText>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={{
                width: isTablet ? 150 : 100,
                height: isTablet ? 150 : 100,
                alignSelf: 'center',
                marginVertical: gap,
              }}
              contentFit="contain"
              accessibilityLabel="React logo image"
            />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText
                type="link"
                accessibilityRole="link"
                accessibilityLabel="Learn more about images in React Native, opens external link">
                Learn more
              </ThemedText>
            </ExternalLink>
          </Collapsible>

          {/* Theme Section */}
          <Collapsible
            title="Light and dark mode components"
            accessibilityLabel="Light and dark mode components section"
            accessibilityHint="Expand to learn about theme support">
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="This template has light and dark mode support using the useColorScheme hook">
              This template has light and dark mode support. The{' '}
              <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
              what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText
                type="link"
                accessibilityRole="link"
                accessibilityLabel="Learn more about color themes, opens external link">
                Learn more
              </ThemedText>
            </ExternalLink>
          </Collapsible>

          {/* Responsive Design Section */}
          <Collapsible
            title="Responsive design and accessibility"
            accessibilityLabel="Responsive design and accessibility section"
            accessibilityHint="Expand to learn about responsive layouts and accessibility features">
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="This app uses useWindowDimensions to create responsive layouts">
              This app uses <ThemedText type="defaultSemiBold">useWindowDimensions</ThemedText> to
              create responsive layouts that adapt to different screen sizes and orientations.
            </ThemedText>
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="On tablets the app switches to a split view master detail layout">
              On tablets, the app switches to a split-view <ThemedText type="defaultSemiBold">(master-detail)</ThemedText>{' '}
              layout for better use of available space.
            </ThemedText>
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="All UI elements have proper accessibility labels and hints for screen reader users">
              All UI elements have proper{' '}
              <ThemedText type="defaultSemiBold">accessibility labels and hints</ThemedText> for
              screen reader support.
            </ThemedText>
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="Touch targets are sized at minimum 48 by 48 points to meet accessibility guidelines">
              Touch targets meet the minimum <ThemedText type="defaultSemiBold">48x48 points</ThemedText> size for
              easy interaction.
            </ThemedText>
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="Text supports dynamic type scaling for better readability">
              Text supports <ThemedText type="defaultSemiBold">dynamic type scaling</ThemedText> to
              adapt to user preferences.
            </ThemedText>
          </Collapsible>

          {/* Animations Section */}
          <Collapsible
            title="Animations"
            accessibilityLabel="Animations section"
            accessibilityHint="Expand to learn about animation libraries">
            <ThemedText
              style={{ marginBottom: gap }}
              accessibilityLabel="This template includes an example animated component using react-native-reanimated">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
              the powerful{' '}
              <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
                react-native-reanimated
              </ThemedText>{' '}
              library to create a waving hand animation.
            </ThemedText>
            {Platform.select({
              ios: (
                <ThemedText
                  accessibilityLabel="The components/ParallaxScrollView component provides a parallax effect for the header image on iOS">
                  The{' '}
                  <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
                  component provides a parallax effect for the header image.
                </ThemedText>
              ),
            })}
          </Collapsible>
        </ResponsiveContainer>
      </SafeAreaView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 310,
    width: 310,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
