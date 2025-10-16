import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  university?: string;
  major?: string;
  year?: string;
  interests: string[];
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    voiceEnabled: boolean;
    autoPlay: boolean;
  };
  stats: {
    totalMessages: number;
    totalCreditsEarned: number;
    totalActivitiesCompleted: number;
    streak: number;
    lastActive: string;
  };
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserProfile['preferences']>>) => {
      if (state.profile) {
        state.profile.preferences = { ...state.profile.preferences, ...action.payload };
      }
    },
    updateStats: (state, action: PayloadAction<Partial<UserProfile['stats']>>) => {
      if (state.profile) {
        state.profile.stats = { ...state.profile.stats, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  updatePreferences,
  updateStats,
  setLoading,
  setError,
  clearProfile,
} = userSlice.actions;

export default userSlice.reducer;

