import { useMemo, useCallback } from 'react';
import { AccessibilityRole, AccessibilityActionInfo } from 'react-native';

/**
 * Minimum color contrast ratio for WCAG AA compliance
 * Text: 4.5:1, Large text: 3:1, Graphics: 3:1
 */
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3,
  GRAPHICS: 3,
};

/**
 * Minimum touch target size in points (accessibility requirement)
 */
export const MIN_TOUCH_TARGET = 48;

/**
 * Hook for accessibility features
 */
export function useAccessibilityFeatures() {
  /**
   * Get accessible label for button with action hint
   */
  const getAccessibleLabel = useCallback((text: string, action?: string): string => {
    if (action) {
      return `${text}, ${action}`;
    }
    return text;
  }, []);

  /**
   * Create accessibility actions for interactive elements
   */
  const createAccessibilityActions = useCallback((
    actions: Array<{ name: string; label: string }>
  ): AccessibilityActionInfo[] => {
    return actions as AccessibilityActionInfo[];
  }, []);

  /**
   * Format accessibility hint for UI elements
   */
  const getAccessibilityHint = useCallback((action: string): string => {
    return `${action}. Double tap to activate.`;
  }, []);

  /**
   * Check if touch target meets minimum size
   */
  const isTouchTargetValid = useCallback((width: number, height: number): boolean => {
    return width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
  }, []);

  return {
    getAccessibleLabel,
    createAccessibilityActions,
    getAccessibilityHint,
    isTouchTargetValid,
  };
}

/**
 * Calculate luminance of a color for contrast checking
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Luminance value
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check contrast ratio between two colors
 * @param hex1 First color in hex format
 * @param hex2 Second color in hex format
 * @returns Contrast ratio
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);

  if (!c1 || !c2) return 0;

  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Accessibility properties for common interactive elements
 */
export const ACCESSIBLE_ROLES: Record<string, AccessibilityRole> = {
  button: 'button',
  link: 'link',
  header: 'header',
  list: 'list',
  listItem: 'menuitem',
  switch: 'switch',
  checkbox: 'checkbox',
  radio: 'radio',
};

/**
 * Generate semantic accessibility properties
 */
export function getAccessibilityProps(
  role: AccessibilityRole,
  label?: string,
  hint?: string
): object {
  return {
    accessibilityRole: role,
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}
