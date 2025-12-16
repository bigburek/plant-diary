import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupNotifications() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const res = await Notifications.requestPermissionsAsync();
    if (res.status !== 'granted') {
      throw new Error('Notification permissions not granted');
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('watering', {
      name: 'Plant watering',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}
