import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Icon from '@/components/icon';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeContext';
import { useAppSelector } from '@/store/hooks';

interface ScheduledNotif {
  id: string;
  title: string;
  body: string;
  trigger: any;
}

export default function NotificationsSettingsScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];
  const router = useRouter();
  const { plants } = useAppSelector(state => state.plants);

  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledNotif[]>([]);
  const [loading, setLoading] = useState(true);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  const loadScheduled = async () => {
    try {
      const all = await Notifications.getAllScheduledNotificationsAsync();
      setScheduled(
        all.map(n => ({
          id: n.identifier,
          title: n.content.title ?? '',
          body: n.content.body ?? '',
          trigger: n.trigger,
        }))
      );
    } catch (err) {
      console.error('Failed to load scheduled notifications', err);
    }
  };

  useEffect(() => {
    (async () => {
      await checkPermissions();
      await loadScheduled();
      setLoading(false);
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionGranted(status === 'granted');
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Go to device Settings → Notifications → Plant Diary and enable notifications.');
    }
  };

  const cancelNotification = async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    setScheduled(prev => prev.filter(n => n.id !== id));
  };

  const cancelAll = async () => {
    Alert.alert('Cancel all notifications?', 'All plant watering reminders will be removed.', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel all', style: 'destructive', onPress: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setScheduled([]);
      }},
    ]);
  };

  const plantsByNotifId = new Map(
    plants.filter(p => p.notificationId).map(p => [p.notificationId!, p.nickname])
  );

  const getTriggerLabel = (trigger: any): string => {
    if (!trigger) return 'Unknown';
    if (trigger.seconds) {
      const days = Math.round(trigger.seconds / 86400);
      return `Every ${days} day${days !== 1 ? 's' : ''}`;
    }
    return 'Scheduled';
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: C.background }]} contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Icon name="chevron-left" size={20} color={C.text} />
        <Text style={[styles.backBtnText, { color: C.text }]}>Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: C.title }]}>Notifications</Text>

      <View style={[styles.card, { backgroundColor: C.card }]}>
        <View style={styles.cardRow}>
          <View style={styles.cardTextContainer}>
            <View style={styles.cardHeader}>
              <Icon name="bell" size={18} color={C.text} />
              <Text style={[styles.cardTitle, { color: C.text }]}>Push Notifications</Text>
            </View>
            <Text style={[styles.cardSub, { color: C.textLight }]}>
              {permissionGranted ? 'Watering reminders are enabled' : 'Enable to get watering reminders'}
            </Text>
          </View>
          {permissionGranted === null ? (
            <ActivityIndicator color={C.tint} />
          ) : (
            <Switch
              value={permissionGranted}
              onValueChange={v => {
                if (v) requestPermission();
                else Alert.alert('To disable', 'Go to device Settings → Notifications → Plant Diary');
              }}
              trackColor={{ false: C.accent, true: C.tint }}
              thumbColor={C.background}
            />
          )}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: C.textLight }]}>
          Scheduled reminders ({scheduled.length})
        </Text>
        {scheduled.length > 0 && (
          <Pressable onPress={cancelAll}>
            <Text style={[styles.cancelAllText, { color: C.danger }]}>Cancel all</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={C.tint} style={{ marginTop: 20 }} />
      ) : scheduled.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: C.card }]}>
          <Icon name="bell" size={48} color={C.textLight} />
          <Text style={[styles.emptyTitle, { color: C.title }]}>No reminders scheduled</Text>
          <Text style={[styles.emptySub, { color: C.textLight }]}>
            Reminders are set automatically when you add or water a plant.
          </Text>
        </View>
      ) : (
        scheduled.map(notif => {
          const plantName = plantsByNotifId.get(notif.id);
          return (
            <View key={notif.id} style={[styles.notifRow, { backgroundColor: C.card }]}>
              <View style={[styles.notifIcon, { backgroundColor: C.background }]}>
                <Icon name="water" size={20} color={C.tint} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, { color: C.text }]}>
                  {plantName ?? notif.title ?? 'Plant reminder'}
                </Text>
                <Text style={[styles.notifSub, { color: C.textLight }]}>
                  {getTriggerLabel(notif.trigger)}
                </Text>
              </View>
              <Pressable
                onPress={() => cancelNotification(notif.id)}
                style={[styles.cancelBtn, { backgroundColor: C.background }]}
              >
                <Icon name="x" size={16} color={C.danger} />
              </Pressable>
            </View>
          );
        })
      )}

      <View style={[styles.infoBox, { backgroundColor: C.card }]}>
        <Icon name="leaf" size={24} color={C.tint} />
        <Text style={[styles.infoText, { color: C.textLight }]}>
          Notifications are scheduled automatically when you add a plant or tap "Water plant".
          They repeat based on each plant's watering interval.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 20, gap: 12, paddingBottom: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  backBtnText: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  card: { borderRadius: 14, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTextContainer: { flex: 1, paddingRight: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cancelAllText: { fontSize: 13, fontWeight: '600' },
  emptyCard: { borderRadius: 14, padding: 32, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  notifRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  notifSub: { fontSize: 13 },
  cancelBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoBox: { borderRadius: 14, padding: 16, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
});