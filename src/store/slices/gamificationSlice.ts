import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'quiz' | 'event' | 'interaction' | 'achievement';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  image?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  position: number;
}

interface GamificationState {
  credits: number;
  level: number;
  experience: number;
  points: number;
  activities: Activity[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  credits: 0,
  level: 1,
  experience: 0,
  points: 0,
  activities: [],
  achievements: [],
  leaderboard: [],
  isLoading: false,
  error: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setCredits: (state, action: PayloadAction<number>) => {
      state.credits = action.payload;
    },
    addCredits: (state, action: PayloadAction<number>) => {
      state.credits += action.payload;
    },
    spendCredits: (state, action: PayloadAction<number>) => {
      state.credits = Math.max(0, state.credits - action.payload);
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
    setExperience: (state, action: PayloadAction<number>) => {
      state.experience = action.payload;
    },
    addExperience: (state, action: PayloadAction<number>) => {
      state.experience += action.payload;
      // Calcular nivel basado en experiencia
      const newLevel = Math.floor(state.experience / 100) + 1;
      if (newLevel > state.level) {
        state.level = newLevel;
        // Otorgar créditos por subir de nivel
        state.credits += (newLevel - state.level) * 10;
      }
    },
    setPoints: (state, action: PayloadAction<number>) => {
      state.points = action.payload;
    },
    addPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
    },
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.push(action.payload);
    },
    updateActivity: (state, action: PayloadAction<{ id: string; updates: Partial<Activity> }>) => {
      const activity = state.activities.find(act => act.id === action.payload.id);
      if (activity) {
        Object.assign(activity, action.payload.updates);
      }
    },
    setAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.achievements = action.payload;
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(ach => ach.id === action.payload);
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        state.credits += achievement.points;
      }
    },
    setLeaderboard: (state, action: PayloadAction<LeaderboardEntry[]>) => {
      state.leaderboard = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCredits,
  addCredits,
  spendCredits,
  setLevel,
  setExperience,
  addExperience,
  setPoints,
  addPoints,
  setActivities,
  addActivity,
  updateActivity,
  setAchievements,
  unlockAchievement,
  setLeaderboard,
  setLoading,
  setError,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;

