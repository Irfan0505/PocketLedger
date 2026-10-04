import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ActivityFeed } from '@/features/activity-feed';
import { useLedger } from '@/state/ledger-context';

export default function ActivityScreen() {
  const { data, ready } = useLedger();
  const hasAccounts = data.accounts.length > 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Activity</ThemedText>
            {hasAccounts && (
              <Link href="/transaction/new" asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedText type="linkPrimary">+ Add</ThemedText>
                </Pressable>
              </Link>
            )}
          </View>

          {ready && !hasAccounts ? (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="smallBold">Add an account first</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                Debits and credits are recorded against an account so its balance stays up to date.
              </ThemedText>
              <Link href="/accounts" asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedText type="linkPrimary">Go to Accounts</ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
          ) : (
            <ActivityFeed />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: { borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: Spacing.two },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.6 },
});
