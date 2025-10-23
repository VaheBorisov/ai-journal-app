import { Text, XStack, YStack } from 'tamagui';
import { Feather } from '@tamagui/lucide-icons';

type LogoProps = {
  hasText?: boolean;
};

export default function Logo({ hasText = false }: LogoProps) {
  return (
    <YStack gap="$3" mb="$4" style={{ alignItems: 'center' }}>
      <XStack
        bg="$purple10"
        p="$3"
        style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}
      >
        <Feather size={32} color="white" />
      </XStack>
      {hasText && (
        <Text fontSize="$7" fontWeight="700" color="$color">
          Journal.ai
        </Text>
      )}
    </YStack>
  );
}
