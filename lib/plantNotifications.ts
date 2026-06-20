/**
 * Plant watering notifications.
 *
 * These are LOCAL notifications scheduled directly on-device via expo-notifications.
 * They work fully offline, even when the app is closed/killed, and are 100% free
 * with no server, no Firebase Cloud Functions, and no credit card needed.
 *
 * True remote "push" notifications (sent from a server while the app isn't running,
 * e.g. via Firebase Cloud Messaging) would need a backend that can trigger sends.
 * Firebase Cloud Functions requires the paid Blaze plan to even deploy (a card on
 * file, even if usage stays free), which breaks the "fully free, no card" goal.
 * Since watering reminders are purely time-based, local notifications are the
 * right tool here and need none of that infrastructure.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const DAY = 1000 * 60 * 60 * 24;
const WATERING_CATEGORY = 'watering-reminder';
const REMINDER_TIME_KEY = 'plant-diary:reminder-time';

export type ReminderTime = { hour: number; minute: number };
const DEFAULT_REMINDER_TIME: ReminderTime = { hour: 9, minute: 0 };

// Show notifications as a banner (with sound) even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

  await registerWateringCategory();
}

/**
 * Registers a "Mark as watered" action button that appears directly on the
 * notification, so the person can log a watering without opening the app.
 */
export async function registerWateringCategory() {
  await Notifications.setNotificationCategoryAsync(WATERING_CATEGORY, [
    {
      identifier: 'MARK_WATERED',
      buttonTitle: '✓ Mark as watered',
      options: { opensAppToForeground: false },
    },
  ]);
}

export { WATERING_CATEGORY };

/** Reads the person's preferred daily reminder time (defaults to 9:00 AM). */
export async function getReminderTime(): Promise<ReminderTime> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_TIME_KEY);
    if (!raw) return DEFAULT_REMINDER_TIME;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.hour === 'number' && typeof parsed?.minute === 'number') {
      return parsed;
    }
    return DEFAULT_REMINDER_TIME;
  } catch {
    return DEFAULT_REMINDER_TIME;
  }
}

export async function setReminderTime(time: ReminderTime) {
  await AsyncStorage.setItem(REMINDER_TIME_KEY, JSON.stringify(time));
}

/**
 * Schedules (or skips) the watering reminder for a plant.
 *
 * Unlike a naive "repeat every N days from right now" timer — which causes
 * reminders to drift to whatever random time of day a plant happened to be
 * watered/added — this anchors every reminder to the person's chosen daily
 * reminder time, so notifications always arrive at a predictable hour.
 */
export async function schedulePlantNotification(
  plantId: string,
  nickname: string,
  lastWateredAt: number,
  wateringIntervalDays: number,
  notificationsEnabled: boolean = true
): Promise<string> {
  if (!notificationsEnabled) return '';

  const { hour, minute } = await getReminderTime();

  const dueDate = new Date(lastWateredAt + wateringIntervalDays * DAY);
  dueDate.setHours(hour, minute, 0, 0);

  // If the computed due-time has already passed (e.g. plant is overdue),
  // fire soon instead of scheduling something in the past.
  const fireDate = dueDate.getTime() > Date.now() ? dueDate : new Date(Date.now() + 60 * 1000);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Water your plant!',
      body: `${nickname} needs watering today.`,
      sound: true,
      data: { plantId },
      categoryIdentifier: WATERING_CATEGORY,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
      channelId: 'watering',
    },
  });

  return notificationId;
}

export async function cancelPlantNotification(notificationId?: string) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired/cancelled — nothing to do.
  }
}
