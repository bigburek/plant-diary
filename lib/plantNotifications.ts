import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


const DAY = 1000 * 60 * 60 * 24;

export async function setupNotifications() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const res = await Notifications.requestPermissionsAsync();
    if (res.status !== 'granted') {
      throw new Error('Notifications not granted');
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('watering', {
      name: 'Plant Watering',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}


export async function schedulePlantNotification(
  plantId: string,
  nickname: string,
  lastWateredAt: number,
  wateringInterval: number
): Promise<string> {

    const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
        title: `💧 Water your plant!`,
        body: `${nickname} needs watering today.`,
        sound: true,
    },
    trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: wateringInterval * 24 * 60 * 60,
        repeats: true,
    },
    });

  return notificationId;
}


export async function cancelPlantNotification(notificationId?: string) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
