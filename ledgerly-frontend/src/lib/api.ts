import type {
  Account,
  Budget,
  Category,
  Journal,
  JournalInput,
  User,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

type Envelope<T> = {
  data: T;
  count?: number;
  message?: string;
};

let token = localStorage.getItem("ledgerly_token");

export function setToken(next: string | null) {
  token = next;
  if (next) localStorage.setItem("ledgerly_token", next);
  else localStorage.removeItem("ledgerly_token");
}

export function getToken() {
  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) setToken(null);
    throw new Error(body.message ?? "Something went wrong");
  }

  return body as T;
}

export async function login(email: string, password: string) {
  const body = await request<Envelope<{ token: string }>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(body.data.token);
  return body.data.token;
}

export async function register(email: string, password: string) {
  return request<Envelope<{ user: User }>>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAccounts() {
  const body = await request<Envelope<{ accounts: Account[] }>>("/account");
  return body.data.accounts;
}

export async function createAccount(data: {
  name: string;
  type: Account["type"];
  currency: string;
}) {
  const body = await request<Envelope<{ account: Account }>>("/account", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return body.data.account;
}

export async function updateAccount(id: string, name: string) {
  const body = await request<Envelope<{ updated: Account }>>(`/account/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  return body.data.updated;
}

export async function deleteAccount(id: string) {
  await request(`/account/${id}`, { method: "DELETE" });
}

export async function getCategories() {
  const body = await request<Envelope<{ categories: Category[] }>>("/category");
  return body.data.categories;
}

export async function createCategory(data: { name: string; type: Category["type"] }) {
  const body = await request<Envelope<{ category: Category }>>("/category", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return body.data.category;
}

export async function updateCategory(id: string, name: string) {
  const body = await request<Envelope<{ category: Category }>>(`/category/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  return body.data.category;
}

export async function deleteCategory(id: string) {
  await request(`/category/${id}`, { method: "DELETE" });
}

export async function getBudgets() {
  const body = await request<Envelope<{ budgets: Budget[] }>>("/budget");
  return body.data.budgets;
}

export async function createBudget(data: {
  amount: number;
  categoryId: string;
  periodStart: string;
  periodEnd: string;
}) {
  const body = await request<Envelope<Budget>>("/budget", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return body.data;
}

export async function updateBudget(id: string, data: Partial<{
  amount: number;
  categoryId: string;
  periodStart: string;
  periodEnd: string;
}>) {
  const body = await request<Envelope<Budget>>(`/budget/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return body.data;
}

export async function deleteBudget(id: string) {
  await request(`/budget/${id}`, { method: "DELETE" });
}

export async function getJournals() {
  const body = await request<Envelope<{ journals: Journal[] }>>("/journal");
  return body.data.journals;
}

export async function getJournal(id: string) {
  const body = await request<Envelope<{ journal: Journal }>>(`/journal/${id}`);
  return body.data.journal;
}

export async function createJournal(data: JournalInput) {
  const body = await request<Envelope<{ journal: Journal }>>("/journal", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return body.data.journal;
}