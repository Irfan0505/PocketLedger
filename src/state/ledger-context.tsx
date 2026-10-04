import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { EMPTY_LEDGER, type Account, type Bank, type Card, type LedgerData } from '@/domain/types';

const STORAGE_KEY = 'pocketledger:v1';

type Draft<T> = Omit<T, 'id' | 'createdAt'>;

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
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function patchById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LedgerData>(EMPTY_LEDGER);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setData({ ...EMPTY_LEDGER, ...(JSON.parse(raw) as Partial<LedgerData>) });
      })
      .catch((error) => console.warn('Failed to load ledger', error))
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.warn('Failed to save ledger', error),
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
      setData((prev) => ({ ...prev, banks: patchById<Bank>(prev.banks, id, patch) })),
    [],
  );

  const removeBank = useCallback(
    (id: string) =>
      setData((prev) => ({
        ...prev,
        banks: prev.banks.filter((b) => b.id !== id),
        accounts: prev.accounts.filter((a) => a.bankId !== id),
        cards: prev.cards.filter((c) => c.bankId !== id),
      })),
    [],
  );

  const addAccount = useCallback((draft: Draft<Account>) => {
    const account: Account = { ...draft, id: newId(), createdAt: Date.now() };
    setData((prev) => ({ ...prev, accounts: [...prev.accounts, account] }));
    return account;
  }, []);

  const updateAccount = useCallback(
    (id: string, patch: Partial<Draft<Account>>) =>
      setData((prev) => ({ ...prev, accounts: patchById<Account>(prev.accounts, id, patch) })),
    [],
  );

  const removeAccount = useCallback(
    (id: string) =>
      setData((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((a) => a.id !== id),
        cards: prev.cards.map((c) => (c.accountId === id ? { ...c, accountId: null } : c)),
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
      setData((prev) => ({ ...prev, cards: patchById<Card>(prev.cards, id, patch) })),
    [],
  );

  const removeCard = useCallback(
    (id: string) => setData((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.id !== id) })),
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
    ],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error('useLedger must be used inside LedgerProvider');
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
