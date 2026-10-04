import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import {
  ACCOUNT_TYPE_LABELS,
  CARD_NETWORK_LABELS,
  type Account,
  type Bank,
  type Card,
} from '@/domain/types';
import { useLedger } from '@/state/ledger-context';

export function BankBadge({ bank, size = 40 }: { bank: Bank; size?: number }) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 4, backgroundColor: bank.color },
      ]}>
      <ThemedText style={[styles.badgeText, { fontSize: size * 0.45 }]}>
        {bank.name.trim().charAt(0).toUpperCase() || '?'}
      </ThemedText>
    </View>
  );
}

export function AccountRow({ account }: { account: Account }) {
  const { data } = useLedger();
  return (
    <Link href={{ pathname: '/account/[id]', params: { id: account.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.rowText}>
          <ThemedText>{account.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {ACCOUNT_TYPE_LABELS[account.type]}
          </ThemedText>
        </View>
        <ThemedText style={styles.amount}>{formatMoney(account.balance, data.currency)}</ThemedText>
      </Pressable>
    </Link>
  );
}

export function CardRow({ card, bank }: { card: Card; bank: Bank }) {
  const { data } = useLedger();
  const linked = data.accounts.find((a) => a.id === card.accountId);
  return (
    <Link href={{ pathname: '/card/[id]', params: { id: card.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={[styles.cardChip, { backgroundColor: bank.color }]}>
          <ThemedText style={styles.cardChipText}>•••• {card.last4 || '????'}</ThemedText>
        </View>
        <View style={styles.rowText}>
          <ThemedText>{card.nickname || `${CARD_NETWORK_LABELS[card.network]} debit`}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {[CARD_NETWORK_LABELS[card.network], linked?.name, card.expiry && `Exp ${card.expiry}`]
              .filter(Boolean)
              .join(' · ')}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

export function SectionCard({
  title,
  header,
  action,
  children,
}: {
  title?: string;
  header?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <View style={styles.sectionHeader}>
        {header ?? (
          <ThemedText type="smallBold" themeColor="textSecondary">
            {title}
          </ThemedText>
        )}
        {action}
      </View>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 12,
  },
  rowText: { flex: 1, gap: 2 },
  amount: { fontWeight: '600', fontVariant: ['tabular-nums'] },
  pressed: { opacity: 0.6 },
  cardChip: {
    width: 64,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  section: {
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
});
