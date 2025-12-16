import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider, useTheme } from '@/providers/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function ThemedSafeAreaWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      {children}
    </SafeAreaView>
  );
}

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedSafeAreaWrapper>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" />
            </Stack>
            <ThemedStatusBar />
          </ThemedSafeAreaWrapper>
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
