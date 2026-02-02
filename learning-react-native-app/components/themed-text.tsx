import { StyleSheet, Text, type TextProps, useWindowDimensions, AccessibilityRole } from 'react-native';
import { useMemo } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  allowFontScaling = true,
  maxFontSizeMultiplier = 1.5,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { scale } = useWindowDimensions();

  // Responsive font size based on scale
  const responsiveStyle = useMemo(() => {
    const baseStyle =
      type === 'default'
        ? styles.default
        : type === 'title'
          ? styles.title
          : type === 'defaultSemiBold'
            ? styles.defaultSemiBold
            : type === 'subtitle'
              ? styles.subtitle
              : type === 'link'
                ? styles.link
                : {};

    // Apply dynamic type scaling for accessibility
    return {
      ...baseStyle,
      fontSize: (baseStyle.fontSize || 16) * Math.min(scale, 1.3), // Cap at 1.3x for readability
      lineHeight: (baseStyle.lineHeight || 24) * Math.min(scale, 1.3),
    };
  }, [type, scale]);

  return (
    <Text
      style={[{ color }, responsiveStyle, style]}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
