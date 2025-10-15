import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User preferences
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Recent addresses
  recentAddresses: string[];
  addRecentAddress: (address: string) => void;
  clearRecentAddresses: () => void;

  // App settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  tutorialCompleted: boolean;
  setTutorialCompleted: (completed: boolean) => void;

  // Onboarding
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      recentAddresses: [],
      notificationsEnabled: true,
      tutorialCompleted: false,
      hasSeenWelcome: false,

      // Actions
      setTheme: (theme) => set({ theme }),

      addRecentAddress: (address) =>
        set((state) => ({
          recentAddresses: [
            address,
            ...state.recentAddresses.filter((a) => a !== address),
          ].slice(0, 5), // Keep only last 5
        })),

      clearRecentAddresses: () => set({ recentAddresses: [] }),

      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      setTutorialCompleted: (completed) =>
        set({ tutorialCompleted: completed }),

      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
    }),
    {
      name: 'tiptop-app-storage',
    }
  )
);
