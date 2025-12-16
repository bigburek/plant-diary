import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/AuthProvider';

export default function ScanPlantScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Requesting camera permission…</ThemedText>
      </ThemedView>
    );
  }

  if (!hasPermission) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No access to camera</ThemedText>
      </ThemedView>
    );
  }

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
      setTimeout(() => setScanned(false), 1000);
    } catch {
      console.warn('Invalid QR code');
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
