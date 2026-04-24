import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { auth, db } from '@/firebase/config';
import { Plant } from '@/types/plant';

export const getAllPlants = (callback: (plants: Plant[]) => void) => {
  const uid = auth.currentUser!.uid;
  const q = query(
    collection(db, 'users', uid, 'plants'),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data: Plant[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Plant, 'id'>),
    }));
    callback(data);
  });

  return unsubscribe;
};

// CREATE
export const createPlant = async (userId: string, data: Omit<Plant, 'id'>) => {
  const ref = collection(db, 'users', userId, 'plants');
  return await addDoc(ref, data);
};

// UPDATE 
export const updatePlant = async (userId: string, plantId: string, data: Partial<Plant>) => {
  const ref = doc(db, 'users', userId, 'plants', plantId);
  return await updateDoc(ref, data);
};

// DELETE
export const deletePlant = async (userId: string, plantId: string) => {
  const ref = doc(db, 'users', userId, 'plants', plantId);
  return await deleteDoc(ref);
};

// Public plants 
export const getPublicPlants = async (excludeUserId: string): Promise<Plant[]> => {
  const q = query(
    collectionGroup(db, 'plants'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Plant, 'id'>),
    }))
    .filter((p) => p.userId !== excludeUserId && p.isPrivate !== true);
};
