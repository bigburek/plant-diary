import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import Icon from '@/components/icon';
import PlantIcon from '@/components/plant-icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { AppDispatch } from '@/store';
import { removePlant } from '@/store/plantsSlice';


export default function DeleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const C = Colors[theme];
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
  
      await dispatch(removePlant({ userId: user.uid, plantId: id }));
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to delete plant', err);
      alert('Failed to delete plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <PlantIcon variant="fern" size={80} />
      <Text style={[styles.title, { color: C.title }]}>Delete Plant?</Text>
      <Text style={[styles.body, { color: C.textLight }]}>
        This action cannot be undone. Your plant and all its data will be permanently removed.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.deleteButton, { backgroundColor: C.danger, opacity: pressed || loading ? 0.75 : 1 }]}
        onPress={handleDelete}
        disabled={loading}
      >
        {!loading && <Icon name="trash" size={20} color="#fff" />}
        <Text style={styles.deleteButtonText}>{loading ? 'Deleting...' : 'Yes, delete plant'}</Text>
      </Pressable>
      <Pressable style={[styles.cancelButton, { backgroundColor: C.card }]} onPress={() => router.back()}>
        <Text style={[styles.cancelText, { color: C.title }]}>Keep plant</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  deleteButton: { width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: { width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600' },
});
