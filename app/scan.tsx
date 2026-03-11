import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Icon from '@/components/icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';

export default function ScanPlantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const C = Colors[theme];

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;

    try {
      console.log('--- QR Code Scanned ---');
      console.log('Raw Data:', data);
      console.log('-----------------------');
      
      const parsed = JSON.parse(data);
      setScanned(true);

      router.push({
        pathname: '/add',
        params: {
          nickname: parsed.nickname,
          species: parsed.species,
          wateringInterval: String(parsed.wateringInterval),
        },
      });
      
      // Reset the scan lock after a brief delay
      setTimeout(() => setScanned(false), 1000);
    } catch {
      console.warn('Invalid QR code');
    }
  };

  // 1. Loading State
  if (hasPermission === null) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text style={{ color: C.textLight }}>Requesting camera permission…</Text>
      </View>
    );
  }

  // 2. Permission Denied State
  if (!hasPermission) {
    return (
      <View style={[styles.center, { backgroundColor: C.background, padding: 20 }]}>
        <Icon name="camera" size={48} color={C.textLight} />
        <Text style={[styles.errorTitle, { color: C.title }]}>No Camera Access</Text>
        <Text style={[styles.errorText, { color: C.textLight }]}>
          Please enable camera permissions in your device settings to scan plant QR codes.
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backButtonDefault, { backgroundColor: C.card }]}>
          <Text style={[styles.backButtonDefaultText, { color: C.text }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // 3. Active Camera State
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />
      
      {/* Dark Translucent Overlay */}
      <View style={styles.overlay}>
        
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#fff" />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        </View>

        {/* Scanner Target Area */}
        <View style={styles.targetContainer}>
          <View style={styles.targetBox}>
            {/* Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            Align QR code within the frame to scan
          </Text>
        </View>

        {/* Bottom padding to push the target box up slightly */}
        <View style={styles.bottomSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  errorText: { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  backButtonDefault: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  backButtonDefaultText: { fontSize: 16, fontWeight: '600' },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  targetContainer: { alignItems: 'center', justifyContent: 'center' },
  targetBox: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: 24,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4CAF50', // A nice green accent for the scanner
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 16 },
  
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomSpacer: { height: 100 },
});