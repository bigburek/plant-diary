import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { deletePlant } from '@/firebase/firestore/CRUD';
import { useAuth } from '@/providers/AuthProvider';

export default function DeletePlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (!user || !id) return;

    try {
      await deletePlant(user.uid, id);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Delete plant?</ThemedText>
      <ThemedText>
        This action cannot be undone.
      </ThemedText>

      <Pressable style={styles.delete} onPress={handleDelete}>
        <ThemedText type="defaultSemiBold">Yes, delete</ThemedText>
      </Pressable>

      <Pressable style={styles.cancel} onPress={() => router.back()}>
        <ThemedText>Cancel</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  delete: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffb3b3',
    alignItems: 'center',
  },
  cancel: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
