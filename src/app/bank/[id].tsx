import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AccountRow, BankBadge, CardRow, SectionCard } from '@/components/ledger-rows';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { BankForm } from '@/features/bank-form';
import { useBankSummary, useLedger } from '@/state/ledger-context';

export default function BankDetailScreen() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const { data } = useLedger();
  const bank = data.banks.find((b) => b.id === id);
  const { accounts, cards, total } = useBankSummary(id);

  if (!bank) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Bank' }} />
        <ThemedText style={styles.missing} themeColor="textSecondary">
          This bank no longer exists.
        </ThemedText>
      </ThemedView>
    );
  }

  if (edit === '1') {
    return (
      <>
        <Stack.Screen options={{ title: `Edit ${bank.name}` }} />
        <BankForm bank={bank} />
      </>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: bank.name,
          headerRight: () => (
            <Link href={{ pathname: '/bank/[id]', params: { id: bank.id, edit: '1' } }} asChild>
              <Pressable hitSlop={8}>
                <ThemedText type="linkPrimary">Edit</ThemedText>
              </Pressable>
            </Link>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.hero}>
          <BankBadge bank={bank} size={56} />
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Total at {bank.name}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.total}>
              {formatMoney(total, data.currency)}
            </ThemedText>
          </View>
        </View>

        <SectionCard
          title="Accounts"
          action={
            <Link href={{ pathname: '/account/new', params: { bankId: bank.id } }} asChild>
              <Pressable hitSlop={8}>
                <ThemedText type="linkPrimary">+ Add</ThemedText>
              </Pressable>
            </Link>
          }>
          {accounts.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No accounts yet. Add one with its current balance.
            </ThemedText>
          )}
          {accounts.map((account) => (
            <AccountRow key={account.id} account={account} />
          ))}
        </SectionCard>

        <SectionCard
          title="Debit cards"
          action={
            <Link href={{ pathname: '/card/new', params: { bankId: bank.id } }} asChild>
              <Pressable hitSlop={8}>
                <ThemedText type="linkPrimary">+ Add</ThemedText>
              </Pressable>
            </Link>
          }>
          {cards.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No cards yet.
            </ThemedText>
          )}
          {cards.map((card) => (
            <CardRow key={card.id} card={card} bank={bank} />
          ))}
        </SectionCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 8 },
  total: { fontSize: 28, lineHeight: 34, fontVariant: ['tabular-nums'] },
  emptyText: { paddingBottom: Spacing.two },
  missing: { padding: Spacing.four, textAlign: 'center' },
});
