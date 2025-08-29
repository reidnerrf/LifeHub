import { storage, KEYS } from './services/storage';

export type Subscription = { plan: 'monthly'|'annual'|'lifetime'|'trial'; startedAt?: string; durationDays?: number } | null;

export function getSubscription(): Subscription {
  return storage.get(KEYS.subscription) as any || null;
}

export function getTrialInfo(sub: Subscription) {
  if (!sub || sub.plan !== 'trial') return null;
  const started = new Date(sub.startedAt || Date.now());
  const duration = Number(sub.durationDays || 7);
  const end = new Date(started.getTime() + duration * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msLeft = end.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
  const expired = msLeft <= 0;
  return { daysLeft, expired, end };
}

export function isPremiumActive(): boolean {
  const sub = getSubscription();
  if (!sub) return false;
  if (sub.plan === 'lifetime' || sub.plan === 'monthly' || sub.plan === 'annual') return true;
  const info = getTrialInfo(sub);
  return !!info && !info.expired;
}

