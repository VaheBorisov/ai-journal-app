import { useClerk } from '@clerk/clerk-expo';

import { Alert, Text } from 'react-native';
import { Button } from 'tamagui';

export const SignOutButton = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    Alert.alert(
      'Are you sure you want to sign out?',
      'This will sign you out of your account and you will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  };
  return (
    <Button theme="red" borderColor="$borderColor" onPress={handleSignOut}>
      <Text>Sign out</Text>
    </Button>
  );
};
