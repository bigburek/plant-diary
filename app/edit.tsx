import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getPlants, updatePlant } from '@/firebase/firestore/CRUD';
import { cancelPlantNotification, schedulePlantNotification } from '@/lib/plantNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { Plant } from '@/types/plant';

export default function EditPlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringInterval, setWateringInterval] = useState('');

  useEffect(() => {
    if (!user || !id) return;

    const loadPlant = async () => {
      const plants = await getPlants(user.uid);
      const found = plants.find(p => p.id === id);
      if (!found) return;

      setPlant(found);
      setNickname(found.nickname);
      setSpecies(found.species);
      setWateringInterval(String(found.wateringInterval));
      setLoading(false);
    };

    loadPlant();
  }, [user, id]);

  const handleSave = async () => {
    if (!user || !id || !plant) return;

    setSaving(true);

    try {
      if (plant.notificationId) {
        await cancelPlantNotification(plant.notificationId);
      }

      const newNotificationId = await schedulePlantNotification(
        id,
        nickname,
        plant.lastWateredAt,
        Number(wateringInterval)
      );

      await updatePlant(user.uid, id, {
        nickname,
        species,
        wateringInterval: Number(wateringInterval),
        notificationId: newNotificationId,
      });

      router.back();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update plant.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <ThemedText style={{ color: Colors[theme].text }}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ThemedText type="title" style={{ color: Colors[theme].text }}>
        Edit Plant 
      </ThemedText>

      <TextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder="Nickname"
        placeholderTextColor={Colors[theme].text + '99'}
        style={[
          styles.input,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].accent,
            color: Colors[theme].text,
          },
        ]}
      />

      <TextInput
        value={species}
        onChangeText={setSpecies}
        placeholder="Species"
        placeholderTextColor={Colors[theme].text + '99'}
        style={[
          styles.input,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].accent,
            color: Colors[theme].text,
          },
        ]}
      />

      <TextInput
        value={wateringInterval}
        onChangeText={setWateringInterval}
        keyboardType="number-pad"
        placeholder="Water every X days"
        placeholderTextColor={Colors[theme].text + '99'}
        style={[
          styles.input,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].accent,
            color: Colors[theme].text,
          },
        ]}
      />

      <Pressable
        style={[styles.button, { backgroundColor: Colors[theme].accent }]}
        onPress={handleSave}
        disabled={saving}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ color: Colors[theme].background }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  button: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
