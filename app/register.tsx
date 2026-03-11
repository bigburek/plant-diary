import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import PlantIcon from '@/components/plant-icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';

export default function Register() {
  const { register, user } = useAuth();
  const { theme } = useTheme();
  const C = Colors[theme];
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
    <View style={[styles.container, { backgroundColor: C.background }]}>
      
      <View style={styles.header}>
        <PlantIcon variant="monstera" size={80} />
        <Text style={[styles.title, { color: C.title }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: C.textLight }]}>Join the plant parent club!</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: C.textLight }]}>Email Address</Text>
        <TextInput
          placeholder="plantlover@example.com"
          placeholderTextColor={C.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            { borderColor: C.tint, color: C.text, backgroundColor: C.background },
          ]}
        />

        <Text style={[styles.label, { color: C.textLight }]}>Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor={C.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[
            styles.input,
            { borderColor: C.tint, color: C.text, backgroundColor: C.background },
          ]}
        />

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: C.tint, opacity: pressed || loading ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: C.textLight }]}>Already have an account? </Text>
        <Pressable onPress={() => router.replace('/login')}>
          <Text style={[styles.footerLink, { color: C.tint }]}>Log In</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40, gap: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 16 },
  form: { gap: 12 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 8 },
  button: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: '700' },
});