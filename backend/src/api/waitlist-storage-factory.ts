/**
 * Waitlist Storage Factory
 * Uses PostgreSQL if DATABASE_URL is set, otherwise falls back to JSON
 */

import { userStorage } from '../auth/storage-factory';

// Waitlist methods are now part of the main storage
export const waitlistStorage = {
  addSignup: async (email: string, name?: string) => {
    return await (userStorage as any).addWaitlistSignup(email, name);
  },
  getAll: async () => {
    return await (userStorage as any).getAllWaitlist();
  },
  update: async (email: string, updates: any) => {
    return await (userStorage as any).updateWaitlistStatus(email, updates.status, updates.notes);
  },
};
