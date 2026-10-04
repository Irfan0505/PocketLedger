import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { periodRange, type Period } from "@/domain/period";
import {
    EMPTY_LEDGER,
    signedAmount,
    type Account,
    type Bank,
    type Card,
    type CategoryKey,
    type LedgerData,
    type Transaction,
    type TransactionKind,
} from "@/domain/types";

const STORAGE_KEY = "pocketledger:v1";

type Draft<T> = Omit<T, "id" | "createdAt">;

type LedgerContextValue = {
  data: LedgerData;
  ready: boolean;
  setCurrency: (currency: string) => void;
  addBank: (draft: Draft<Bank>) => Bank;
  updateBank: (id: string, patch: Partial<Draft<Bank>>) => void;
  removeBank: (id: string) => void;
  addAccount: (draft: Draft<Account>) => Account;
  updateAccount: (id: string, patch: Partial<Draft<Account>>) => void;
  removeAccount: (id: string) => void;
  addCard: (draft: Draft<Card>) => Card;
  updateCard: (id: string, patch: Partial<Draft<Card>>) => void;
  removeCard: (id: string) => void;
  addTransaction: (draft: Draft<Transaction>) => Transaction;
  updateTransaction: (id: string, patch: Partial<Draft<Transaction>>) => void;
  removeTransaction: (id: string) => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function patchById<T extends { id: string }>(
  list: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function applyDelta(
  accounts: Account[],
  accountId: string,
  delta: number,
): Account[] {
  if (delta === 0) return accounts;
  return accounts.map((a) =>
    a.id === accountId
      ? { ...a, balance: Math.round((a.balance + delta) * 100) / 100 }
      : a,
  );
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LedgerData>(EMPTY_LEDGER);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw)
          setData({
            ...EMPTY_LEDGER,
            ...(JSON.parse(raw) as Partial<LedgerData>),
          });
      })
      .catch((error) => console.warn("Failed to load ledger", error))
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.warn("Failed to save ledger", error),
    );
  }, [data]);

  const setCurrency = useCallback(
    (currency: string) => setData((prev) => ({ ...prev, currency })),
    [],
  );

  const addBank = useCallback((draft: Draft<Bank>) => {
    const bank: Bank = { ...draft, id: newId(), createdAt: Date.now() };
    setData((prev) => ({ ...prev, banks: [...prev.banks, bank] }));
    return bank;
  }, []);

  const updateBank = useCallback(
    (id: string, patch: Partial<Draft<Bank>>) =>
      setData((prev) => ({
        ...prev,
        banks: patchById<Bank>(prev.banks, id, patch),
      })),
    [],
  );

  const removeBank = useCallback(
    (id: string) =>
      setData((prev) => {
        const removedAccounts = new Set(
          prev.accounts.filter((a) => a.bankId === id).map((a) => a.id),
        );
        return {
          ...prev,
          banks: prev.banks.filter((b) => b.id !== id),
          accounts: prev.accounts.filter((a) => a.bankId !== id),
          cards: prev.cards.filter((c) => c.bankId !== id),
          transactions: prev.transactions.filter(
            (t) => !removedAccounts.has(t.accountId),
          ),
        };
      }),
    [],
  );

  const addAccount = useCallback((draft: Draft<Account>) => {
    const account: Account = { ...draft, id: newId(), createdAt: Date.now() };
    setData((prev) => ({ ...prev, accounts: [...prev.accounts, account] }));
    return account;
  }, []);

  const updateAccount = useCallback(
    (id: string, patch: Partial<Draft<Account>>) =>
      setData((prev) => ({
        ...prev,
        accounts: patchById<Account>(prev.accounts, id, patch),
      })),
    [],
  );

  const removeAccount = useCallback(
    (id: string) =>
      setData((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((a) => a.id !== id),
        cards: prev.cards.map((c) =>
          c.accountId === id ? { ...c, accountId: null } : c,
        ),
        transactions: prev.transactions.filter((t) => t.accountId !== id),
      })),
    [],
  );

  const addCard = useCallback((draft: Draft<Card>) => {
    const card: Card = { ...draft, id: newId(), createdAt: Date.now() };
    setData((prev) => ({ ...prev, cards: [...prev.cards, card] }));
    return card;
  }, []);

  const updateCard = useCallback(
    (id: string, patch: Partial<Draft<Card>>) =>
      setData((prev) => ({
        ...prev,
        cards: patchById<Card>(prev.cards, id, patch),
      })),
    [],
  );

  const removeCard = useCallback(
    (id: string) =>
      setData((prev) => ({
        ...prev,
        cards: prev.cards.filter((c) => c.id !== id),
        transactions: prev.transactions.map((t) =>
          t.cardId === id ? { ...t, cardId: null } : t,
        ),
      })),
    [],
  );

  const addTransaction = useCallback((draft: Draft<Transaction>) => {
    const tx: Transaction = { ...draft, id: newId(), createdAt: Date.now() };
    setData((prev) => ({
      ...prev,
      accounts: applyDelta(prev.accounts, tx.accountId, signedAmount(tx)),
      transactions: [...prev.transactions, tx],
    }));
    return tx;
  }, []);

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Draft<Transaction>>) =>
      setData((prev) => {
        const old = prev.transactions.find((t) => t.id === id);
        if (!old) return prev;
        const next = { ...old, ...patch };
        let accounts = applyDelta(
          prev.accounts,
          old.accountId,
          -signedAmount(old),
        );
        accounts = applyDelta(accounts, next.accountId, signedAmount(next));
        return {
          ...prev,
          accounts,
          transactions: patchById<Transaction>(prev.transactions, id, patch),
        };
      }),
    [],
  );

  const removeTransaction = useCallback(
    (id: string) =>
      setData((prev) => {
        const old = prev.transactions.find((t) => t.id === id);
        if (!old) return prev;
        return {
          ...prev,
          accounts: applyDelta(
            prev.accounts,
            old.accountId,
            -signedAmount(old),
          ),
          transactions: prev.transactions.filter((t) => t.id !== id),
        };
      }),
    [],
  );

  const value = useMemo<LedgerContextValue>(
    () => ({
      data,
      ready,
      setCurrency,
      addBank,
      updateBank,
      removeBank,
      addAccount,
      updateAccount,
      removeAccount,
      addCard,
      updateCard,
      removeCard,
      addTransaction,
      updateTransaction,
      removeTransaction,
    }),
    [
      data,
      ready,
      setCurrency,
      addBank,
      updateBank,
      removeBank,
      addAccount,
      updateAccount,
      removeAccount,
      addCard,
      updateCard,
      removeCard,
      addTransaction,
      updateTransaction,
      removeTransaction,
    ],
  );

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
}

export function useBankSummary(bankId: string) {
  const { data } = useLedger();
  return useMemo(() => {
    const accounts = data.accounts.filter((a) => a.bankId === bankId);
    const cards = data.cards.filter((c) => c.bankId === bankId);
    const total = accounts.reduce((sum, a) => sum + a.balance, 0);
    return { accounts, cards, total };
  }, [data, bankId]);
}

export function useTransactions({
  period,
  anchor,
  category = "all",
  kind = "all",
}: {
  period: Period;
  anchor: Date;
  category?: CategoryKey | "all";
  kind?: TransactionKind | "all";
}) {
  const { data } = useLedger();
  const anchorTime = anchor.getTime();
  return useMemo(() => {
    const { start, end } = periodRange(period, new Date(anchorTime));
    const inRange = data.transactions.filter(
      (t) =>
        t.date >= start && t.date < end && (kind === "all" || t.kind === kind),
    );
    const currencyOf = (t: Transaction) => t.currency || data.currency;
    const byCategory = new Set<CategoryKey>();
    const categoryTotals = new Map<CategoryKey, number>();
    for (const t of inRange) {
      byCategory.add(t.category);
      if (currencyOf(t) === data.currency) {
        categoryTotals.set(
          t.category,
          (categoryTotals.get(t.category) ?? 0) + t.amount,
        );
      }
    }
    const active: CategoryKey | "all" =
      category !== "all" && byCategory.has(category) ? category : "all";
    const items = (
      active === "all" ? inRange : inRange.filter((t) => t.category === active)
    ).sort((a, b) => b.date - a.date || b.createdAt - a.createdAt);
    const spent = sumByCurrency(
      items.filter((t) => t.kind === "debit"),
      currencyOf,
    );
    const received = sumByCurrency(
      items.filter((t) => t.kind === "credit"),
      currencyOf,
    );
    const net = new Map(received);
    for (const [cur, amount] of spent)
      net.set(cur, (net.get(cur) ?? 0) - amount);
    return {
      items,
      spent,
      received,
      net,
      byCategory,
      categoryTotals,
      category: active,
      inRangeCount: inRange.length,
    };
  }, [data.transactions, data.currency, period, anchorTime, category, kind]);
}

export type CurrencyTotals = Map<string, number>;

function sumByCurrency(
  list: Transaction[],
  currencyOf: (t: Transaction) => string,
): CurrencyTotals {
  const totals: CurrencyTotals = new Map();
  for (const t of list) {
    const cur = currencyOf(t);
    totals.set(
      cur,
      Math.round(((totals.get(cur) ?? 0) + t.amount) * 100) / 100,
    );
  }
  return totals;
}
