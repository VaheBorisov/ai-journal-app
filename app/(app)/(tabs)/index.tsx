import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { View, Text, Spinner, ScrollView, YStack, H1, XStack, Card } from 'tamagui';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import Logo from '@/components/Logo';

import { useStreaks } from '@/hooks/use-streaks';

import { AppColors } from '@/constants/theme';

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

  if (!isLoaded)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </SafeAreaView>
    );

  return (
    <View style={styles.container}>
      <ScrollView px="$4" style={{ ...styles.content, paddingTop: insets.top }}>
        {/* Header with date */}
        <YStack gap="$2" mt="$4" style={{ alignItems: 'center' }}>
          <Logo />
          <Text fontSize="$2" color="$color10" textTransform="uppercase" fontWeight="500">
            {formattedDate}
          </Text>
        </YStack>

        {/* Greeting */}
        <YStack gap="$2" mb="$4" style={{ alignItems: 'center' }}>
          <H1 fontSize="$8" fontWeight="600" color="$color12" style={{ textAlign: 'center' }}>
            {greeting}, {userName}
          </H1>
        </YStack>

        {/* Weekly Calendar Strip */}
        <XStack mb="$6" style={{ justifyContent: 'space-between' }}>
          {Array.from({ length: 7 }, (_, i) => {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + i);

            const dayData = {
              dayName: startOfWeek.toLocaleDateString('en-US', {
                weekday: 'short',
              }),
              dayNumber: startOfWeek.getDate(),
              isToday: startOfWeek.toDateString() === now.toDateString(),
            };

            return (
              <YStack key={i} gap="$1" style={{ alignItems: 'center' }}>
                <Text fontSize="$2" color="$color10" fontWeight="500">
                  {dayData.dayName}
                </Text>
                <View style={[styles.dayCircle, dayData.isToday && styles.todayCircle]}>
                  <Text
                    fontSize="$3"
                    color={dayData.isToday ? 'white' : '$color11'}
                    fontWeight={dayData.isToday ? '600' : '400'}
                  >
                    {dayData.dayNumber}
                  </Text>
                </View>
              </YStack>
            );
          })}
        </XStack>

        {/* Streaks */}
        {!streaksLoading && (
          <YStack gap="$3" mb="$6">
            <Card
              elevate
              size="$4"
              bordered
              bg="$background"
              borderColor="$borderColor"
              padding="$5"
            >
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Current Streak */}
                <YStack gap="$2" flex={1} style={{ alignItems: 'center' }}>
                  <Text fontSize="$2" color="$color10" fontWeight="600">
                    CURRENT STREAK
                  </Text>
                  <XStack gap="$2" style={{ alignItems: 'baseline' }}>
                    <Text fontSize="$10" fontWeight="700" color="$color12">
                      {currentStreak}
                    </Text>
                    <Text fontSize="$5" color="$color11" fontWeight="500">
                      {currentStreak === 1 ? 'day' : 'days'}
                    </Text>
                  </XStack>
                  <View style={{ marginTop: 4 }}>
                    <IconSymbol
                      size={32}
                      name={isActive ? 'flame.fill' : 'zzz'}
                      color={isActive ? AppColors.flameOrange : AppColors.gray400}
                    />
                  </View>
                </YStack>

                {/* Divider */}
                <View
                  style={{ width: 1, height: 60, backgroundColor: '#E5E7EB', marginHorizontal: 16 }}
                />

                {/* Best Streak */}
                <YStack gap="$2" flex={1} style={{ alignItems: 'center' }}>
                  <Text fontSize="$2" color="$color10" fontWeight="600">
                    BEST STREAK
                  </Text>
                  <XStack gap="$2" style={{ alignItems: 'baseline' }}>
                    <Text fontSize="$10" fontWeight="700" color="$color12">
                      {longestStreak}
                    </Text>
                    <Text fontSize="$5" color="$color11" fontWeight="500">
                      {longestStreak === 1 ? 'day' : 'days'}
                    </Text>
                  </XStack>
                  <View style={{ marginTop: 4 }}>
                    <IconSymbol size={32} name="trophy.fill" color={AppColors.trophyGold} />
                  </View>
                </YStack>
              </XStack>
            </Card>

            {/* Motivational Messages Outside Card */}
            <YStack gap="$2" pt="$2" style={{ alignItems: 'center' }}>
              <Text fontSize="$4" color="$color11" fontWeight="500" style={{ textAlign: 'center' }}>
                {statusMessage}
              </Text>

              {daysUntilNextMilestone > 0 && (
                <XStack gap="$2" style={{ alignItems: 'center' }}>
                  <IconSymbol size={16} name="target" color="#6B7280" />
                  <Text fontSize="$3" color="$color10">
                    {daysUntilNextMilestone} days until {nextMilestone}-day milestone!
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>
        )}

        {/* Daily Prompts Section */}
        {/* <DailyPromptCards */}

        {/* Action Buttons */}
        <YStack gap="$3" mb="$6">
          {/* Add New Entry Button */}
          <Pressable
            onPress={() => router.push('/new-entry')}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <Card elevate size="$4" bordered bg="$purple9" borderColor="$purple9" padding="$4">
              <XStack gap="$3" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol size={24} name="plus.circle.fill" color={AppColors.white} />
                <Text fontSize="$5" fontWeight="600" color="white">
                  Add New Entry
                </Text>
              </XStack>
            </Card>
          </Pressable>

          {/* View Previous Entries Button */}
          <Pressable
            onPress={() => router.push('/(app)/(tabs)/entries')}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <Card elevate size="$4" bordered bg="white" borderColor="$borderColor" padding="$4">
              <XStack gap="$3" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol size={24} name="book.fill" color={AppColors.primary} />
                <Text fontSize="$5" fontWeight="600" color="$color12">
                  Add New Entry
                </Text>
              </XStack>
            </Card>
          </Pressable>
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.gray500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderColor: AppColors.gray300,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  moodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
