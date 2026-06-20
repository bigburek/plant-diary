import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';

import Icon from '@/components/icon';
import { Colors } from '@/constants/theme';
import { identifyPlantFromImage, PlantIdentificationResult, PlantIdentifyError } from '@/lib/plantIdentify';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { AppDispatch } from '@/store';
import { addPlant } from '@/store/plantsSlice';

export default function AddPlantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const C = Colors[theme];
  const dispatch = useDispatch<AppDispatch>();

  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringInterval, setWateringInterval] = useState('5');
  const [instructions, setInstructions] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<PlantIdentificationResult | null>(null);

  useEffect(() => {
    if (params.nickname) setNickname(params.nickname as string);
    if (params.species) setSpecies(params.species as string);
    if (params.wateringInterval) setWateringInterval(params.wateringInterval as string);
  }, [params]);

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { alert('Please allow access to your photo library.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!r.canceled) { setImageUri(r.assets[0].uri); setIdentifyResult(null); }
  };

  const takePhoto = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { alert('Please allow camera access.'); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!r.canceled) { setImageUri(r.assets[0].uri); setIdentifyResult(null); }
  };

  const handleIdentify = async () => {
    if (!imageUri) { alert('Add a photo first, then tap Identify with AI.'); return; }
    setIdentifying(true);
    setIdentifyResult(null);
    try {
      const result = await identifyPlantFromImage(imageUri);

      if (!result.isPlant) {
        alert("Hmm, that doesn't look like a plant. Try a clearer, closer photo.");
        return;
      }

      setIdentifyResult(result);
      if (!nickname.trim()) setNickname(result.commonName || result.scientificName);
      setSpecies(result.scientificName || result.commonName);
      if (result.wateringIntervalDays) setWateringInterval(String(result.wateringIntervalDays));
      if (!instructions.trim()) {
        const combined = [result.sunlight, result.careTips].filter(Boolean).join('. ');
        if (combined) setInstructions(combined);
      }
    } catch (err) {
      if (err instanceof PlantIdentifyError && err.code === 'NO_API_KEY') {
        alert('AI identification needs a free Gemini API key. Get one at aistudio.google.com/apikey and add it as GEMINI_API_KEY in your .env file.');
      } else {
        console.error('Plant identification failed', err);
        alert('Could not identify this plant right now. You can still fill in the details manually.');
      }
    } finally {
      setIdentifying(false);
    }
  };

  const handleAddPlant = async () => {
    if (!user || !nickname.trim() || !species.trim()) { alert('Please fill in plant name and species.'); return; }
    setLoading(true);
    try {
      const parsedInterval = parseInt(wateringInterval, 10);
      const safeInterval = isNaN(parsedInterval) || parsedInterval <= 0 ? 5 : parsedInterval;

      await dispatch(addPlant({
        userId: user.uid,
        plantData: {
          nickname: nickname.trim(),
          species: species.trim(),
          wateringInterval: safeInterval,
          lastWateredAt: Date.now(),
          streak: 0,
          createdAt: Date.now(),
          userId: user.uid,
          notificationId: '',
          isPrivate,
          localImageUri: imageUri ?? '',
          instructions: instructions.trim(),
          notificationsEnabled,
        },
      }));

      setNickname(''); setSpecies(''); setWateringInterval('5'); setInstructions('');
      setIsPrivate(false); setNotificationsEnabled(true); setImageUri(null); setIdentifyResult(null);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save plant', error);
      alert('Failed to save plant. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: C.background }]} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: C.title }]}>Add Plant</Text>

      <Pressable onPress={pickImage} style={[styles.imagePicker, { backgroundColor: C.card }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={36} color={C.textLight} strokeWidth={1.5} />
            <Text style={[styles.imagePickerLabel, { color: C.textLight }]}>Tap to add photo</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.imageButtons}>
        <Pressable style={[styles.imageBtn, { backgroundColor: C.card }]} onPress={pickImage}>
          <Icon name="image" size={16} color={C.text} strokeWidth={2} />
          <Text style={[styles.imageBtnText, { color: C.text }]}>Gallery</Text>
        </Pressable>
        <Pressable style={[styles.imageBtn, { backgroundColor: C.card }]} onPress={takePhoto}>
          <Icon name="camera" size={16} color={C.text} strokeWidth={2} />
          <Text style={[styles.imageBtnText, { color: C.text }]}>Camera</Text>
        </Pressable>
      </View>

      {imageUri && (
        <Pressable
          style={[styles.identifyButton, { backgroundColor: C.tint, opacity: identifying ? 0.7 : 1 }]}
          onPress={handleIdentify}
          disabled={identifying}
        >
          {identifying ? (
            <ActivityIndicator size="small" color={C.background} />
          ) : (
            <Icon name="sparkle" size={16} color={C.background} strokeWidth={2} />
          )}
          <Text style={[styles.identifyButtonText, { color: C.background }]}>
            {identifying ? 'Identifying…' : 'Identify with AI'}
          </Text>
        </Pressable>
      )}

      {identifyResult && (
        <View style={[styles.identifyCard, { backgroundColor: C.card, borderColor: C.tint }]}>
          <View style={styles.identifyCardHeader}>
            <Icon name="sparkle" size={16} color={C.title} strokeWidth={2} />
            <Text style={[styles.identifyCardTitle, { color: C.title }]}>
              {identifyResult.commonName || identifyResult.scientificName}
            </Text>
            <Pressable onPress={() => setIdentifyResult(null)} hitSlop={8}>
              <Icon name="x" size={16} color={C.textLight} />
            </Pressable>
          </View>
          <Text style={[styles.identifyCardSub, { color: C.textLight }]}>
            {identifyResult.scientificName} · {identifyResult.confidence}% confidence
          </Text>
          {!!identifyResult.sunlight && (
            <Text style={[styles.identifyCardLine, { color: C.text }]}>☀ {identifyResult.sunlight}</Text>
          )}
          {!!identifyResult.careTips && (
            <Text style={[styles.identifyCardLine, { color: C.text }]}>{identifyResult.careTips}</Text>
          )}
          <Text style={[styles.identifyCardNote, { color: C.textLight }]}>
            Filled in below — feel free to edit before saving.
          </Text>
        </View>
      )}

      <Text style={[styles.label, { color: C.textLight }]}>Plant nickname</Text>
      <TextInput placeholder="e.g. My Monstera" placeholderTextColor={C.textLight} value={nickname} onChangeText={setNickname} style={[styles.input, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]} />

      <Text style={[styles.label, { color: C.textLight }]}>Species</Text>
      <TextInput placeholder="e.g. Monstera deliciosa" placeholderTextColor={C.textLight} value={species} onChangeText={setSpecies} style={[styles.input, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]} />

      <Text style={[styles.label, { color: C.textLight }]}>Water every (days)</Text>
      <TextInput placeholder="5" placeholderTextColor={C.textLight} keyboardType="number-pad" value={wateringInterval} onChangeText={(t) => setWateringInterval(t.replace(/[^0-9]/g, ''))} style={[styles.input, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]} />

      <View style={styles.labelRow}>
        <Icon name="notes" size={14} color={C.textLight} />
        <Text style={[styles.label, { color: C.textLight, marginBottom: 0 }]}>Care instructions</Text>
      </View>
      <TextInput
        placeholder="e.g. Bright indirect light. Let soil dry between waterings."
        placeholderTextColor={C.textLight}
        value={instructions}
        onChangeText={setInstructions}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea, { borderColor: C.tint, color: C.text, backgroundColor: C.background }]}
      />
      <Text style={[styles.helperText, { color: C.textLight }]}>
        Filled in automatically by "Identify with AI" — feel free to write your own instead.
      </Text>

      {/* 3-Column Strict Grid Architecture for Rows */}
      
      {/* Row 1: Public/Private */}
      <View style={[styles.gridRow, { backgroundColor: C.card }]}>
        <View style={styles.colIcon}>
          <View style={[styles.toggleIconBox, { backgroundColor: C.accent }]}>
            <Icon name={isPrivate ? 'lock' : 'globe'} size={16} color={C.title} strokeWidth={2} />
          </View>
        </View>
        
        <View style={styles.colText}>
          <Text style={[styles.toggleLabel, { color: C.text }]}>{isPrivate ? 'Private' : 'Public'}</Text>
          <Text style={[styles.toggleSub, { color: C.textLight }]}>
            {isPrivate ? 'Only you can see this plant' : 'Visible to others in Explore'}
          </Text>
        </View>
        
        <View style={styles.colSwitch}>
          <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ false: C.accent, true: C.tint }} thumbColor={C.background} />
        </View>
      </View>

      {/* Row 2: Watering Reminders */}
      <View style={[styles.gridRow, { backgroundColor: C.card }]}>
        <View style={styles.colIcon}>
          <View style={[styles.toggleIconBox, { backgroundColor: C.accent }]}>
            <Icon name="bell" size={16} color={C.title} strokeWidth={2} />
          </View>
        </View>
        
        <View style={styles.colText}>
          <Text style={[styles.toggleLabel, { color: C.text }]}>Watering reminders</Text>
          <Text style={[styles.toggleSub, { color: C.textLight }]}>
            {notificationsEnabled 
              ? "You'll get a notification when it's time to water" 
              : "No reminders for this plant"}
          </Text>
        </View>
        
        <View style={styles.colSwitch}>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: C.accent, true: C.tint }} thumbColor={C.background} />
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.saveButton, { backgroundColor: C.card, opacity: pressed || loading ? 0.7 : 1 }]} onPress={handleAddPlant} disabled={loading}>
        <Icon name={loading ? 'clock' : 'seedling'} size={18} color={C.title} strokeWidth={2} />
        <Text style={[styles.saveButtonText, { color: C.title }]}>{loading ? 'Saving...' : 'Save Plant'}</Text>
      </Pressable>

      <Pressable style={[styles.scanButton, { borderColor: C.tint }]} onPress={() => router.push('/scan')}>
        <Icon name="qr" size={18} color={C.text} strokeWidth={2} />
        <Text style={[styles.scanButtonText, { color: C.text }]}>Scan QR Code</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 20, gap: 10, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  imagePicker: { borderRadius: 16, overflow: 'hidden', height: 200 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerLabel: { fontSize: 14, fontWeight: '500' },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imageBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  imageBtnText: { fontSize: 14, fontWeight: '600' },
  identifyButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 2 },
  identifyButtonText: { fontSize: 14, fontWeight: '700' },
  identifyCard: { borderWidth: 1.5, borderRadius: 14, padding: 14, gap: 4, marginTop: 2 },
  identifyCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  identifyCardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  identifyCardSub: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  identifyCardLine: { fontSize: 13, lineHeight: 18 },
  identifyCardNote: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: -4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 15 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  helperText: { fontSize: 11, fontStyle: 'italic', marginTop: -4 },
  
  // FIXED GRID STRUCTURING SYSTEM
  gridRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 14, 
    marginTop: 4,
    width: '100%',
  },
  colIcon: {
    width: '12%', // Locks item down tightly on left side
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  colText: {
    width: '68%', // Restricts total running text width footprint explicitly 
    paddingRight: 8,
    justifyContent: 'center',
  },
  colSwitch: {
    width: '20%', // Locks the switch securely inside the component box on the right
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  toggleIconBox: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  toggleSub: { fontSize: 12 },
  
  saveButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '700' },
  scanButton: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  scanButtonText: { fontSize: 15, fontWeight: '600' },
});
