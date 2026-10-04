import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccountForm } from '@/features/account-form';
import { useLedger } from '@/state/ledger-context';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLedger();
  const account = data.accounts.find((a) => a.id === id);

  if (!account) {
    return (
      <ThemedView style={{ flex: 1, padding: 24 }}>
        <ThemedText themeColor="textSecondary">This account no longer exists.</ThemedText>
      </ThemedView>
    );
  }
  return <AccountForm account={account} bankId={account.bankId} />;
}
