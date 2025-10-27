import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import JournalEntryForm from '@/components/JournalEntryForm';

import { getJournalEntryById, updateJournalEntry } from '@/lib/sanity/journal';
import { extractImages, extractTextContent } from '@/lib/utils/entry';

import { AppColors } from '@/constants/theme';

import type { JOURNAL_ENTRY_BY_ID_QUERYResult } from '@/sanity/sanity.types';

export default function EditEntryScreen() {
  const { top, bottom } = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [entry, setEntry] = useState<JOURNAL_ENTRY_BY_ID_QUERYResult>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadEntry = async () => {
      try {
        const fetchedEntry = await getJournalEntryById(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
        } else {
          setError('Entry not found');
        }
      } catch (err) {
        console.error('Failed to load entry:', err);
        setError('Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [id]);

  const handleSave = async (updatedEntry: {
    title?: string;
    content: string;
    images: { uri: string; caption?: string; alt?: string }[];
    mood: string;
    userId: string;
  }) => {
    if (!id || !entry) return;

    setSaving(true);

    try {
      await updateJournalEntry(id, {
        title: updatedEntry.title,
        content: updatedEntry.content,
        mood: updatedEntry.mood,
      });

      router.dismiss();
      router.push(`/(app)/(tabs)/entries`);
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      Alert.alert('Error', 'Failed to update your journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Discard Changes?', 'Are you sure you want to discard your changes?', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (error || !entry) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || 'Something went wrong loading this entry.'}</Text>
      </View>
    );
  }

  const initialData = {
    title: entry.title ?? '',
    content: extractTextContent(entry.content),
    mood: entry.mood ?? 'neutral',
    images: extractImages(entry.content ?? []),
    userId: entry.userId ?? '',
  };

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <JournalEntryForm
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={true}
        />
      </KeyboardAvoidingView>
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 16,
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
  },
});
