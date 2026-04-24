import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import Icon from '@/components/icon';
import { Colors } from '@/constants/theme';
import { updatePlant } from '@/firebase/firestore/CRUD';
import { cancelPlantNotification, schedulePlantNotification } from '@/lib/plantNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { useAppSelector } from '@/store/hooks';
import { Plant } from '@/types/plant';

export default function EditPlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const C = Colors[theme];

  const plantFromStore = useAppSelector((state) =>
    state.plants.plants.find((p: Plant) => p.id === id)
  );

  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringInterval, setWateringInterval] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (plantFromStore) {
      setNickname(plantFromStore.nickname);
      setSpecies(plantFromStore.species);
      setWateringInterval(String(plantFromStore.wateringInterval));
      setIsPrivate(plantFromStore.isPrivate ?? false);
      setImageUri(plantFromStore.localImageUri ?? null);
    }
  }, [plantFromStore]);

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { alert('Please allow photo library access.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!r.canceled) setImageUri(r.assets[0].uri);
  };

  const takePhoto = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { alert('Please allow camera access.'); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!r.canceled) setImageUri(r.assets[0].uri);
  };

  const handleSave = async () => {
    if (!user || !id || !plantFromStore) return;
    setSaving(true);
    try {
      if (plantFromStore.notificationId) await cancelPlantNotification(plantFromStore.notificationId);
      const newNotificationId = await schedulePlantNotification(id, nickname, plantFromStore.lastWateredAt, Number(wateringInterval));

      await updatePlant(user.uid, id, {
        nickname: nickname.trim(),
        species: species.trim(),
        wateringInterval: Number(wateringInterval),
        notificationId: newNotificationId,
        isPrivate,
        localImageUri: imageUri ?? '',
      });

      router.back();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update plant.');
    } finally {
      setSaving(false);
    }
  };

  if (!plantFromStore) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: C.background }]}>
        <Text style={{ color: C.text }}>Plant not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.root, { backgroundColor: C.background }]} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Icon name="chevron-left" size={20} color={C.text} />
        <Text style={[styles.backBtnText, { color: C.text }]}>Back</Text>
      </Pressable>
      <Text style={[styles.title, { color: C.title }]}>Edit Plant</Text>

      <Pressable onPress={pickImage} style={[styles.imagePicker, { backgroundColor: C.card }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={40} color={C.textLight} />
            <Text style={[styles.imagePickerLabel, { color: C.textLight }]}>Tap to add photo</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.imageButtons}>
        <Pressable style={[styles.imageBtn, { backgroundColor: C.card }]} onPress={pickImage}>
          <Icon name="image" size={16} color={C.text} /><Text style={[styles.imageBtnText, { color: C.text }]}>Gallery</Text>
        </Pressable>
        <Pressable style={[styles.imageBtn, { backgroundColor: C.card }]} onPress={takePhoto}>
          <Icon name="camera" size={16} color={C.text} /><Text style={[styles.imageBtnText, { color: C.text }]}>Camera</Text>
        </Pressable>
        {imageUri && (
          <Pressable style={[styles.imageBtn, { backgroundColor: C.card }]} onPress={() => setImageUri(null)}>
            <Icon name="trash" size={16} color={C.danger} /><Text style={[styles.imageBtnText, { color: C.danger }]}>Remove</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.label, { color: C.textLight }]}>Plant nickname</Text>
      <TextInput value={nickname} onChangeText={setNickname} placeholder="Nickname" placeholderTextColor={C.textLight} style={[styles.input, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]} />

      <Text style={[styles.label, { color: C.textLight }]}>Species</Text>
      <TextInput value={species} onChangeText={setSpecies} placeholder="Species" placeholderTextColor={C.textLight} style={[styles.input, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]} />

      <Text style={[styles.label, { color: C.textLight }]}>Water every (days)</Text>
      <TextInput value={wateringInterval} onChangeText={setWateringInterval} keyboardType="number-pad" placeholder="Days" placeholderTextColor={C.textLight} style={[styles.input, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]} />

      <View style={[styles.toggleRow, { backgroundColor: C.card }]}>
        <View style={styles.toggleTextContainer}>
          <View style={styles.toggleHeader}>
            <Icon name={isPrivate ? 'lock' : 'globe'} size={16} color={C.text} />
            <Text style={[styles.toggleLabel, { color: C.text }]}>{isPrivate ? 'Private' : 'Public'}</Text>
          </View>
          <Text style={[styles.toggleSub, { color: C.textLight }]}>{isPrivate ? 'Only you can see this plant' : 'Visible to others in Explore'}</Text>
        </View>
        <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ false: C.accent, true: C.tint }} thumbColor={C.background} />
      </View>

      <Pressable style={({ pressed }) => [styles.saveButton, { backgroundColor: C.card, opacity: pressed || saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving}>
        {!saving && <Icon name="check" size={20} color={C.title} />}
        <Text style={[styles.saveButtonText, { color: C.title }]}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, gap: 10, paddingBottom: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  backBtnText: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  imagePicker: { borderRadius: 16, overflow: 'hidden', height: 200 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerLabel: { fontSize: 14, fontWeight: '500' },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imageBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  imageBtnText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: -4 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 15 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, marginTop: 4 },
  toggleTextContainer: { flex: 1, paddingRight: 10 },
  toggleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleSub: { fontSize: 12 },
  saveButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '700' },
});
