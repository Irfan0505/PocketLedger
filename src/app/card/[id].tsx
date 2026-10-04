import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardForm } from '@/features/card-form';
import { useLedger } from '@/state/ledger-context';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLedger();
  const card = data.cards.find((c) => c.id === id);

  if (!card) {
    return (
      <ThemedView style={{ flex: 1, padding: 24 }}>
        <ThemedText themeColor="textSecondary">This card no longer exists.</ThemedText>
      </ThemedView>
    );
  }
  return <CardForm card={card} bankId={card.bankId} />;
}
