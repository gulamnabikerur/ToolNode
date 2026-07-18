import { DAILY_AI_CREDIT_LIMIT } from './constants';

/** Alias for components that import DAILY_LIMIT directly */
export const DAILY_LIMIT = DAILY_AI_CREDIT_LIMIT;

/** Convenience wrapper */
export function getRemainingCredits(): number {
  return getCredits().remaining;
}

const CREDIT_STORAGE_KEY = 'toolsai_credits';

interface CreditData {
  used: number;
  lastReset: string; // ISO date string (date only)
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadCredits(): CreditData {
  if (typeof window === 'undefined') return { used: 0, lastReset: getTodayString() };
  try {
    const raw = localStorage.getItem(CREDIT_STORAGE_KEY);
    if (!raw) return { used: 0, lastReset: getTodayString() };
    const data: CreditData = JSON.parse(raw);
    // Reset if it's a new day
    if (data.lastReset !== getTodayString()) {
      return { used: 0, lastReset: getTodayString() };
    }
    return data;
  } catch {
    return { used: 0, lastReset: getTodayString() };
  }
}

function saveCredits(data: CreditData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CREDIT_STORAGE_KEY, JSON.stringify(data));
}

export function getCredits(): { used: number; limit: number; remaining: number } {
  const data = loadCredits();
  return {
    used: data.used,
    limit: DAILY_AI_CREDIT_LIMIT,
    remaining: Math.max(0, DAILY_AI_CREDIT_LIMIT - data.used),
  };
}

export function hasCreditsRemaining(): boolean {
  return getCredits().remaining > 0;
}

export function consumeCredit(): boolean {
  const data = loadCredits();
  if (data.used >= DAILY_AI_CREDIT_LIMIT) return false;
  data.used += 1;
  saveCredits(data);
  return true;
}

export function resetCredits(): void {
  saveCredits({ used: 0, lastReset: getTodayString() });
}
