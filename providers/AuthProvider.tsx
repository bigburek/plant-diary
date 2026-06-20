import { auth } from '@/firebase/config';
import { updatePlant } from '@/firebase/firestore/CRUD';
import {
  cancelPlantNotification,
  schedulePlantNotification,
  setupNotifications,
} from '@/lib/plantNotifications';
import { store } from '@/store';
import * as Notifications from 'expo-notifications';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        try {
          await setupNotifications();
        } catch (err) {
          console.warn('Notifications not enabled:', err);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Handles the "Mark as watered" action button shown directly on the
  // watering reminder notification — works even if the app was backgrounded.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      if (response.actionIdentifier !== 'MARK_WATERED') return;

      const plantId = response.notification.request.content.data?.plantId as string | undefined;
      const currentUser = auth.currentUser;
      if (!plantId || !currentUser) return;

      const plant = store.getState().plants.plants.find((p) => p.id === plantId);
      if (!plant) return;

      try {
        if (plant.notificationId) await cancelPlantNotification(plant.notificationId);
        const now = Date.now();
        const daysSinceLast = (now - plant.lastWateredAt) / (1000 * 60 * 60 * 24);
        const newStreak = daysSinceLast >= plant.wateringInterval ? plant.streak + 1 : plant.streak;
        const newNotificationId = await schedulePlantNotification(
          plant.id,
          plant.nickname,
          now,
          plant.wateringInterval,
          plant.notificationsEnabled ?? true
        );

        await updatePlant(currentUser.uid, plant.id, {
          lastWateredAt: now,
          streak: newStreak,
          notificationId: newNotificationId,
        });
      } catch (err) {
        console.warn('Failed to mark plant as watered from notification:', err);
      }
    });

    return () => subscription.remove();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
