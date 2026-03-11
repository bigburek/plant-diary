import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import Icon from '@/components/icon';
import PlantIcon, { variantFromId } from '@/components/plant-icon';
import { Colors } from '@/constants/theme';
import { updatePlant } from '@/firebase/firestore/CRUD';
import {
  cancelPlantNotification,
  schedulePlantNotification,
} from '@/lib/plantNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePlantInStore } from '@/store/plantsSlice';
import { Plant } from '@/types/plant';

export default function PlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const C = Colors[theme];
  const dispatch = useAppDispatch();

  // READ REQUIREMENT: Grab the single plant from Redux instead of refetching from Firebase
  const plant = useAppSelector((state) => 
    state.plants.plants.find((p: Plant) => p.id === id)
  );

  const [watering, setWatering] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleWater = async () => {
    if (!user || !plant || !plant.id) return;
    setWatering(true);
    try {
      if (plant.notificationId) await cancelPlantNotification(plant.notificationId);
      
      const now = Date.now();
      const daysSinceLast = (now - plant.lastWateredAt) / (1000 * 60 * 60 * 24);
      const newStreak = daysSinceLast >= plant.wateringInterval ? plant.streak + 1 : plant.streak;
      const newNotificationId = await schedulePlantNotification(plant.id, plant.nickname, now, plant.wateringInterval);
      
      const updatedData = { 
        lastWateredAt: now, 
        streak: newStreak, 
        notificationId: newNotificationId 
      };

      // 1. Update Backend
      await updatePlant(user.uid, plant.id, updatedData);
      
      // 2. Update Redux (Ensures Home screen & this screen stay in sync)
      dispatch(updatePlantInStore({ id: plant.id, data: updatedData }));
      
    } catch (err) {
      console.error('Failed to water plant', err);
      alert('Failed to water plant.');
    } finally {
      setWatering(false);
    }
  };

  if (!plant) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: C.background }]}>
        <PlantIcon variant="flower" size={64} />
        <Text style={[styles.loadingText, { color: C.text }]}>Plant not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: C.tint }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const nextWaterIn = Math.max(
    0,
    plant.wateringInterval - Math.floor((Date.now() - plant.lastWateredAt) / (1000 * 60 * 60 * 24))
  );

  const qrPayload = JSON.stringify({
    nickname: plant.nickname,
    species: plant.species,
    wateringInterval: plant.wateringInterval,
  });

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {plant.localImageUri ? (
            <Image source={{ uri: plant.localImageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: C.card }]}>
              <PlantIcon variant={variantFromId(plant.id!)} size={160} />
            </View>
          )}
          <Pressable
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
            onPress={() => router.back()}
          >
            <Icon name="chevron-left" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.content, { backgroundColor: C.background }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.plantName, { color: C.title }]}>{plant.nickname}</Text>
            <Pressable
              style={[styles.editButton, { backgroundColor: C.card }]}
              onPress={() => router.push({ pathname: '/edit', params: { id: plant.id } })}
            >
              <Icon name="edit" size={20} color={C.text} />
            </Pressable>
          </View>

          <Text style={[styles.speciesName, { color: C.textLight }]}>{plant.species}</Text>

          <View style={[styles.statsCard, { backgroundColor: C.white }]}>
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Icon name="water" size={24} color={C.tint} />
                <Text style={[styles.statLabel, { color: C.text }]}>Water Interval</Text>
              </View>
              <Text style={[styles.statValue, { color: C.title }]}>{plant.wateringInterval} days</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: C.accent }]} />

            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Icon name="fire" size={24} color="#FF6B6B" />
                <Text style={[styles.statLabel, { color: C.text }]}>Streak</Text>
              </View>
              <Text style={[styles.statValue, { color: C.title }]}>{plant.streak}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: C.accent }]} />

            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Icon name="clock" size={24} color={C.textLight} />
                <Text style={[styles.statLabel, { color: C.text }]}>Next Water</Text>
              </View>
              <Text style={[styles.statValue, { color: C.title }]}>
                  {nextWaterIn === 0 ? 'Today!' : `in ${nextWaterIn} days`}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.waterButton,
                { backgroundColor: C.card, opacity: pressed || watering ? 0.75 : 1 },
              ]}
              onPress={handleWater}
              disabled={watering}
            >
              <Icon name="water" size={20} color={C.title} />
              <Text style={[styles.waterButtonText, { color: C.title }]}>
                {watering ? 'Watering...' : 'Water plant'}
              </Text>
            </Pressable>

            <Pressable onPress={() => setShowQR(true)} style={styles.qrLink}>
              <Icon name="qr" size={18} color={C.textLight} />
              <Text style={[styles.qrLinkText, { color: C.text }]}>Generate QR</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showQR} transparent animationType="fade">
        <Pressable style={styles.qrOverlay} onPress={() => setShowQR(false)}>
          <View style={[styles.qrBox, { backgroundColor: C.white }]}>
            <Text style={[styles.qrTitle, { color: C.title }]}>Share Plant</Text>
            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
              <QRCode value={qrPayload} size={200} />
            </View>
            <Text style={[styles.qrSubtitle, { color: C.textLight }]}>
              Scan to add {plant.nickname} to your collection
            </Text>
            <Pressable style={[styles.closeQrButton, { backgroundColor: C.card }]} onPress={() => setShowQR(false)}>
              <Text style={[styles.closeQrText, { color: C.title }]}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 16 },
  heroContainer: { position: 'relative', height: 300 },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  plantName: { fontSize: 30, fontWeight: '800', flex: 1, letterSpacing: -0.5 },
  editButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  speciesName: { fontSize: 16, marginBottom: 20, fontStyle: 'italic' },
  statsCard: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statLabel: { fontSize: 16, fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '700' },
  divider: { height: 1, opacity: 0.4 },
  waterButton: { marginTop: 20, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  waterButtonText: { fontSize: 16, fontWeight: '700' },
  qrLink: { marginTop: 16, alignItems: 'center', paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  qrLinkText: { fontSize: 15, fontWeight: '500' },
  qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  qrBox: { padding: 28, borderRadius: 20, alignItems: 'center', gap: 16, width: 300 },
  qrTitle: { fontSize: 20, fontWeight: '700' },
  qrSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  closeQrButton: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  closeQrText: { fontSize: 15, fontWeight: '600' },
});