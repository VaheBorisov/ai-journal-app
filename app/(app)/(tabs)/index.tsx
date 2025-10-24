import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStreaks } from '@/hooks/use-streaks';

import { formatUppercaseDate, getTimeOfDayGreeting } from '@/lib/utils/date';
import { getUserFirstName } from '@/lib/utils/user';

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const insets = useSafeAreaInsets();

  const {
    currentStreak,
    longestStreak,
    isActive,
    statusMessage,
    daysUntilNextMilestone,
    nextMilestone,
    isLoading: streaksLoading,
  } = useStreaks();

  const now = new Date();
  const formattedDate = formatUppercaseDate(now);
  const greeting = getTimeOfDayGreeting();
  const userName = getUserFirstName(user);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Text>asdasdasd</Text>
    </SafeAreaView>
  );
}
