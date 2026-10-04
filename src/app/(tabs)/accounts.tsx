import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountRow, BankBadge, CardRow, SectionCard } from '@/components/ledger-rows';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import type { Bank } from '@/domain/types';
import { useBankSummary, useLedger } from '@/state/ledger-context';

function BankSection({ bank }: { bank: Bank }) {
  const { data } = useLedger();
  const { accounts, cards, total } = useBankSummary(bank.id);

  return (
    <SectionCard
      header={
        <Link href={{ pathname: '/bank/[id]', params: { id: bank.id } }} asChild>
          <Pressable style={({ pressed }) => [styles.bankHeader, pressed && styles.pressed]}>
            <BankBadge bank={bank} />
            <View style={styles.bankTitle}>
              <ThemedText type="smallBold">{bank.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {accounts.length} account{accounts.length === 1 ? '' : 's'} · {cards.length} card
                {cards.length === 1 ? '' : 's'}
              </ThemedText>
            </View>
            <ThemedText style={styles.total}>{formatMoney(total, data.currency)}</ThemedText>
          </Pressable>
        </Link>
      }>
      {accounts.map((account) => (
        <AccountRow key={account.id} account={account} />
      ))}
      {cards.map((card) => (
        <CardRow key={card.id} card={card} bank={bank} />
      ))}
      <View style={styles.actions}>
        <Link href={{ pathname: '/account/new', params: { bankId: bank.id } }} asChild>
          <Pressable style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="linkPrimary">+ Account</ThemedText>
          </Pressable>
        </Link>
        <Link href={{ pathname: '/card/new', params: { bankId: bank.id } }} asChild>
          <Pressable style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="linkPrimary">+ Card</ThemedText>
          </Pressable>
        </Link>
      </View>
    </SectionCard>
  );
}

export default function AccountsScreen() {
  const { data, ready } = useLedger();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Accounts</ThemedText>
            <Link href="/bank/new" asChild>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="linkPrimary">+ Add bank</ThemedText>
              </Pressable>
            </Link>
          </View>

          {ready && data.banks.length === 0 && (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="smallBold">No banks yet</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                Add a bank, then add its accounts with their current balances and any debit cards.
              </ThemedText>
              <Link href="/bank/new" asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedText type="linkPrimary">Add your first bank</ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
          )}

          {data.banks.map((bank) => (
            <BankSection key={bank.id} bank={bank} />
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankHeader: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  bankTitle: { flex: 1 },
  total: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingTop: Spacing.one,
  },
  empty: {
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.6 },
});
