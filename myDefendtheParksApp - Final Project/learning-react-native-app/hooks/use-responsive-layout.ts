import { Dimensions, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useMemo } from 'react';

/**
 * Breakpoints for responsive design
 * Phone: < 600dp
 * Tablet: >= 600dp
 */
const TABLET_BREAKPOINT = 600;
const LARGE_TABLET_BREAKPOINT = 900;

/**
 * Minimum touch target size (accessibility requirement)
 */
export const MIN_TOUCH_TARGET_SIZE = 48;

/**
 * Hook for responsive layout calculations
 * Provides screen dimensions, layout type, and safe area information
 */
export function useResponsiveLayout() {
  const { width: screenWidth, height: screenHeight, scale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const layoutInfo = useMemo(() => {
    const isTablet = screenWidth >= TABLET_BREAKPOINT;
    const isLargeTablet = screenWidth >= LARGE_TABLET_BREAKPOINT;
    const isPortrait = screenHeight > screenWidth;
    const isLandscape = !isPortrait;

    // Column width for master-detail layout on tablets
    const masterDetailColumnWidth = Math.min(screenWidth * 0.35, 400);
    const detailColumnWidth = screenWidth - masterDetailColumnWidth;

    return {
      screenWidth,
      screenHeight,
      scale,
      isTablet,
      isLargeTablet,
      isPortrait,
      isLandscape,
      masterDetailColumnWidth,
      detailColumnWidth,
      insets,
      contentWidth: screenWidth - insets.left - insets.right,
      contentHeight: screenHeight - insets.top - insets.bottom,
    };
  }, [screenWidth, screenHeight, scale, insets]);

  /**
   * Get responsive padding based on screen size
   */
  const getResponsivePadding = useCallback((): number => {
    if (layoutInfo.isLargeTablet) return 24;
    if (layoutInfo.isTablet) return 20;
    return 16;
  }, [layoutInfo.isLargeTablet, layoutInfo.isTablet]);

  /**
   * Get responsive gap/spacing based on screen size
   */
  const getResponsiveGap = useCallback((): number => {
    if (layoutInfo.isLargeTablet) return 16;
    if (layoutInfo.isTablet) return 12;
    return 8;
  }, [layoutInfo.isLargeTablet, layoutInfo.isTablet]);

  /**
   * Get responsive font size for body text
   */
  const getResponsiveFontSize = useCallback((baseSize: number): number => {
    return baseSize * layoutInfo.scale;
  }, [layoutInfo.scale]);

  /**
   * Get number of columns for grid layout
   */
  const getGridColumns = useCallback((): number => {
    if (layoutInfo.isLargeTablet) return 3;
    if (layoutInfo.isTablet && layoutInfo.isPortrait) return 2;
    if (layoutInfo.isTablet && layoutInfo.isLandscape) return 3;
    return 1;
  }, [layoutInfo.isLargeTablet, layoutInfo.isTablet, layoutInfo.isPortrait, layoutInfo.isLandscape]);

  return {
    ...layoutInfo,
    getResponsivePadding,
    getResponsiveGap,
    getResponsiveFontSize,
    getGridColumns,
  };
}

/**
 * Hook to check if device is in tablet mode
 */
export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}

/**
 * Hook to check device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useWindowDimensions();
  return height > width ? 'portrait' : 'landscape';
}

/**
 * Hook for safe area information
 */
export function useSafeAreaLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const availableWidth = width - insets.left - insets.right;
  const availableHeight = height - insets.top - insets.bottom;

  return {
    availableWidth,
    availableHeight,
    insets,
  };
}

/**
 * Get current screen dimensions
 */
export function getScreenDimensions() {
  const { width, height } = Dimensions.get('window');
  return { width, height };
}
