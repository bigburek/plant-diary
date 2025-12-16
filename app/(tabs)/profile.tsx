import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { Button, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { toggleTheme, theme } = useTheme(); 

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText>Email: {user?.email}</ThemedText>

      <Button color={Colors[theme].accent} title="Logout" onPress={logout} />

      <Button
        color={Colors[theme].accent}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        onPress={toggleTheme}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
});
