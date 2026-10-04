import { useLocalSearchParams } from 'expo-router';

import { AccountForm } from '@/features/account-form';

export default function NewAccountScreen() {
  const { bankId } = useLocalSearchParams<{ bankId: string }>();
  return <AccountForm bankId={bankId} />;
}
