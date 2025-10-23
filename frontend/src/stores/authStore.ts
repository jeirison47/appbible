import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak?: number;
  settings?: {
    bibleVersion: string;
    fontSize: string;
    theme: string;
    notificationsEnabled: boolean;
    notificationTime: string;
    systemDailyGoal: number;
    personalDailyGoal?: number | null;
  };
}

interface Role {
  name: string;
  displayName: string;
}

interface AuthStore {
  user: User | null;
  roles: Role[];
  permissions: string[];
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, roles: Role[], permissions: string[], token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  roles: [],
  permissions: [],
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, roles, permissions, token) => {
    localStorage.setItem('token', token);
    set({ user, roles, permissions, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, roles: [], permissions: [], token: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
