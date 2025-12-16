import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { db } from '@/firebase/config';
import { createPlant } from '@/firebase/firestore/CRUD';
import { schedulePlantNotification } from '@/lib/plantNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';

export default function AddPlantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringInterval, setWateringInterval] = useState('5');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (params.nickname) setNickname(params.nickname as string);
    if (params.species) setSpecies(params.species as string);
    if (params.wateringInterval) setWateringInterval(params.wateringInterval as string);
  }, [params]);

  const handleAddPlant = async () => {
    if (!user || !nickname || !species) return;
    setLoading(true);

    try {
      const docRef = await createPlant(user.uid, {
        nickname,
        species,
        wateringInterval: Number(wateringInterval),
        lastWateredAt: Date.now(),
        streak: 0,
        createdAt: Date.now(),
        userId: user.uid,
        notificationId: '',
      });

      const notificationId = await schedulePlantNotification(
        docRef.id,
        nickname,
        Date.now(),
        Number(wateringInterval)
      );

      await updateDoc(doc(db, 'users', user.uid, 'plants', docRef.id), {
        notificationId,
      });

      router.back();
    } catch (error) {
      console.error('Failed to save plant', error);
      alert('Failed to save plant. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Add Plant</ThemedText>

      <TextInput
        placeholder="Plant nickname"
        placeholderTextColor={Colors[theme].text}
        value={nickname}
        onChangeText={setNickname}
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
        placeholder="Species (e.g. Monstera deliciosa)"
        placeholderTextColor={Colors[theme].text}
        value={species}
        onChangeText={setSpecies}
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
        placeholder="Water every X days"
        placeholderTextColor={Colors[theme].text}
        keyboardType="number-pad"
        value={wateringInterval}
        onChangeText={setWateringInterval}
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
        onPress={handleAddPlant}
        disabled={loading}
      >
        <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].background }}>
          {loading ? 'Saving...' : 'Save Plant'}
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: Colors[theme].accent

         }]}
        onPress={() => router.push('/scan')}
        disabled={loading}
      >
        <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].background }}>
          Scan QR Code
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  button: { marginTop: 12, padding: 14, borderRadius: 8, alignItems: 'center' },
});
