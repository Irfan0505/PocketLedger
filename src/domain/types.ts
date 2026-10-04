export type AccountType = 'checking' | 'savings' | 'other';
export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'other';

export type Bank = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

export type Account = {
  id: string;
  bankId: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: number;
};

export type Card = {
  id: string;
  bankId: string;
  accountId: string | null;
  nickname: string;
  last4: string;
  network: CardNetwork;
  expiry: string;
  createdAt: number;
};

export type LedgerData = {
  currency: string;
  banks: Bank[];
  accounts: Account[];
  cards: Card[];
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  other: 'Other',
};

export const CARD_NETWORK_LABELS: Record<CardNetwork, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  rupay: 'RuPay',
  other: 'Other',
};

export const BANK_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#16A34A',
  '#0D9488',
  '#0891B2',
  '#475569',
] as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD', 'CAD', 'AUD'] as const;

export const EMPTY_LEDGER: LedgerData = { currency: 'USD', banks: [], accounts: [], cards: [] };
