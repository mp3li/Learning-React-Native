import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * Responsive container that adjusts padding and width based on screen size
 */
export function ResponsiveContainer({ style, children, ...props }: ResponsiveContainerProps) {
  const { getResponsivePadding, screenWidth, isTablet } = useResponsiveLayout();
  const padding = getResponsivePadding();

  const containerStyle = [
    styles.container,
    {
      paddingHorizontal: padding,
      paddingVertical: padding,
    },
    isTablet && { maxWidth: screenWidth * 0.9 },
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
}

/**
 * Master-detail layout component for tablet mode
 */
interface MasterDetailLayoutProps {
  masterContent: React.ReactNode;
  detailContent: React.ReactNode;
  showMasterDetail?: boolean;
}

export function MasterDetailLayout({
  masterContent,
  detailContent,
  showMasterDetail = true,
}: MasterDetailLayoutProps) {
  const { isTablet, masterDetailColumnWidth, detailColumnWidth, getResponsivePadding } =
    useResponsiveLayout();

  const padding = getResponsivePadding();

  if (!isTablet || !showMasterDetail) {
    // On phone, show only detail content
    return (
      <View style={[styles.container, { padding }]}>
        {detailContent}
      </View>
    );
  }

  // On tablet, show both master and detail side by side
  return (
    <View style={[styles.masterDetailContainer, { gap: padding }]}>
      <View style={[styles.masterColumn, { width: masterDetailColumnWidth, paddingLeft: padding }]}>
        {masterContent}
      </View>
      <View style={[styles.detailColumn, { width: detailColumnWidth, paddingRight: padding }]}>
        {detailContent}
      </View>
    </View>
  );
}

/**
 * Grid layout component that adjusts columns based on screen size
 */
interface GridLayoutProps {
  children: React.ReactNode[];
  columnCount?: number;
  gap?: number;
}

export function GridLayout({ children, columnCount, gap = 8 }: GridLayoutProps) {
  const { getGridColumns, getResponsivePadding } = useResponsiveLayout();
  const columns = columnCount || getGridColumns();
  const padding = getResponsivePadding();

  // Calculate number of rows
  const rows = Math.ceil(children.length / columns);
  const cells: React.ReactNode[][] = [];

  for (let row = 0; row < rows; row++) {
    const rowCells = [];
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < children.length) {
        rowCells.push(
          <View key={index} style={{ flex: 1, marginRight: col < columns - 1 ? gap : 0 }}>
            {children[index]}
          </View>
        );
      } else {
        // Add empty spacer for incomplete rows
        rowCells.push(<View key={`empty-${index}`} style={{ flex: 1 }} />);
      }
    }
    cells.push(rowCells);
  }

  return (
    <View style={[styles.gridContainer, { paddingHorizontal: padding, gap }]}>
      {cells.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  masterDetailContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  masterColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  detailColumn: {
    flex: 2,
  },
  gridContainer: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
});
