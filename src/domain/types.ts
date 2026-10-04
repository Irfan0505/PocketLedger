export type AccountType = "checking" | "savings" | "other";
export type CardNetwork = "visa" | "mastercard" | "amex" | "rupay" | "other";

export type Bank = {
  id: string;
  name: string;
  color: string;
  logo?: string | null;
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

export type TransactionKind = "debit" | "credit";

export type CategoryKey =
  | "groceries"
  | "dining"
  | "subscriptions"
  | "gas"
  | "transport"
  | "shopping"
  | "bills"
  | "health"
  | "entertainment"
  | "other"
  | "salary"
  | "refund"
  | "transfer_in"
  | "gift"
  | "other_income";

export type Transaction = {
  id: string;
  kind: TransactionKind;
  amount: number;
  currency: string;
  category: CategoryKey;
  accountId: string;
  cardId: string | null;
  note: string;
  date: number;
  createdAt: number;
};

export type LedgerData = {
  currency: string;
  banks: Bank[];
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
};

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; kind: TransactionKind; color: string }
> = {
  groceries: { label: "Groceries", kind: "debit", color: "#16A34A" },
  dining: { label: "Dining", kind: "debit", color: "#EA580C" },
  subscriptions: { label: "Subscriptions", kind: "debit", color: "#7C3AED" },
  gas: { label: "Gas", kind: "debit", color: "#CA8A04" },
  transport: { label: "Transport", kind: "debit", color: "#0891B2" },
  shopping: { label: "Shopping", kind: "debit", color: "#DB2777" },
  bills: { label: "Bills", kind: "debit", color: "#DC2626" },
  health: { label: "Health", kind: "debit", color: "#0D9488" },
  entertainment: { label: "Entertainment", kind: "debit", color: "#2563EB" },
  other: { label: "Other", kind: "debit", color: "#475569" },
  salary: { label: "Salary", kind: "credit", color: "#16A34A" },
  refund: { label: "Refund", kind: "credit", color: "#0891B2" },
  transfer_in: { label: "Transfer", kind: "credit", color: "#2563EB" },
  gift: { label: "Gift", kind: "credit", color: "#DB2777" },
  other_income: { label: "Other income", kind: "credit", color: "#475569" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export function categoriesFor(kind: TransactionKind) {
  return CATEGORY_KEYS.filter((key) => CATEGORIES[key].kind === kind);
}

export function signedAmount(tx: Pick<Transaction, "kind" | "amount">) {
  return tx.kind === "debit" ? -tx.amount : tx.amount;
}

export const TRANSACTION_KIND_LABELS: Record<TransactionKind, string> = {
  debit: "Debit",
  credit: "Credit",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  other: "Other",
};

export const CARD_NETWORK_LABELS: Record<CardNetwork, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  rupay: "RuPay",
  other: "Other",
};

export const BANK_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0D9488",
  "#0891B2",
  "#475569",
] as const;

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "AED",
  "SGD",
  "CAD",
  "AUD",
] as const;

export const EMPTY_LEDGER: LedgerData = {
  currency: "USD",
  banks: [],
  accounts: [],
  cards: [],
  transactions: [],
};
