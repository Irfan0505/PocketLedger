import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { ChipPicker, FormField, PrimaryButton } from "@/components/form";
import { FormScreen } from "@/components/form-screen";
import { ThemedText } from "@/components/themed-text";
import {
  CARD_NETWORK_LABELS,
  type Card,
  type CardNetwork,
} from "@/domain/types";
import { useLedger } from "@/state/ledger-context";

const networkOptions = (Object.keys(CARD_NETWORK_LABELS) as CardNetwork[]).map(
  (value) => ({
    value,
    label: CARD_NETWORK_LABELS[value],
  }),
);

function formatExpiry(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

export function CardForm({ card, bankId }: { card?: Card; bankId: string }) {
  const { data, addCard, updateCard, removeCard } = useLedger();
  const bank = data.banks.find((b) => b.id === bankId);
  const bankAccounts = data.accounts.filter((a) => a.bankId === bankId);
  const [nickname, setNickname] = useState(card?.nickname ?? "");
  const [last4, setLast4] = useState(card?.last4 ?? "");
  const [network, setNetwork] = useState<CardNetwork>(card?.network ?? "visa");
  const [expiry, setExpiry] = useState(card?.expiry ?? "");
  const [accountId, setAccountId] = useState<string>(card?.accountId ?? "none");
  const valid = last4.length === 4;

  const accountOptions = [
    { value: "none", label: "Not linked" },
    ...bankAccounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  const save = () => {
    if (!valid) return;
    const draft = {
      nickname: nickname.trim(),
      last4,
      network,
      expiry,
      accountId: accountId === "none" ? null : accountId,
    };
    if (card) updateCard(card.id, draft);
    else addCard({ bankId, ...draft });
    router.back();
  };

  const confirmDelete = () =>
    Alert.alert("Delete this card?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeCard(card!.id);
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
        label="Last 4 digits"
        value={last4}
        onChangeText={(t) => setLast4(t.replace(/\D/g, "").slice(0, 4))}
        placeholder="1234"
        keyboardType="number-pad"
        maxLength={4}
        autoFocus={!card}
      />
      <ChipPicker
        label="Network"
        options={networkOptions}
        value={network}
        onChange={setNetwork}
      />
      <FormField
        label="Nickname (optional)"
        value={nickname}
        onChangeText={setNickname}
        placeholder="e.g. Travel card"
        autoCapitalize="words"
      />
      <FormField
        label="Expiry (optional)"
        value={expiry}
        onChangeText={(t) => setExpiry(formatExpiry(t))}
        placeholder="MM/YY"
        keyboardType="number-pad"
        maxLength={5}
      />
      <ChipPicker
        label="Linked account"
        options={accountOptions}
        value={accountId}
        onChange={setAccountId}
      />
      <PrimaryButton
        title={card ? "Save changes" : "Add card"}
        onPress={save}
        disabled={!valid}
      />
      {card && (
        <PrimaryButton
          title="Delete card"
          onPress={confirmDelete}
          destructive
        />
      )}
    </FormScreen>
  );
}
