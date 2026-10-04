import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipPicker } from '@/components/form';
import { BankBadge, SectionCard } from '@/components/ledger-rows';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { CURRENCIES } from '@/domain/types';
import { useLedger } from '@/state/ledger-context';

const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));

export default function OverviewScreen() {
  const { data, setCurrency } = useLedger();
  const total = data.accounts.reduce((sum, a) => sum + a.balance, 0);
  const byBank = data.banks.map((bank) => ({
    bank,
    total: data.accounts.filter((a) => a.bankId === bank.id).reduce((s, a) => s + a.balance, 0),
  }));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">PocketLedger</ThemedText>

          <ThemedView type="backgroundElement" style={styles.hero}>
            <ThemedText type="small" themeColor="textSecondary">
              Total balance
            </ThemedText>
            <ThemedText type="title" style={styles.heroAmount} adjustsFontSizeToFit numberOfLines={1}>
              {formatMoney(total, data.currency)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data.banks.length} bank{data.banks.length === 1 ? '' : 's'} · {data.accounts.length}{' '}
              account{data.accounts.length === 1 ? '' : 's'} · {data.cards.length} card
              {data.cards.length === 1 ? '' : 's'}
            </ThemedText>
          </ThemedView>

          {byBank.length > 0 && (
            <SectionCard title="By bank">
              {byBank.map(({ bank, total: bankTotal }) => (
                <Link key={bank.id} href={{ pathname: '/bank/[id]', params: { id: bank.id } }} asChild>
                  <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <BankBadge bank={bank} size={32} />
                    <ThemedText style={styles.rowName}>{bank.name}</ThemedText>
                    <ThemedText style={styles.amount}>
                      {formatMoney(bankTotal, data.currency)}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}
            </SectionCard>
          )}

          <SectionCard title="Settings">
            <View style={styles.settings}>
              <ChipPicker
                label="Currency"
                options={currencyOptions}
                value={data.currency as (typeof CURRENCIES)[number]}
                onChange={setCurrency}
              />
            </View>
          </SectionCard>
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
  hero: { borderRadius: 20, padding: Spacing.four, gap: Spacing.one },
  heroAmount: { fontSize: 40, lineHeight: 48, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 10 },
  rowName: { flex: 1 },
  amount: { fontWeight: '600', fontVariant: ['tabular-nums'] },
  settings: { paddingVertical: Spacing.two },
  pressed: { opacity: 0.6 },
});
