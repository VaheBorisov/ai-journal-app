import { useCallback, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';

import { fetchJournalEntries } from '@/lib/sanity/journal';
import {
  calculateStreaks,
  getDaysUntilNextMilestone,
  getStreakStatusMessage,
  isStreakActive,
} from '@/lib/utils/streaks';

import type { USER_JOURNAL_ENTRIES_QUERYResult } from '@/sanity/sanity.types';

interface UseStreaksReturn {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakDates: string[];
  isActive: boolean;
  statusMessage: string;
  daysUntilNextMilestone: number;
  nextMilestone: number;
  isLoading: boolean;
  error: string | null;
  refreshStreaks: () => Promise<void>;
}

const initialStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastEntryDate: null as string | null,
  streakDates: [] as string[],
};

export const useStreaks = (): UseStreaksReturn => {
  const { user } = useUser();

  const [streakData, setStreakData] = useState(initialStreakData);
  const [entries, setEntries] = useState<USER_JOURNAL_ENTRIES_QUERYResult>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStreakData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const journalEntries = await fetchJournalEntries(user.id);
      setEntries(journalEntries);

      const entriesForStreaks = journalEntries
        .filter(entry => entry._id && entry.createdAt)
        .map(entry => ({
          _id: entry._id,
          createdAt: entry.createdAt!,
        }));

      const calculatedStreaks = calculateStreaks(entriesForStreaks);
      setStreakData(calculatedStreaks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load streaks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  const entriesForActive = entries
    .filter(entry => entry._id && entry.createdAt)
    .map(entry => ({
      _id: entry._id,
      createdAt: entry.createdAt!,
    }));

  const isActive = isStreakActive(entriesForActive);
  const statusMessage = getStreakStatusMessage(streakData);
  const { daysUntil: daysUntilNextMilestone, milestone: nextMilestone } = getDaysUntilNextMilestone(
    streakData.currentStreak,
  );

  return {
    ...streakData,
    isActive,
    statusMessage,
    daysUntilNextMilestone,
    nextMilestone,
    isLoading,
    error,
    refreshStreaks: loadStreakData,
  };
};
