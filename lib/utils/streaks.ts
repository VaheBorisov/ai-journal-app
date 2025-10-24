type JournalEntry = {
  _id: string;
  createdAt: string;
};

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakDates: string[];
}

const toDateString = (date: Date | string): string => {
  return new Date(date).toISOString().split('T')[0];
};

const getUniqueDates = (entries: JournalEntry[]): string[] => {
  return [...new Set(entries.map(entry => toDateString(entry.createdAt)))].sort((a, b) =>
    b.localeCompare(a),
  );
};

const addDays = (date: string, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return toDateString(newDate);
};

const daysBetween = (date1: string, date2: string) => {
  return Math.floor(
    (new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60 * 24),
  );
};

const calculateCurrentStreak = (entryDates: string[]): { streak: number; dates: string[] } => {
  const today = toDateString(new Date());
  const yesterday = addDays(today, -1);

  const hasEntryToday = entryDates.includes(today);
  const startDate = hasEntryToday ? today : yesterday;

  const generateConsecutiveDates = (start: string): string[] => {
    return Array.from({ length: entryDates.length }, (_, i) => addDays(start, -i));
  };

  const consecutiveDates = generateConsecutiveDates(startDate);
  const streakDates = consecutiveDates.filter(date => entryDates.includes(date));

  const streakEndIndex = consecutiveDates.findIndex(date => !entryDates.includes(date));
  const streak = streakEndIndex === -1 ? streakDates.length : streakEndIndex;

  return { streak, dates: streakDates.slice(0, streak).reverse() };
};

const findLongestStreak = (entryDates: string[]): number => {
  if (!entryDates.length) return 0;

  const datePairs = entryDates.slice(1).map((date, i) => ({
    date,
    prevDate: entryDates[i],
    isConsecutive: daysBetween(entryDates[i], date) === 1,
  }));

  const streaks = datePairs.reduce(
    (acc, { isConsecutive }, i) => {
      if (isConsecutive) {
        acc[acc.length - 1] = (acc[acc.length - 1] || 1) + 1;
      } else {
        acc.push(1);
      }
      return acc;
    },
    [1] as number[],
  );

  return Math.max(...streaks);
};

export const calculateStreaks = (entries: JournalEntry[]): StreakData => {
  if (!entries?.length)
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      streakDates: [],
    };

  const entryDates = getUniqueDates(entries);
  const { streak: currentStreak, dates: streakDates } = calculateCurrentStreak(entryDates);
  const longestStreak = findLongestStreak(entryDates);

  return {
    currentStreak,
    longestStreak,
    lastEntryDate: entryDates[0] ?? null,
    streakDates,
  };
};

export const isStreakActive = (entries: JournalEntry[]): boolean => {
  if (!entries?.length) return false;

  const today = toDateString(new Date());
  const yesterday = addDays(today, -1);
  const entryDates = entries.map(entry => toDateString(entry.createdAt));

  return entryDates.includes(today) || entryDates.includes(yesterday);
};

export const getStreakStatusMessage = ({ currentStreak, lastEntryDate }: StreakData): string => {
  if (currentStreak === 0) return 'Start your journaling streak today! ✨';

  const hasEntryToday = toDateString(new Date()) === lastEntryDate;

  const messages = {
    1: hasEntryToday
      ? 'Great start! Keep it going tomorrow! 🔥'
      : '1 day streak - write today to continue! 💪',
    default: hasEntryToday
      ? `Amazing! ${currentStreak} day streak! 🔥`
      : `${currentStreak} day streak - write today to continue! 🔥`,
  };

  return messages[currentStreak as keyof typeof messages] ?? messages.default;
};

export const getDaysUntilNextMilestone = (
  currentStreak: number,
): { daysUntil: number; milestone: number } => {
  const milestone = [5, 10, 25, 50, 100, 200, 365, 500, 1000];

  const nextMilestone =
    milestone.find(milestone => currentStreak < milestone) ?? Math.ceil(currentStreak / 100) * 100;

  return {
    daysUntil: nextMilestone - currentStreak,
    milestone: nextMilestone,
  };
};
