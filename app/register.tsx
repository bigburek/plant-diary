import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

export default function Register() {
  const { register, user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user]);

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email and password are required');
    setLoading(true);
    try {
      await register(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.title, { color: colors.text }]} type="title">
        Register
      </ThemedText>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.text}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          {
            borderColor: colors.accent,
            color: colors.text,
            backgroundColor: colors.background,
          },
        ]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.text}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[
          styles.input,
          {
            borderColor: colors.accent,
            color: colors.text,
            backgroundColor: colors.background,
          },
        ]}
      />

      <Pressable
        onPress={handleRegister}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.link,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? 'Loading...' : 'Create Account'}
        </ThemedText>
      </Pressable>

      <Link href="/login" style={{ marginTop: 16 }}>
        <ThemedText style={{ color: colors.text }}>
          Already have an account? Login
        </ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 48,
    includeFontPadding: false,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
