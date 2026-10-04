import { useLocalSearchParams } from 'expo-router';

import { CardForm } from '@/features/card-form';

export default function NewCardScreen() {
  const { bankId } = useLocalSearchParams<{ bankId: string }>();
  return <CardForm bankId={bankId} />;
}
