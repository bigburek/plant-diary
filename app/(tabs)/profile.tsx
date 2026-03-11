import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Icon from '@/components/icon';
import PlantIcon from '@/components/plant-icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { useAppSelector } from '@/store/hooks';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const C = Colors[theme];
  const router = useRouter();
  const { plants } = useAppSelector(state => state.plants);

  const totalStreak = plants.reduce((sum, p) => sum + p.streak, 0);
  const plantsNeedingWater = plants.filter(p => {
    const daysSince = (Date.now() - p.lastWateredAt) / (1000 * 60 * 60 * 24);
    return daysSince >= p.wateringInterval;
  }).length;
  const publicPlants = plants.filter(p => !p.isPrivate).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: C.card }]}>
          <PlantIcon variant="succulent" size={72} />
        </View>
        <Text style={[styles.emailText, { color: C.title }]}>{user?.email}</Text>
        <Text style={[styles.memberText, { color: C.textLight }]}>Plant Parent</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: C.card }]}>
          <Text style={[styles.statNumber, { color: C.title }]}>{plants.length}</Text>
          <Text style={[styles.statLabel, { color: C.textLight }]}>Plants</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: C.card }]}>
          <Text style={[styles.statNumber, { color: C.title }]}>{totalStreak}</Text>
          <Text style={[styles.statLabel, { color: C.textLight }]}>Streak</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: C.card }]}>
          <Text style={[styles.statNumber, { color: plantsNeedingWater > 0 ? '#E67E22' : C.title }]}>
            {plantsNeedingWater}
          </Text>
          <Text style={[styles.statLabel, { color: C.textLight }]}>Need Water</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: C.card }]}>
          <Text style={[styles.statNumber, { color: C.title }]}>{publicPlants}</Text>
          <Text style={[styles.statLabel, { color: C.textLight }]}>Public</Text>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: C.textLight }]}>Settings</Text>

      <View style={[styles.settingsCard, { backgroundColor: C.card }]}>
        <Pressable
          style={[styles.settingRow, { borderBottomColor: C.accent + '60' }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingLeft}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} color={C.text} />
            <Text style={[styles.settingLabel, { color: C.text }]}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={C.textLight} />
        </Pressable>

        <Pressable
          style={[styles.settingRow, { borderBottomColor: 'transparent' }]}
          onPress={() => router.push('/notifications-settings')}
        >
          <View style={styles.settingLeft}>
            <Icon name="bell" size={20} color={C.text} />
            <Text style={[styles.settingLabel, { color: C.text }]}>Notifications</Text>
          </View>
          <Icon name="chevron-right" size={24} color={C.textLight} />
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, { backgroundColor: C.card, opacity: pressed ? 0.7 : 1 }]}
        onPress={logout}
      >
        <Text style={[styles.logoutText, { color: C.danger }]}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emailText: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  memberText: { fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  statBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  sectionHeader: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  settingsCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  logoutButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '600' },
});