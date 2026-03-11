import { Plant } from '@/types/plant';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlantsState {
  plants: Plant[];
  loading: boolean;
  error: string | null;
}

const initialState: PlantsState = {
  plants: [],
  loading: false,
  error: null,
}

const plantsSlice = createSlice({
  name: 'plants',
  initialState,
  reducers: {
    // Read All
    setPlants(state, action: PayloadAction<Plant[]>) {
      state.plants = action.payload;
    },
    // Create
    addPlantToStore(state, action: PayloadAction<Plant>) {
      state.plants.push(action.payload);
    },
    // Update
    updatePlantInStore(state, action: PayloadAction<{ id: string; data: Partial<Plant> }>) {
      const idx = state.plants.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.plants[idx] = { ...state.plants[idx], ...action.payload.data };
      }
    },
    // Delete
    removePlantFromStore(state, action: PayloadAction<string>) {
      state.plants = state.plants.filter(p => p.id !== action.payload);
    },
    // UI States
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setPlants,
  addPlantToStore,
  setLoading,
  setError,
  updatePlantInStore,
  removePlantFromStore,
} = plantsSlice.actions;

export default plantsSlice.reducer;