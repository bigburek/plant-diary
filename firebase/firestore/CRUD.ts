import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/firebase/config';
import { Plant } from '@/types/plant';


export async function createPlant(
  userId: string,
  data: Omit<Plant, 'id'>
) {
  return await addDoc(
    collection(db, 'users', userId, 'plants'),
    data
  );
}


export async function getPlants(userId: string): Promise<Plant[]> {
  const q = query(
    collection(db, 'users', userId, 'plants'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Plant, 'id'>),
  }));
}


export async function updatePlant(
  userId: string,
  plantId: string,
  data: Partial<Plant>
) {
  const ref = doc(db, 'users', userId, 'plants', plantId);
  return await updateDoc(ref, data);
}


export async function deletePlant(
  userId: string,
  plantId: string
) {
  const ref = doc(db, 'users', userId, 'plants', plantId);
  return await deleteDoc(ref);
}
