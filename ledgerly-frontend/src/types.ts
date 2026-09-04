export type AccountType = "ASSET" | "LIABILITY" | "EQUITY";
export type CategoryType = "EXPENSE" | "REVENUE";
export type EntryType = "DEBIT" | "CREDIT";

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: string | number;
  userId: string;
  categoryId: string;
  periodStart: string;
  periodEnd: string;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  categoryId?: string | null;
  type: EntryType;
  amount: string | number;
  account?: Account;
  category?: Category | null;
}

export interface Journal {
  id: string;
  idempotencyKey: string;
  description?: string | null;
  occurredAt: string;
  userId: string;
  createdAt: string;
  entries: LedgerEntry[];
}

export interface ApiError {
  status: "fail" | "error";
  message: string;
  error?: Record<string, string[]>;
}

export interface JournalInput {
  idempotencyKey: string;
  description?: string;
  occurredAt: string;
  entries: Array<{
    accountId: string;
    categoryId?: string;
    type: EntryType;
    amount: string;
  }>;
}