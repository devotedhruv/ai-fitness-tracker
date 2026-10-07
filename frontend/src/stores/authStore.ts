import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAppStorage } from '../services/storage/appStorage';

export interface UserProfile {
  id?: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  instagramHandle?: string;
  xHandle?: string;
  stravaUrl?: string;
  location?: string;
  units: 'METRIC' | 'IMPERIAL';
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  fitnessGoal?: string;
  daysPerWeek: number;
  equipment: string[];
}

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const DEFAULT_USER: User = {
  id: 'user-demo-athlete',
  email: 'athlete@aifitnesstracker.app',
  profile: {
    displayName: 'AI Fitness Athlete',
    username: 'athlete',
    avatarUrl: 'preset:athlete',
    bio: 'Build. Move. Become.',
    units: 'METRIC',
    experienceLevel: 'INTERMEDIATE',
    daysPerWeek: 4,
    equipment: ['Dumbbells', 'Barbell'],
  },
};

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  setSession: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setOnboarded: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isOnboarded: false,

      setSession: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isOnboarded: true,
        }),

      setTokens: (tokens) => set({ tokens }),

      updateProfile: (profileUpdate) =>
        set((state) => {
          const baseUser = state.user || DEFAULT_USER;
          const currentProfile = baseUser.profile || DEFAULT_USER.profile!;
          return {
            user: {
              ...baseUser,
              profile: {
                ...currentProfile,
                ...profileUpdate,
              },
            },
            isAuthenticated: true,
          };
        }),

      setOnboarded: (isOnboarded) => set({ isOnboarded }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isOnboarded: false,
        }),
    }),
    {
      name: 'balyra-auth-store',
      storage: createJSONStorage(getAppStorage),
    }
  )
);
