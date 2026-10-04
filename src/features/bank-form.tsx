import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ColorPicker, FormField, PrimaryButton } from '@/components/form';
import { FormScreen } from '@/components/form-screen';
import { BANK_COLORS, type Bank } from '@/domain/types';
import { useLedger } from '@/state/ledger-context';

export function BankForm({ bank }: { bank?: Bank }) {
  const { data, addBank, updateBank, removeBank } = useLedger();
  const [name, setName] = useState(bank?.name ?? '');
  const [color, setColor] = useState(
    bank?.color ?? BANK_COLORS[data.banks.length % BANK_COLORS.length],
  );
  const valid = name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    if (bank) {
      updateBank(bank.id, { name: name.trim(), color });
      router.back();
    } else {
      const created = addBank({ name: name.trim(), color });
      router.replace({ pathname: '/bank/[id]', params: { id: created.id } });
    }
  };

  const confirmDelete = () =>
    Alert.alert(
      `Delete ${bank?.name}?`,
      'All accounts and cards under this bank will be removed too.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeBank(bank!.id);
            router.dismissTo('/accounts');
          },
        },
      ],
    );

  return (
    <FormScreen>
      <FormField
        label="Bank name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Chase, HDFC, Revolut"
        autoFocus={!bank}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <ColorPicker value={color} onChange={setColor} />
      <PrimaryButton title={bank ? 'Save changes' : 'Add bank'} onPress={save} disabled={!valid} />
      {bank && <PrimaryButton title="Delete bank" onPress={confirmDelete} destructive />}
    </FormScreen>
  );
}
