import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { useSocialStore, SavedItem } from '../../stores/socialStore';

interface SavedItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenWorkout?: (workoutData: any) => void;
}

type SavedFilter = 'ALL' | 'WORKOUTS' | 'POSTS' | 'EXERCISES' | 'CHALLENGES';

export function SavedItemsModal({
  visible,
  onClose,
  onOpenWorkout,
}: SavedItemsModalProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<SavedFilter>('ALL');

  const savedItems = useSocialStore((state) => state.savedItems);
  const toggleSaveItem = useSocialStore((state) => state.toggleSaveItem);

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return savedItems;
    return savedItems.filter((item) => item.category === activeTab);
  }, [savedItems, activeTab]);

  if (!visible) return null;

  const tabs: { key: SavedFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'WORKOUTS', label: 'Routines' },
    { key: 'POSTS', label: 'Posts' },
    { key: 'CHALLENGES', label: 'Challenges' },
  ];

  const getCategoryColor = (cat: SavedItem['category']) => {
    switch (cat) {
      case 'WORKOUTS':
        return '#38BDF8';
      case 'POSTS':
        return '#F59E0B';
      case 'CHALLENGES':
        return '#B8F500';
      case 'EXERCISES':
        return '#A855F7';
      default:
        return '#F59E0B';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="bookmark-fill" size={20} color="#F59E0B" />
              <View>
                <Text style={styles.title}>Saved Vault</Text>
                <Text style={styles.subtitle}>{savedItems.length} bookmarked items</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  activeTab === tab.key && styles.activeTabItem,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.key && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Saved Items List */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="bookmark" size={36} color="#333333" />
                <Text style={styles.emptyTitle}>No saved items yet</Text>
                <Text style={styles.emptySub}>
                  Tap the bookmark icon on workouts, PRs, or training insights to build your library.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const catColor = getCategoryColor(item.category);

              return (
                <View style={styles.savedCard}>
                  <TouchableOpacity
                    style={styles.cardMain}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (item.category === 'WORKOUTS' && item.metadata) {
                        onClose();
                        onOpenWorkout?.(item.metadata);
                      }
                    }}
                  >
                    <View style={styles.badgeRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: catColor + '20', borderColor: catColor }]}>
                        <Text style={[styles.categoryBadgeText, { color: catColor }]}>
                          {item.category}
                        </Text>
                      </View>
                      <Text style={styles.savedDate}>
                        {new Date(item.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>

                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.unsaveBtn}
                    onPress={() => toggleSaveItem(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="bookmark-fill" size={18} color="#F59E0B" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '80%',
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#737373',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#F59E0B',
  },
  tabLabel: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  cardMain: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  savedDate: {
    color: '#555555',
    fontSize: 10,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  unsaveBtn: {
    padding: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: '#737373',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
