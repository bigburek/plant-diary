import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';

import Icon from '@/components/icon';
import PlantIcon, { variantFromId } from '@/components/plant-icon';
import { Colors } from '@/constants/theme';
import { getPublicPlants } from '@/firebase/firestore/CRUD';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { AppDispatch } from '@/store';
import { addPlant } from '@/store/plantsSlice';
import { Plant } from '@/types/plant';

export default function ExploreScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [publicPlants, setPublicPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Plant | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchPlants = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getPublicPlants(user.uid);
      setPublicPlants(data);
    } catch (err) {
      console.error('Failed to fetch public plants', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchPlants(); }, [fetchPlants]));

  const handleAddToMyPlants = async () => {
    if (!user || !selected) return;
    setAdding(true);
    try {
      const now = Date.now();

      await dispatch(addPlant({
        userId: user.uid,
        plantData: {
          nickname: selected.nickname,
          species: selected.species,
          wateringInterval: selected.wateringInterval,
          lastWateredAt: now,
          streak: 0,
          createdAt: now,
          userId: user.uid,
          notificationId: '',
          isPrivate: false,
          localImageUri: '',
        },
      }));

      setSelected(null);
      alert(`"${selected.nickname}" added to your collection!`);
    } catch (err) {
      console.error('Failed to copy plant', err);
      alert('Failed to add plant. Try again.');
    } finally {
      setAdding(false);
    }
  };

  const filtered = publicPlants.filter((p) => {
    const q = search.toLowerCase();
    return q === '' || p.nickname.toLowerCase().includes(q) || p.species.toLowerCase().includes(q);
  });

  const getDaysUntilWater = (p: Plant) =>
    Math.max(0, p.wateringInterval - Math.floor((Date.now() - p.lastWateredAt) / (1000 * 60 * 60 * 24)));

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.title, { color: C.title }]}>Explore</Text>
      <Text style={[styles.subtitle, { color: C.textLight }]}>Public plants from the community</Text>

      <View style={[styles.searchContainer, { borderColor: C.tint }]}>
        <Icon name="search" size={20} color={C.textLight} />
        <TextInput
          placeholder="Search plants..."
          placeholderTextColor={C.textLight}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: C.text }]}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.tint} />
          <Text style={[styles.loadingText, { color: C.textLight }]}>Loading community plants...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id!}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPlants} tintColor={C.tint} />}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, { backgroundColor: C.card, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => setSelected(item)}
            >
              <View style={[styles.cardIconBox, { backgroundColor: C.accent }]}>
                <PlantIcon variant={variantFromId(item.id!)} size={72} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardName, { color: C.title }]} numberOfLines={1}>{item.nickname}</Text>
                <Text style={[styles.cardSpecies, { color: C.textLight }]} numberOfLines={1}>{item.species}</Text>
                <View style={styles.cardBadges}>
                  <View style={[styles.badge, { backgroundColor: C.background }]}>
                    <Icon name="water" size={12} color={C.tint} />
                    <Text style={[styles.badgeText, { color: C.title }]}>{item.wateringInterval}d</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: C.background }]}>
                    <Icon name="fire" size={12} color="#FFA500" />
                    <Text style={[styles.badgeText, { color: C.title }]}>{item.streak}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <PlantIcon variant="tropical" size={100} />
              <Text style={[styles.emptyTitle, { color: C.title }]}>No public plants yet</Text>
              <Text style={[styles.emptyText, { color: C.textLight }]}>Be the first! Make one of your plants public from the Add or Edit page.</Text>
            </View>
          }
        />
      )}

      {selected && (
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          <View style={[styles.popup, { backgroundColor: C.white }]}>
            <View style={[styles.popupIconBox, { backgroundColor: C.card }]}>
              <PlantIcon variant={variantFromId(selected.id!)} size={80} />
            </View>
            <Text style={[styles.popupName, { color: C.title }]}>{selected.nickname}</Text>
            <Text style={[styles.popupSpecies, { color: C.textLight }]}>{selected.species}</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: C.card }]}>
                <Icon name="water" size={24} color={C.tint} />
                <Text style={[styles.statValue, { color: C.title }]}>{selected.wateringInterval}</Text>
                <Text style={[styles.statLabel, { color: C.textLight }]}>days</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: C.card }]}>
                <Icon name="fire" size={24} color="#FFA500" />
                <Text style={[styles.statValue, { color: C.title }]}>{selected.streak}</Text>
                <Text style={[styles.statLabel, { color: C.textLight }]}>streak</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: C.card }]}>
                <Icon name="clock" size={24} color={C.textLight} />
                <Text style={[styles.statValue, { color: C.title }]}>{getDaysUntilWater(selected)}</Text>
                <Text style={[styles.statLabel, { color: C.textLight }]}>next</Text>
              </View>
            </View>
            <Text style={[styles.popupHint, { color: C.textLight }]}>Add a copy of this plant to your collection?</Text>
            <Pressable
              style={({ pressed }) => [styles.addBtn, { backgroundColor: C.card, opacity: pressed || adding ? 0.7 : 1 }]}
              onPress={handleAddToMyPlants}
              disabled={adding}
            >
              <Text style={[styles.addBtnText, { color: C.title }]}>{adding ? 'Adding...' : 'Add to My Plants'}</Text>
            </Pressable>
            <Pressable onPress={() => setSelected(null)} style={styles.cancelBtn}>
              <Text style={[styles.cancelBtnText, { color: C.textLight }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginBottom: 16, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  searchInput: { flex: 1, paddingVertical: 13, paddingLeft: 8, fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  row: { gap: 12 },
  grid: { gap: 12, paddingBottom: 32 },
  card: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  cardIconBox: { width: '100%', height: 110, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 12, gap: 3 },
  cardName: { fontSize: 14, fontWeight: '700' },
  cardSpecies: { fontSize: 12, fontStyle: 'italic' },
  cardBadges: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', zIndex: 100 },
  popup: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', gap: 10 },
  popupIconBox: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  popupName: { fontSize: 22, fontWeight: '800' },
  popupSpecies: { fontSize: 14, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  popupHint: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  addBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  addBtnText: { fontSize: 16, fontWeight: '700' },
  cancelBtn: { paddingVertical: 8 },
  cancelBtnText: { fontSize: 15 },
});
