import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionForm } from '@/features/transaction-form';
import { useLedger } from '@/state/ledger-context';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLedger();
  const transaction = data.transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <ThemedView style={{ flex: 1, padding: 24 }}>
        <ThemedText themeColor="textSecondary">This transaction no longer exists.</ThemedText>
      </ThemedView>
    );
  }
  return <TransactionForm transaction={transaction} />;
}
