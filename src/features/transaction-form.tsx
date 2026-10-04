import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable } from "react-native";

import { ChipPicker, FormField, PrimaryButton } from "@/components/form";
import { FormScreen } from "@/components/form-screen";
import { ThemedText } from "@/components/themed-text";
import { parseAmount } from "@/domain/money";
import { parseDateInput, toDateInput } from "@/domain/period";
import {
    CATEGORIES,
    CURRENCIES,
    TRANSACTION_KIND_LABELS,
    categoriesFor,
    type CategoryKey,
    type Transaction,
    type TransactionKind,
} from "@/domain/types";
import { useLedger } from "@/state/ledger-context";

const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));

const kindOptions = (
  Object.keys(TRANSACTION_KIND_LABELS) as TransactionKind[]
).map((value) => ({
  value,
  label: TRANSACTION_KIND_LABELS[value],
}));

const categoryOptions = (kind: TransactionKind) =>
  categoriesFor(kind).map((value) => ({
    value,
    label: CATEGORIES[value].label,
  }));

export function TransactionForm({
  transaction,
}: {
  transaction?: Transaction;
}) {
  const { data, addTransaction, updateTransaction, removeTransaction } =
    useLedger();
  const [kind, setKind] = useState<TransactionKind>(
    transaction?.kind ?? "debit",
  );
  const [amountText, setAmountText] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [currency, setCurrency] = useState(
    transaction?.currency ?? data.currency,
  );
  const [category, setCategory] = useState<CategoryKey>(
    transaction?.category ?? categoriesFor("debit")[0],
  );
  const [accountId, setAccountId] = useState(
    transaction?.accountId ?? data.accounts[0]?.id ?? "",
  );
  const [cardId, setCardId] = useState(transaction?.cardId ?? "none");
  const [note, setNote] = useState(transaction?.note ?? "");
  const [dateText, setDateText] = useState(() =>
    toDateInput(transaction?.date ?? Date.now()),
  );

  const amount = parseAmount(amountText);
  const date = parseDateInput(dateText);
  const cards = data.cards.filter((c) => c.accountId === accountId);
  const valid =
    amount !== null && amount > 0 && date !== null && accountId !== "";

  const accountOptions = data.accounts.map((a) => {
    const bank = data.banks.find((b) => b.id === a.bankId);
    return { value: a.id, label: bank ? `${bank.name} · ${a.name}` : a.name };
  });
  const cardOptions = [
    { value: "none", label: "No card" },
    ...cards.map((c) => ({
      value: c.id,
      label: c.nickname || `•••• ${c.last4}`,
    })),
  ];

  const changeKind = (next: TransactionKind) => {
    setKind(next);
    if (CATEGORIES[category].kind !== next) setCategory(categoriesFor(next)[0]);
  };

  const changeAccount = (next: string) => {
    setAccountId(next);
    setCardId("none");
  };

  const save = () => {
    if (!valid || amount === null || date === null) return;
    const draft = {
      kind,
      amount,
      currency,
      category,
      accountId,
      cardId:
        cardId === "none" || !cards.some((c) => c.id === cardId)
          ? null
          : cardId,
      note: note.trim(),
      date,
    };
    if (transaction) updateTransaction(transaction.id, draft);
    else addTransaction(draft);
    router.back();
  };

  const confirmDelete = () =>
    Alert.alert(
      "Delete this transaction?",
      "The account balance will be adjusted back.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeTransaction(transaction!.id);
            router.back();
          },
        },
      ],
    );

  if (data.accounts.length === 0) {
    return (
      <FormScreen>
        <ThemedText type="smallBold">No accounts yet</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Transactions are recorded against an account. Add a bank and an
          account first.
        </ThemedText>
        <Link href="/accounts" asChild>
          <Pressable>
            <ThemedText type="linkPrimary">Go to Accounts</ThemedText>
          </Pressable>
        </Link>
      </FormScreen>
    );
  }

  return (
    <FormScreen>
      <ChipPicker
        label="Type"
        options={kindOptions}
        value={kind}
        onChange={changeKind}
      />
      <FormField
        label={`Amount (${currency})`}
        value={amountText}
        onChangeText={setAmountText}
        placeholder="0.00"
        keyboardType="decimal-pad"
        autoFocus={!transaction}
      />
      <ChipPicker
        label="Currency"
        options={currencyOptions}
        value={currency as (typeof CURRENCIES)[number]}
        onChange={setCurrency}
      />
      <ChipPicker
        label="Category"
        options={categoryOptions(kind)}
        value={category}
        onChange={setCategory}
      />
      <ChipPicker
        label="Account"
        options={accountOptions}
        value={accountId}
        onChange={changeAccount}
      />
      {cards.length > 0 && (
        <ChipPicker
          label="Card"
          options={cardOptions}
          value={cardId}
          onChange={setCardId}
        />
      )}
      <FormField
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder={
          kind === "debit" ? "e.g. Weekly shop" : "e.g. October paycheck"
        }
        autoCapitalize="sentences"
      />
      <FormField
        label="Date (YYYY-MM-DD)"
        value={dateText}
        onChangeText={setDateText}
        placeholder="2026-01-31"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <PrimaryButton
        title={transaction ? "Save changes" : `Add ${kind}`}
        onPress={save}
        disabled={!valid}
      />
      {transaction && (
        <PrimaryButton
          title="Delete transaction"
          onPress={confirmDelete}
          destructive
        />
      )}
    </FormScreen>
  );
}
