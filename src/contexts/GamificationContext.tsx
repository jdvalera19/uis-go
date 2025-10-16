import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setCredits,
  addCredits,
  setLevel,
  setExperience,
  addExperience,
  setPoints,
  addPoints,
  setActivities,
  setAchievements,
  setLeaderboard,
  setLoading,
  setError,
} from '../store/slices/gamificationSlice';
import { gamificationAPI } from '../services/api';

interface GamificationContextType {
  credits: number;
  level: number;
  experience: number;
  points: number;
  activities: any[];
  achievements: any[];
  leaderboard: any[];
  isLoading: boolean;
  error: string | null;
  earnCredits: (amount: number, reason: string) => Promise<void>;
  spendCredits: (amount: number, reason: string) => Promise<void>;
  earnExperience: (amount: number, reason: string) => Promise<void>;
  earnPoints: (amount: number, reason: string) => Promise<void>;
  completeActivity: (activityId: string) => Promise<void>;
  loadActivities: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  checkAchievements: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const {
    credits,
    level,
    experience,
    points,
    activities,
    achievements,
    leaderboard,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.gamification);

  useEffect(() => {
    loadUserStats();
    loadActivities();
    loadAchievements();
    loadLeaderboard();
  }, []);

  const loadUserStats = async () => {
    try {
      dispatch(setLoading(true));
      const stats = await gamificationAPI.getUserStats();
      dispatch(setCredits(stats.credits));
      dispatch(setLevel(stats.level));
      dispatch(setExperience(stats.experience));
      dispatch(setPoints(stats.points));
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al cargar estadísticas'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const earnCredits = async (amount: number, reason: string) => {
    try {
      dispatch(addCredits(amount));
      await gamificationAPI.earnCredits(amount, reason);
      await checkAchievements();
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al otorgar créditos'));
    }
  };

  const spendCredits = async (amount: number, reason: string) => {
    try {
      if (credits < amount) {
        throw new Error('Créditos insuficientes');
      }
      dispatch(addCredits(-amount));
      await gamificationAPI.spendCredits(amount, reason);
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al gastar créditos'));
    }
  };

  const earnExperience = async (amount: number, reason: string) => {
    try {
      dispatch(addExperience(amount));
      await gamificationAPI.earnExperience(amount, reason);
      await checkAchievements();
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al otorgar experiencia'));
    }
  };

  const earnPoints = async (amount: number, reason: string) => {
    try {
      dispatch(addPoints(amount));
      await gamificationAPI.earnPoints(amount, reason);
      await checkAchievements();
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al otorgar puntos'));
    }
  };

  const completeActivity = async (activityId: string) => {
    try {
      const activity = activities.find(act => act.id === activityId);
      if (!activity) {
        throw new Error('Actividad no encontrada');
      }

      await gamificationAPI.completeActivity(activityId);
      await earnCredits(activity.points, `Completar actividad: ${activity.title}`);
      await earnExperience(activity.points * 2, `Completar actividad: ${activity.title}`);
      await earnPoints(activity.points, `Completar actividad: ${activity.title}`);
      
      await loadActivities();
      await checkAchievements();
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al completar actividad'));
    }
  };

  const loadActivities = async () => {
    try {
      dispatch(setLoading(true));
      const activitiesData = await gamificationAPI.getActivities();
      dispatch(setActivities(activitiesData));
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al cargar actividades'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadAchievements = async () => {
    try {
      const achievementsData = await gamificationAPI.getAchievements();
      dispatch(setAchievements(achievementsData));
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al cargar logros'));
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await gamificationAPI.getLeaderboard();
      dispatch(setLeaderboard(leaderboardData));
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al cargar ranking'));
    }
  };

  const checkAchievements = async () => {
    try {
      const newAchievements = await gamificationAPI.checkAchievements();
      newAchievements.forEach((achievement: any) => {
        dispatch({ type: 'gamification/unlockAchievement', payload: achievement.id });
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al verificar logros'));
    }
  };

  const value: GamificationContextType = {
    credits,
    level,
    experience,
    points,
    activities,
    achievements,
    leaderboard,
    isLoading,
    error,
    earnCredits,
    spendCredits,
    earnExperience,
    earnPoints,
    completeActivity,
    loadActivities,
    loadAchievements,
    loadLeaderboard,
    checkAchievements,
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

