import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ChipPicker, FormField, PrimaryButton } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { ThemedText } from '@/components/themed-text';
import { parseAmount } from '@/domain/money';
import { ACCOUNT_TYPE_LABELS, type Account, type AccountType } from '@/domain/types';
import { useLedger } from '@/state/ledger-context';

const typeOptions = (Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((value) => ({
  value,
  label: ACCOUNT_TYPE_LABELS[value],
}));

export function AccountForm({ account, bankId }: { account?: Account; bankId: string }) {
  const { data, addAccount, updateAccount, removeAccount } = useLedger();
  const bank = data.banks.find((b) => b.id === bankId);
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountType>(account?.type ?? 'checking');
  const [balanceText, setBalanceText] = useState(account ? String(account.balance) : '');
  const balance = parseAmount(balanceText);
  const valid = name.trim().length > 0 && balance !== null;

  const save = () => {
    if (!valid || balance === null) return;
    if (account) updateAccount(account.id, { name: name.trim(), type, balance });
    else addAccount({ bankId, name: name.trim(), type, balance });
    router.back();
  };

  const confirmDelete = () =>
    Alert.alert(`Delete ${account?.name}?`, 'Cards linked to it will stay but become unlinked.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeAccount(account!.id);
          router.back();
        },
      },
    ]);

  return (
    <FormScreen>
      {bank && (
        <ThemedText type="small" themeColor="textSecondary">
          {bank.name}
        </ThemedText>
      )}
      <FormField
        label="Account name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Everyday checking"
        autoFocus={!account}
        autoCapitalize="words"
      />
      <ChipPicker label="Type" options={typeOptions} value={type} onChange={setType} />
      <FormField
        label={`Current balance (${data.currency})`}
        value={balanceText}
        onChangeText={setBalanceText}
        placeholder="0.00"
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <PrimaryButton
        title={account ? 'Save changes' : 'Add account'}
        onPress={save}
        disabled={!valid}
      />
      {account && <PrimaryButton title="Delete account" onPress={confirmDelete} destructive />}
    </FormScreen>
  );
}
