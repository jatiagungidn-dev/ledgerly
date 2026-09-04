import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createAccount,
  createBudget,
  createCategory,
  createJournal,
  deleteAccount,
  deleteBudget,
  deleteCategory,
  getAccounts,
  getBudgets,
  getCategories,
  getJournals,
  getToken,
  login,
  register,
  setToken,
  updateAccount,
  updateBudget,
  updateCategory,
} from "./lib/api";
import type { Account, Budget, Category, EntryType, Journal } from "./types";

const money = (value: string | number, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );

function Icon({ name }: { name: "grid" | "wallet" | "tag" | "pie" | "arrow" | "plus" | "logout" }) {
  const paths: Record<string, string> = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    wallet: "M4 7.5h16v11H4zM6 7.5V5h12l2 2.5M16 13h4",
    tag: "M4 5.5V11l8.5 8.5L20 12l-8.5-8.5H6a2 2 0 0 0-2 2ZM7.5 7.5h.01",
    pie: "M12 3a9 9 0 1 0 9 9h-9V3ZM14 3a9 9 0 0 1 7 7h-7V3Z",
    arrow: "M5 12h13M13 7l5 5-5 5",
    plus: "M12 5v14M5 12h14",
    logout: "M10 6H5v12h5M15 8l4 4-4 4M19 12H9",
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else {
        await register(email, password);
        await login(email, password);
      }
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand large"><span className="brand-mark">L</span> ledgerly</div>
        <p className="eyebrow">PERSONAL FINANCE</p>
        <h1>{mode === "login" ? "Welcome back." : "Build your money system."}</h1>
        <p className="muted">
          {mode === "login"
            ? "Your finances, organized without the spreadsheet headache."
            : "Create your Ledgerly workspace and start tracking with intention."}
        </p>
        <form onSubmit={submit} className="stack">
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" /></label>
          <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Minimum 8 characters" /></label>
          {error && <div className="alert">{error}</div>}
          <button className="button primary full" disabled={busy}>{busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New to Ledgerly? Create an account" : "Already have an account? Sign in"}
        </button>
      </section>
      <aside className="auth-art">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="quote-card">
          <span className="eyebrow">LEDGERLY</span>
          <strong>Know where your money goes.</strong>
          <p>Accounts. Budgets. Categories. Journals. One clean system.</p>
        </div>
      </aside>
    </main>
  );
}

type Page = "overview" | "transactions" | "accounts" | "categories" | "budgets";

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [page, setPage] = useState<Page>("overview");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  async function refresh() {
    if (!getToken()) return;
    setLoading(true);
    try {
      const [a, c, b, j] = await Promise.all([getAccounts(), getCategories(), getBudgets(), getJournals()]);
      setAccounts(a); setCategories(c); setBudgets(b); setJournals(j);
    } catch (err) {
      if (getToken()) setToast(err instanceof Error ? err.message : "Failed to load data");
      else setAuthenticated(false);
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, [authenticated]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!authenticated) return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;

  const logout = () => { setToken(null); setAuthenticated(false); };

  const totalAssets = accounts.filter(a => a.type === "ASSET").reduce((s, a) => s + Number(a.balance), 0);
  const totalLiabilities = accounts.filter(a => a.type === "LIABILITY").reduce((s, a) => s + Number(a.balance), 0);
  const totalEquity = accounts.filter(a => a.type === "EQUITY").reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">L</span> ledgerly</div>
        <div className="workspace">PERSONAL WORKSPACE</div>
        <nav>
          {([
            ["overview", "Overview", "grid"],
            ["transactions", "Transactions", "arrow"],
            ["accounts", "Accounts", "wallet"],
            ["categories", "Categories", "tag"],
            ["budgets", "Budgets", "pie"],
          ] as const).map(([id, label, icon]) => (
            <button key={id} className={page === id ? "nav-item active" : "nav-item"} onClick={() => setPage(id)}>
              <Icon name={icon} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-profile"><div className="avatar">JA</div><div><strong>My Ledger</strong><span>Personal finance</span></div></div>
          <button className="nav-item" onClick={logout}><Icon name="logout" /><span>Sign out</span></button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">FRIDAY · SEPTEMBER 4, 2026</p>
            <h2>{page === "overview" ? "Good evening." : page[0].toUpperCase() + page.slice(1)}</h2>
          </div>
          <button className="button primary" onClick={() => setPage("transactions")}><Icon name="plus" /> New transaction</button>
        </header>

        {toast && <div className="toast">{toast}</div>}
        {loading && <div className="loading-line" />}

        {page === "overview" && (
          <Overview
            accounts={accounts}
            categories={categories}
            budgets={budgets}
            journals={journals}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            totalEquity={totalEquity}
            onNew={() => setPage("transactions")}
          />
        )}
        {page === "transactions" && (
          <Transactions journals={journals} accounts={accounts} categories={categories} onCreated={async () => { await refresh(); setToast("Transaction recorded."); }} />
        )}
        {page === "accounts" && (
          <Accounts accounts={accounts} onChanged={async () => { await refresh(); setToast("Accounts updated."); }} />
        )}
        {page === "categories" && (
          <Categories categories={categories} onChanged={async () => { await refresh(); setToast("Categories updated."); }} />
        )}
        {page === "budgets" && (
          <Budgets budgets={budgets} categories={categories} onChanged={async () => { await refresh(); setToast("Budgets updated."); }} />
        )}
      </main>
    </div>
  );
}

function Overview(props: {
  accounts: Account[]; categories: Category[]; budgets: Budget[]; journals: Journal[];
  totalAssets: number; totalLiabilities: number; totalEquity: number; onNew: () => void;
}) {
  const expenseCategories = props.categories.filter(c => c.type === "EXPENSE").length;
  return (
    <>
      <section className="hero-grid">
        <div className="hero-card">
          <div className="hero-copy">
            <span className="eyebrow">NET POSITION</span>
            <div className="hero-number">{money(props.totalAssets - props.totalLiabilities)}</div>
            <p>Assets minus liabilities</p>
          </div>
          <div className="ring"><span>{props.accounts.length}</span><small>accounts</small></div>
        </div>
        <div className="stat-card"><span className="eyebrow">ASSETS</span><strong>{money(props.totalAssets)}</strong><span className="stat-note">Across {props.accounts.filter(a => a.type === "ASSET").length} asset accounts</span></div>
        <div className="stat-card"><span className="eyebrow">LIABILITIES</span><strong>{money(props.totalLiabilities)}</strong><span className="stat-note">Across {props.accounts.filter(a => a.type === "LIABILITY").length} accounts</span></div>
      </section>

      <section className="section-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Latest journals</h3></div><button className="text-button" onClick={props.onNew}>Add transaction →</button></section>
      <div className="panel">
        {props.journals.length === 0 ? <Empty title="No transactions yet" text="Record your first transaction to see your financial activity here." action={props.onNew} /> :
          props.journals.slice(0, 6).map(j => <JournalRow key={j.id} journal={j} />)}
      </div>

      <section className="three-col">
        <div className="panel compact"><span className="eyebrow">BUDGETS</span><strong className="big">{props.budgets.length}</strong><p className="muted">Active budget plans</p><button className="link-button" onClick={() => {}}>Manage budgets →</button></div>
        <div className="panel compact"><span className="eyebrow">CATEGORIES</span><strong className="big">{props.categories.length}</strong><p className="muted">{expenseCategories} expense categories</p></div>
        <div className="panel compact"><span className="eyebrow">EQUITY</span><strong className="big">{money(props.totalEquity)}</strong><p className="muted">Current equity balance</p></div>
      </section>
    </>
  );
}

function JournalRow({ journal }: { journal: Journal }) {
  const amount = journal.entries.find(e => e.type === "DEBIT")?.amount ?? 0;
  return <div className="row">
    <div className="row-icon"><Icon name="arrow" /></div>
    <div className="row-main"><strong>{journal.description || "Journal entry"}</strong><span>{dateLabel(journal.occurredAt)} · {journal.entries.length} entries</span></div>
    <strong>{money(amount)}</strong>
  </div>;
}

function Empty({ title, text, action }: { title: string; text: string; action?: () => void }) {
  return <div className="empty"><div className="empty-mark">+</div><strong>{title}</strong><p>{text}</p>{action && <button className="button secondary" onClick={action}>Get started</button>}</div>;
}

function Transactions({ journals, accounts, categories, onCreated }: { journals: Journal[]; accounts: Account[]; categories: Category[]; onCreated: () => Promise<void> }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [debit, setDebit] = useState(accounts[0]?.id ?? "");
  const [credit, setCredit] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!debit && accounts[0]) setDebit(accounts[0].id); if (!credit && accounts[1]) setCredit(accounts[1]?.id ?? accounts[0]?.id); }, [accounts]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      if (!amount || !debit || !credit) throw new Error("Choose two accounts and enter an amount.");
      if (debit === credit) throw new Error("Debit and credit accounts must be different.");
      await createJournal({
        idempotencyKey: crypto.randomUUID(),
        description: description.trim() || undefined,
        occurredAt: new Date(date).toISOString(),
        entries: [
          { accountId: debit, categoryId: category || undefined, type: "DEBIT", amount },
          { accountId: credit, type: "CREDIT", amount },
        ],
      });
      setDescription(""); setAmount(""); setCategory("");
      await onCreated();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create transaction"); }
    finally { setBusy(false); }
  }

  return <div className="page-grid">
    <section>
      <div className="section-head"><div><span className="eyebrow">DOUBLE-ENTRY JOURNAL</span><h3>Record a transaction</h3></div></div>
      <form className="panel form-card" onSubmit={submit}>
        <div className="form-intro"><div className="form-number">01</div><div><strong>What happened?</strong><p>Ledgerly will keep the journal balanced for you.</p></div></div>
        <label>Description<input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Grocery shopping" /></label>
        <label>Amount<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" type="number" min="0.01" step="0.01" placeholder="0" required /></label>
        <div className="two-col">
          <label>Debit account<select value={debit} onChange={e => setDebit(e.target.value)} required><option value="">Select account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} · {a.type}</option>)}</select></label>
          <label>Credit account<select value={credit} onChange={e => setCredit(e.target.value)} required><option value="">Select account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} · {a.type}</option>)}</select></label>
        </div>
        <div className="two-col">
          <label>Category <span className="optional">optional</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">No category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} · {c.type}</option>)}</select></label>
          <label>Date<input value={date} onChange={e => setDate(e.target.value)} type="date" required /></label>
        </div>
        {error && <div className="alert">{error}</div>}
        <button className="button primary full" disabled={busy}>{busy ? "Recording..." : "Record transaction"}</button>
      </form>
    </section>
    <section>
      <div className="section-head"><div><span className="eyebrow">HISTORY</span><h3>Recent transactions</h3></div></div>
      <div className="panel">{journals.length ? journals.slice(0, 12).map(j => <JournalRow key={j.id} journal={j} />) : <Empty title="Nothing here yet" text="Your journal history will appear here." />}</div>
    </section>
  </div>;
}

function Accounts({ accounts, onChanged }: { accounts: Account[]; onChanged: () => Promise<void> }) {
  const [name, setName] = useState(""); const [type, setType] = useState<Account["type"]>("ASSET"); const [currency, setCurrency] = useState("IDR");
  const [error, setError] = useState("");
  async function add(e: FormEvent) { e.preventDefault(); try { await createAccount({ name, type, currency }); setName(""); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Could not create account"); } }
  async function edit(account: Account) { const next = window.prompt("Account name", account.name); if (next?.trim() && next !== account.name) { try { await updateAccount(account.id, next.trim()); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Update failed"); } } }
  async function remove(id: string) { if (!window.confirm("Delete this account?")) return; try { await deleteAccount(id); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); } }
  return <div className="page-grid">
    <section><div className="section-head"><div><span className="eyebrow">NEW ACCOUNT</span><h3>Create an account</h3></div></div>
      <form className="panel form-card" onSubmit={add}><label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Bank" required /></label><label>Type<select value={type} onChange={e => setType(e.target.value as Account["type"])}><option>ASSET</option><option>LIABILITY</option><option>EQUITY</option></select></label><label>Currency<input value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} maxLength={3} required /></label>{error && <div className="alert">{error}</div>}<button className="button primary full">Create account</button></form>
    </section>
    <section><div className="section-head"><div><span className="eyebrow">{accounts.length} ACCOUNTS</span><h3>Your accounts</h3></div></div><div className="cards-list">{accounts.map(a => <div className="account-card" key={a.id}><div className="account-top"><span className={`type-dot ${a.type.toLowerCase()}`}></span><span>{a.type}</span><div className="row-actions"><button onClick={() => edit(a)}>Edit</button><button onClick={() => remove(a.id)}>Delete</button></div></div><strong>{a.name}</strong><div className="account-balance">{money(a.balance, a.currency)}</div><span className="muted">{a.currency}</span></div>)}</div></section>
  </div>;
}

function Categories({ categories, onChanged }: { categories: Category[]; onChanged: () => Promise<void> }) {
  const [name, setName] = useState(""); const [type, setType] = useState<Category["type"]>("EXPENSE"); const [error, setError] = useState("");
  async function add(e: FormEvent) { e.preventDefault(); try { await createCategory({ name, type }); setName(""); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Could not create category"); } }
  async function edit(c: Category) { const next = window.prompt("Category name", c.name); if (next?.trim() && next !== c.name) { try { await updateCategory(c.id, next.trim()); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Update failed"); } } }
  async function remove(id: string) { if (!window.confirm("Delete this category?")) return; try { await deleteCategory(id); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); } }
  return <div className="page-grid">
    <section><div className="section-head"><div><span className="eyebrow">NEW CATEGORY</span><h3>Create a category</h3></div></div><form className="panel form-card" onSubmit={add}><label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Food" required /></label><label>Type<select value={type} onChange={e => setType(e.target.value as Category["type"])}><option>EXPENSE</option><option>REVENUE</option></select></label>{error && <div className="alert">{error}</div>}<button className="button primary full">Create category</button></form></section>
    <section><div className="section-head"><div><span className="eyebrow">{categories.length} CATEGORIES</span><h3>Classification</h3></div></div><div className="panel">{categories.map(c => <div className="row" key={c.id}><div className={`category-icon ${c.type.toLowerCase()}`}>{c.type === "EXPENSE" ? "−" : "+"}</div><div className="row-main"><strong>{c.name}</strong><span>{c.type}</span></div><div className="row-actions"><button onClick={() => edit(c)}>Edit</button><button onClick={() => remove(c.id)}>Delete</button></div></div>)}</div></section>
  </div>;
}

function Budgets({ budgets, categories, onChanged }: { budgets: Budget[]; categories: Category[]; onChanged: () => Promise<void> }) {
  const expenseCategories = categories.filter(c => c.type === "EXPENSE");
  const [amount, setAmount] = useState(""); const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? "");
  const [start, setStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10));
  const [end, setEnd] = useState(new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).toISOString().slice(0,10));
  const [error, setError] = useState("");
  useEffect(() => { if (!categoryId && expenseCategories[0]) setCategoryId(expenseCategories[0].id); }, [expenseCategories, categoryId]);
  async function add(e: FormEvent) { e.preventDefault(); try { await createBudget({ amount: Number(amount), categoryId, periodStart: new Date(start).toISOString(), periodEnd: new Date(end).toISOString() }); setAmount(""); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Could not create budget"); } }
  async function remove(id: string) { if (!window.confirm("Delete this budget?")) return; try { await deleteBudget(id); await onChanged(); } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); } }
  return <div className="page-grid"><section><div className="section-head"><div><span className="eyebrow">NEW BUDGET</span><h3>Plan your spending</h3></div></div><form className="panel form-card" onSubmit={add}><label>Budget amount<input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0.01" step="0.01" placeholder="0" required /></label><label>Expense category<select value={categoryId} onChange={e => setCategoryId(e.target.value)} required><option value="">Select category</option>{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><div className="two-col"><label>Starts<input value={start} onChange={e => setStart(e.target.value)} type="date" required /></label><label>Ends<input value={end} onChange={e => setEnd(e.target.value)} type="date" required /></label></div>{error && <div className="alert">{error}</div>}<button className="button primary full">Create budget</button></form></section><section><div className="section-head"><div><span className="eyebrow">{budgets.length} PLANS</span><h3>Budget periods</h3></div></div><div className="cards-list">{budgets.map(b => { const c=categories.find(x=>x.id===b.categoryId); return <div className="budget-card" key={b.id}><div className="budget-head"><div><strong>{c?.name ?? "Unknown category"}</strong><span>{dateLabel(b.periodStart)} — {dateLabel(b.periodEnd)}</span></div><button onClick={() => remove(b.id)}>Delete</button></div><strong className="budget-amount">{money(b.amount)}</strong><div className="progress"><span style={{width:"0%"}} /></div><span className="muted">No spending linked yet</span></div>})}</div></section></div>;
}

export default App;