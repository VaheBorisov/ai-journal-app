import { router, useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';

import JournalEntryForm from '@/components/JournalEntryForm';

import { createJournalEntry } from '@/lib/sanity/journal';

export default function NewEntry() {
  const { promptTitle, promptText, suggestedMood } = useLocalSearchParams();

  const handleSave = async (entry: {
    title?: string;
    content: string;
    images: { uri: string; caption?: string; alt?: string }[];
    mood: string;
    userId: string;
  }) => {
    try {
      await createJournalEntry(entry);
      router.replace('/(app)/(tabs)/entries');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert('Discard Entry?', 'Are you sure you want to discard this journal entry?', [
      { text: 'Keep Writing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const initialData = promptText
    ? {
        title: typeof promptTitle === 'string' ? promptTitle : '',
        content: typeof promptText === 'string' ? promptText : '',
        mood: typeof suggestedMood === 'string' ? suggestedMood : '',
        images: [],
        userId: '',
      }
    : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <JournalEntryForm onSave={handleSave} onCancel={handleCancel} initialData={initialData} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
