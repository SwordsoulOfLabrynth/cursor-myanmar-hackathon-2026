import type {
  CustomerContext,
  CustomerId,
  HistoryEvent,
} from "../shared/api-contract.ts";
import { getCustomerContext } from "../shared/demoCatalog.ts";

const ACCOUNTS_KEY = "atom-mind-accounts";
export const SESSION_KEY = "atom-mind-session";
const DEMO_IDS = ["su-su", "ko-ko", "ma-ma"] as const;

export type Account = CustomerContext & {
  isDemo: boolean;
};

function cloneContext(context: CustomerContext): CustomerContext {
  return JSON.parse(JSON.stringify(context)) as CustomerContext;
}

function seedAccounts(): Account[] {
  return DEMO_IDS.map((id) => ({
    ...cloneContext(getCustomerContext(id)),
    isDemo: true,
  }));
}

function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<Account>;
  return (
    typeof account.id === "string" &&
    typeof account.displayName === "string" &&
    typeof account.phoneMasked === "string" &&
    Array.isArray(account.history) &&
    typeof account.usage === "object" &&
    account.usage !== null
  );
}

export function loadAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isAccount)) return parsed;
    } catch {
      localStorage.removeItem(ACCOUNTS_KEY);
    }
  }
  const accounts = seedAccounts();
  saveAccounts(accounts);
  return accounts;
}

function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getAccount(accountId: CustomerId): Account | null {
  return loadAccounts().find((account) => account.id === accountId) ?? null;
}

export function getSessionAccount(): Account | null {
  const accountId = localStorage.getItem(SESSION_KEY);
  return accountId ? getAccount(accountId) : null;
}

export function startSession(accountId: CustomerId): Account | null {
  const account = getAccount(accountId);
  if (account) localStorage.setItem(SESSION_KEY, account.id);
  return account;
}

export function endSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function createAccount(name: string, phone: string): Account {
  const starter = cloneContext(getCustomerContext("ma-ma"));
  const normalizedName = name.trim();
  const normalizedPhone = phone.replace(/\s+/g, " ").trim();
  const id = `account-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const account: Account = {
    ...starter,
    id,
    displayName: normalizedName,
    displayNameMm: normalizedName,
    phoneMasked: normalizedPhone,
    previousPlanNameMm: "Starter synthetic profile",
    history: [
      {
        id: `created-${Date.now()}`,
        dateLabel: new Date().toISOString().slice(0, 10),
        eventMm: "Hackathon demo အကောင့် ဖန်တီးထားသည်",
        eventEn: "Created hackathon demo account",
      },
    ],
    isDemo: false,
  };
  const accounts = [...loadAccounts(), account];
  saveAccounts(accounts);
  return account;
}

export function appendHistory(
  accountId: CustomerId,
  event: Omit<HistoryEvent, "id" | "dateLabel">,
): Account | null {
  const accounts = loadAccounts();
  const index = accounts.findIndex((account) => account.id === accountId);
  if (index < 0) return null;
  const current = accounts[index]!;
  const updated: Account = {
    ...current,
    history: [
      {
        id: `action-${Date.now()}`,
        dateLabel: new Date().toISOString().slice(0, 10),
        ...event,
      },
      ...current.history,
    ],
  };
  accounts[index] = updated;
  saveAccounts(accounts);
  return updated;
}
