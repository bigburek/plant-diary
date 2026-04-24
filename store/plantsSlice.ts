import { db } from '@/firebase/config';
import { createPlant, deletePlant, getAllPlants } from '@/firebase/firestore/CRUD';
import { schedulePlantNotification } from '@/lib/plantNotifications';
import { Plant } from '@/types/plant';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { doc, updateDoc } from 'firebase/firestore';

export const startPlantsListener = () => (dispatch: any) => {
  const unsubscribe = getAllPlants((data) => {
    dispatch(setPlants(data));
  });
  return unsubscribe;
};

export const addPlant = createAsyncThunk(
  'plants/addPlant',
  async ({ userId, plantData }: { userId: string; plantData: Omit<Plant, 'id'> }) => {
    const docRef = await createPlant(userId, plantData);
    const notificationId = await schedulePlantNotification(
      docRef.id,
      plantData.nickname,
      plantData.lastWateredAt,
      plantData.wateringInterval
    );
    await updateDoc(doc(db, 'users', userId, 'plants', docRef.id), { notificationId });
  }
);


export const removePlant = createAsyncThunk(
  'plants/removePlant',
  async ({ userId, plantId }: { userId: string; plantId: string }) => {
    await deletePlant(userId, plantId);
  }
);


const plantsSlice = createSlice({
  name: 'plants',
  initialState: {
    plants: [] as Plant[],
    loading: true,
    error: null as string | null,
  },
  reducers: {
   
    setPlants(state, action: PayloadAction<Plant[]>) {
      state.plants = action.payload;
      state.loading = false;
    },
    clearPlants(state) {
      state.plants = [];
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPlant.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to add plant';
      })
      .addCase(removePlant.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to remove plant';
      });
  },
});

export const { setPlants, clearPlants } = plantsSlice.actions;
export default plantsSlice.reducer;
