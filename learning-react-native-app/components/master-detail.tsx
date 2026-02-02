import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, FlatList } from 'react-native';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { ThemedView } from './themed-view';

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface MasterDetailComponentProps {
  items: ListItem[];
  renderDetail: (item: ListItem) => React.ReactNode;
  renderListItem?: (item: ListItem, isSelected: boolean) => React.ReactNode;
  headerComponent?: React.ReactNode;
}

/**
 * Master-Detail layout component that shows a list on master side
 * and detailed content on detail side on tablets, single view on phones
 */
export function MasterDetailComponent({
  items,
  renderDetail,
  renderListItem,
  headerComponent,
}: MasterDetailComponentProps) {
  const [selectedItem, setSelectedItem] = useState<ListItem>(items[0] || null);
  const { isTablet, masterDetailColumnWidth, detailColumnWidth, screenWidth } =
    useResponsiveLayout();

  if (!selectedItem && items.length > 0) {
    setSelectedItem(items[0]);
  }

  const defaultListItem = (item: ListItem) => (
    <ThemedView
      style={[
        styles.listItem,
        selectedItem?.id === item.id && styles.selectedListItem,
      ]}>
      {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}
      <View style={styles.itemContent}>
        <ThemedText
          type="defaultSemiBold"
          numberOfLines={1}
          accessibilityRole="menuitem"
          accessibilityLabel={item.title}
          accessibilityState={{
            selected: selectedItem?.id === item.id,
          }}>
          {item.title}
        </ThemedText>
        {item.description && (
          <ThemedText
            style={styles.itemDescription}
            numberOfLines={1}>
            {item.description}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );

  // On phone, show either list or detail
  if (!isTablet) {
    return (
      <ScrollView style={styles.phoneContainer}>
        {headerComponent && <View style={styles.headerComponent}>{headerComponent}</View>}
        <FlatList
          scrollEnabled={false}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView
              style={styles.phoneListItem}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onTouchEnd={() => setSelectedItem(item)}>
              {renderListItem ? renderListItem(item, selectedItem?.id === item.id) : defaultListItem(item)}
            </ThemedView>
          )}
        />
        {selectedItem && (
          <View style={styles.phoneDetailSection}>
            {renderDetail(selectedItem)}
          </View>
        )}
      </ScrollView>
    );
  }

  // On tablet, show master-detail side by side
  return (
    <View style={styles.tabletContainer}>
      {/* Master column */}
      <View style={[styles.masterColumn, { width: masterDetailColumnWidth }]}>
        {headerComponent && <View style={styles.headerComponent}>{headerComponent}</View>}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityState={{
                selected: selectedItem?.id === item.id,
              }}
              onTouchEnd={() => setSelectedItem(item)}
              style={styles.masterListItemContainer}>
              {renderListItem
                ? renderListItem(item, selectedItem?.id === item.id)
                : defaultListItem(item)}
            </ThemedView>
          )}
        />
      </View>

      {/* Detail column */}
      <View style={[styles.detailColumn, { width: detailColumnWidth }]}>
        {selectedItem ? (
          <ScrollView style={styles.detailContent}>
            {renderDetail(selectedItem)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText
              type="subtitle"
              accessibilityRole="header"
              accessibilityLabel="No item selected">
              Select an item to view details
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

// Import ThemedText and ThemedView from existing components
import { ThemedText } from './themed-text';

const styles = StyleSheet.create({
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  masterColumn: {
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  detailColumn: {
    flex: 1,
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  headerComponent: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedListItem: {
    backgroundColor: '#e8f4f8',
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    marginTop: 4,
    opacity: 0.6,
    fontSize: 12,
  },
  phoneContainer: {
    flex: 1,
  },
  phoneListItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  phoneDetailSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  masterListItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
