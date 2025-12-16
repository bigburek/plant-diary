import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getPlants } from '@/firebase/firestore/CRUD';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { Plant } from '@/types/plant';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('plants');
        if (cached) setPlants(JSON.parse(cached));
      } catch (err) {
        console.error('Failed to load cached plants', err);
      }
    })();
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchPlants = async () => {
        if (!user) return;

        setLoading(true);
        try {
          const freshPlants = await getPlants(user.uid);
          if (isActive) {
            setPlants(freshPlants);
            AsyncStorage.setItem('plants', JSON.stringify(freshPlants)).catch(console.error);
          }
        } catch (err) {
          console.error('Failed to fetch plants on focus', err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchPlants();

      return () => {
        isActive = false;
      };
    }, [user])
  );

  const filteredPlants = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return plants;

    return plants.filter(
      p =>
        p.nickname.toLowerCase().includes(q) ||
        p.species.toLowerCase().includes(q)
    );
  }, [plants, search]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ThemedText style={styles.title}>My Plants</ThemedText>

      {loading && <ThemedText style={{ marginBottom: 8 }}>Refreshing…</ThemedText>}

      <TextInput
        placeholder="Search plants..."
        placeholderTextColor={Colors[theme].text}
        value={search}
        onChangeText={setSearch}
        style={[
          styles.search,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].tint,
            color: Colors[theme].text,
          },
        ]}
      />

      <FlatList
        data={filteredPlants}
        keyExtractor={item => item.id!}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshing={loading}
        onRefresh={async () => {
          if (!user) return;
          setLoading(true);
          try {
            const freshPlants = await getPlants(user.uid);
            setPlants(freshPlants);
            await AsyncStorage.setItem('plants', JSON.stringify(freshPlants));
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: Colors[theme].accent },
            ]}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/plant',
                  params: { id: item.id },
                })
              }
              style={{ flex: 1 }}
            >
              <ThemedText style={{ color: Colors[theme].background }} type="subtitle">{item.nickname}</ThemedText>
              <ThemedText style={{ color: Colors[theme].background }}>{item.species}</ThemedText>
              <ThemedText style={{ color: Colors[theme].background }}>Watering streak: {item.streak}</ThemedText>
            </Pressable>

            <Pressable onPress={() => setSelectedPlant(item)}>
              <ThemedText 
                type="subtitle"
                style={[styles.dots, { color: Colors[theme].text }]}
              >
                ⋮
              </ThemedText>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={{ marginTop: 32 }}>
            No plants found
          </ThemedText>
        }
      />

      <Modal
        transparent
        visible={!!selectedPlant}
        animationType="fade"
        onRequestClose={() => setSelectedPlant(null)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: Colors[theme].tint + '33' }]}
          onPress={() => setSelectedPlant(null)}
        >
          <View
            style={[
              styles.menu,
              { backgroundColor: Colors[theme].background },
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setSelectedPlant(null);
                router.push({
                  pathname: '/edit',
                  params: { id: selectedPlant?.id },
                });
              }}
            >
              <ThemedText>Edit</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.menuItem, styles.delete]}
              onPress={() => {
                setSelectedPlant(null);
                router.push({
                  pathname: '/delete',
                  params: { id: selectedPlant?.id },
                });
              }}
            >
              <ThemedText>Delete</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  search: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  dots: { fontSize: 22, paddingHorizontal: 8 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menu: { width: 200, borderRadius: 12, padding: 8 },
  menuItem: { padding: 12 },
  delete: { borderTopWidth: 1, borderColor: '#eee' },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 48,
    includeFontPadding: false,
  }
});
