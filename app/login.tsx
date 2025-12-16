import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

export default function Login() {
  const { login, user } = useAuth();
  const { theme, colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert('Error', 'Email and password are required');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ThemedText
        style={[styles.title, { color: colors.text }]}
        type="title"
      >
        Login
      </ThemedText>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.text}
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          {
            borderColor: colors.accent,
            color: colors.text,
            backgroundColor: colors.background,
          },
        ]}
        keyboardType="email-address"
        autoCapitalize="none"
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
      onPress={handleLogin}
      disabled={loading}
      style={({ pressed }) => [
        {
          backgroundColor: colors.link,
          opacity: pressed ? 0.7 : 1,   
        },
        styles.button,
      ]}
    >
      <ThemedText style={styles.buttonText}>
        {loading ? 'Loading...' : 'Login'}
      </ThemedText>
    </Pressable>

      <Link href="/register" style={{ marginTop: 16 }}>
        <ThemedText style={{ color: colors.text }}>
          Don't have an account? Register
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
  color: '#fff', // or colors.text if you want dynamic contrast
  fontWeight: 'bold',
  fontSize: 16,
},

});
