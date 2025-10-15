import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

interface CachedAnalysis {
  address: string;
  results: AnalysisResults;
  timestamp: number;
  coordinates?: google.maps.LatLngLiteral;
}

interface AnalysisState {
  cachedAnalyses: Record<string, CachedAnalysis>;
  addAnalysis: (address: string, results: AnalysisResults, coordinates?: google.maps.LatLngLiteral) => void;
  getAnalysis: (address: string) => CachedAnalysis | null;
  clearOldAnalyses: () => void;
  clearAllAnalyses: () => void;
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      cachedAnalyses: {},

      addAnalysis: (address, results, coordinates) =>
        set((state) => ({
          cachedAnalyses: {
            ...state.cachedAnalyses,
            [address.toLowerCase()]: {
              address,
              results,
              coordinates,
              timestamp: Date.now(),
            },
          },
        })),

      getAnalysis: (address) => {
        const cached = get().cachedAnalyses[address.toLowerCase()];
        if (!cached) return null;

        // Check if cache is still valid
        if (Date.now() - cached.timestamp > CACHE_DURATION) {
          return null;
        }

        return cached;
      },

      clearOldAnalyses: () =>
        set((state) => {
          const now = Date.now();
          const filtered = Object.entries(state.cachedAnalyses).reduce(
            (acc, [key, value]) => {
              if (now - value.timestamp <= CACHE_DURATION) {
                acc[key] = value;
              }
              return acc;
            },
            {} as Record<string, CachedAnalysis>
          );

          return { cachedAnalyses: filtered };
        }),

      clearAllAnalyses: () => set({ cachedAnalyses: {} }),
    }),
    {
      name: 'tiptop-analysis-cache',
    }
  )
);
