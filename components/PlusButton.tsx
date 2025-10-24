import { useRouter } from 'expo-router';

import { Card } from 'tamagui';
import { Pressable, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PlusButton() {
  const router = useRouter();

  return (
    <Card
      bg="$purple9"
      position="absolute"
      top={-20}
      borderColor="$purple9"
      borderRadius="$10"
      width={60}
      height={60}
      alignSelf="center"
    >
      <Pressable
        onPress={() => router.push('/new-entry')}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.plusButtonInner]}
      >
        <IconSymbol size={24} name="plus" color="white" />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  plusButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
