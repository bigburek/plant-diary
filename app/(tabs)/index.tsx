import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import PlantIcon, { variantFromId } from '@/components/plant-icon';
import { Colors } from '@/constants/theme';
import { auth } from '@/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearPlants, startPlantsListener } from '@/store/plantsSlice';
import { Plant } from '@/types/plant';
import { signOut } from 'firebase/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const C = Colors[theme];
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const { plants, loading } = useSelector((state: RootState) => state.plants);

  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  
  useEffect(() => {
    const unsubscribe = dispatch(startPlantsListener());
    return () => {
      if (unsubscribe) unsubscribe();
      dispatch(clearPlants());
    };
  }, []);

  const filteredPlants = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return plants;
    return plants.filter((p: Plant) =>
      p.nickname.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q)
    );
  }, [plants, search]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.title, { color: C.title }]}>My Plants</Text>

      <TextInput
        placeholder="Search plants..."
        placeholderTextColor={C.textLight}
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]}
      />

      <FlatList
        data={filteredPlants}
        keyExtractor={(item: Plant) => item.id!}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshing={loading}
        renderItem={({ item }: { item: Plant }) => (
          <View style={[styles.card, { backgroundColor: C.card }]}>
            <Pressable
              onPress={() => router.push({ pathname: '/plant', params: { id: item.id } })}
              style={styles.cardContent}
            >
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: C.title }]}>{item.nickname}</Text>
                <Text style={[styles.cardSpecies, { color: C.subtitle }]}>{item.species}</Text>
                <Text style={[styles.cardStreak, { color: C.subtitle }]}>
                  Watering streak: {item.streak}
                </Text>
              </View>
              <PlantIcon variant={variantFromId(item.id!)} size={72} />
            </Pressable>

            <Pressable onPress={() => setSelectedPlant(item)} style={styles.dotsButton}>
              <Text style={[styles.dots, { color: C.text }]}>⋮</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PlantIcon variant="flower" size={100} />
            <Text style={[styles.emptyText, { color: C.textLight }]}>
              No plants yet. Add your first plant!
            </Text>
          </View>
        }
      />

      <Modal
        transparent
        visible={!!selectedPlant}
        animationType="fade"
        onRequestClose={() => setSelectedPlant(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelectedPlant(null)}>
          <View style={[styles.menu, { backgroundColor: C.white }]}>
            <Text style={[styles.menuPlantName, { color: C.textLight }]}>
              {selectedPlant?.nickname}
            </Text>
            <Pressable
              style={[styles.menuItem, { borderBottomColor: C.accent }]}
              onPress={() => {
                setSelectedPlant(null);
                router.push({ pathname: '/edit', params: { id: selectedPlant?.id } });
              }}
            >
              <Text style={[styles.menuItemText, { color: C.text }]}>✏️ Edit plant</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setSelectedPlant(null);
                router.push({ pathname: '/delete', params: { id: selectedPlant?.id } });
              }}
            >
              <Text style={[styles.menuItemText, { color: C.danger }]}>🗑️ Delete plant</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
  search: { borderWidth: 1.5, borderRadius: 12, padding: 13, marginBottom: 16, fontSize: 15 },
  card: { flexDirection: 'row', borderRadius: 14, marginBottom: 12, overflow: 'hidden', alignItems: 'center', paddingRight: 4 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, paddingRight: 8 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  cardSpecies: { fontSize: 14, marginBottom: 4 },
  cardStreak: { fontSize: 13 },
  dotsButton: { paddingHorizontal: 12, paddingVertical: 16 },
  dots: { fontSize: 22, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  menu: { width: 240, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  menuPlantName: { fontSize: 12, fontWeight: '600', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  menuItemText: { fontSize: 15, fontWeight: '500' },
});
