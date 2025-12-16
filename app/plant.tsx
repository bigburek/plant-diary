import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getPlants, updatePlant } from '@/firebase/firestore/CRUD';
import {
  cancelPlantNotification,
  schedulePlantNotification,
} from '@/lib/plantNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { Plant } from '@/types/plant';

export default function PlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [watering, setWatering] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const loadPlant = async () => {
      const plants = await getPlants(user.uid);
      const found = plants.find(p => p.id === id);
      if (!found) return;

      setPlant(found);
      setLoading(false);
    };

    loadPlant();
  }, [user, id]);

  const handleWater = async () => {
    if (!user || !plant) return;

    setWatering(true);

    try {
      if (plant.notificationId) {
        await cancelPlantNotification(plant.notificationId);
      }

      const now = Date.now();
      const daysSinceLastWater =
        (now - plant.lastWateredAt) / (1000 * 60 * 60 * 24);

      const newStreak =
        daysSinceLastWater >= plant.wateringInterval
          ? plant.streak + 1
          : plant.streak;

      const newNotificationId = await schedulePlantNotification(
        plant.id,
        plant.nickname,
        now,
        plant.wateringInterval
      );

      await updatePlant(user.uid, plant.id, {
        lastWateredAt: now,
        streak: newStreak,
        notificationId: newNotificationId,
      });

      setPlant({
        ...plant,
        lastWateredAt: now,
        streak: newStreak,
        notificationId: newNotificationId,
      });
    } catch (err) {
      console.error('Failed to water plant', err);
      alert('Failed to water plant.');
    } finally {
      setWatering(false);
    }
  };

  if (loading || !plant) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <ThemedText style={{ color: Colors[theme].text }}>Loading plant...</ThemedText>
      </ThemedView>
    );
  }

  const nextWaterIn = Math.max(
    0,
    plant.wateringInterval -
      Math.floor((Date.now() - plant.lastWateredAt) / (1000 * 60 * 60 * 24))
  );

  const qrPayload = JSON.stringify({
    nickname: plant.nickname,
    species: plant.species,
    wateringInterval: plant.wateringInterval,
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ThemedText type="title" style={{ color: Colors[theme].text }}>{plant.nickname}</ThemedText>

      <ThemedText style={{ color: Colors[theme].text }}>Species: {plant.species}</ThemedText>
      <ThemedText style={{ color: Colors[theme].text }}>Water every: {plant.wateringInterval} days</ThemedText>
      <ThemedText style={{ color: Colors[theme].text }}>Streak: {plant.streak}</ThemedText>
      <ThemedText style={{ color: Colors[theme].text }}>Next watering in: {nextWaterIn} days</ThemedText>

      <Pressable
        style={[styles.button, { backgroundColor: Colors[theme].accent }]}
        onPress={handleWater}
        disabled={watering}
      >
        <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].background }}>
          {watering ? 'Watering...' : 'Water plant'}
        </ThemedText>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() =>
          router.push({
            pathname: '/edit',
            params: { id: plant.id },
          })
        }
      >
        <ThemedText style={{ color: Colors[theme].text }}>Edit plant</ThemedText>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => setShowQR(true)}
      >
        <ThemedText style={{ color: Colors[theme].text }}>Generate QR</ThemedText>
      </Pressable>

      <Modal visible={showQR} transparent animationType="fade">
        <ThemedView style={styles.qrOverlay}>
          <ThemedView style={[styles.qrBox, { backgroundColor: Colors[theme].background }]}>
            <QRCode value={qrPayload} size={220} />
            <Pressable onPress={() => setShowQR(false)}>
              <ThemedText style={{ marginTop: 12, color: Colors[theme].text }}>Close</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  button: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondary: {
    padding: 12,
    alignItems: 'center',
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
});
