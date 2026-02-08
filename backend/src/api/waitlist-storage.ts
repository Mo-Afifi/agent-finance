/**
 * Waitlist Storage Layer
 * 
 * Manages waitlist signups in JSON file
 */

import fs from 'fs/promises';
import path from 'path';

export interface WaitlistEntry {
  email: string;
  name?: string;
  signupDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const WAITLIST_FILE = path.join(__dirname, '../../data/waitlist.json');

class WaitlistStorage {
  
  /**
   * Read all waitlist entries
   */
  async getAll(): Promise<WaitlistEntry[]> {
    try {
      const data = await fs.readFile(WAITLIST_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty array
        return [];
      }
      throw error;
    }
  }

  /**
   * Save waitlist entries
   */
  private async save(entries: WaitlistEntry[]): Promise<void> {
    await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  }

  /**
   * Add a new signup
   */
  async addSignup(email: string, name?: string): Promise<WaitlistEntry> {
    const entries = await this.getAll();
    
    // Check for duplicate
    const existing = entries.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email already on waitlist');
    }

    const newEntry: WaitlistEntry = {
      email: email.toLowerCase(),
      name,
      signupDate: new Date().toISOString(),
      status: 'pending',
    };

    entries.push(newEntry);
    await this.save(entries);

    return newEntry;
  }

  /**
   * Get a specific entry by email
   */
  async getByEmail(email: string): Promise<WaitlistEntry | null> {
    const entries = await this.getAll();
    return entries.find(e => e.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Update an entry
   */
  async update(email: string, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry | null> {
    const entries = await this.getAll();
    const index = entries.findIndex(e => e.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      return null;
    }

    // Merge updates (but prevent email changes)
    entries[index] = {
      ...entries[index],
      ...updates,
      email: entries[index].email, // Keep original email
    };

    await this.save(entries);
    return entries[index];
  }

  /**
   * Delete an entry
   */
  async delete(email: string): Promise<boolean> {
    const entries = await this.getAll();
    const filtered = entries.filter(e => e.email.toLowerCase() !== email.toLowerCase());

    if (filtered.length === entries.length) {
      return false; // No entry found
    }

    await this.save(filtered);
    return true;
  }

  /**
   * Get stats by status
   */
  async getStats(): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    const entries = await this.getAll();
    
    return {
      total: entries.length,
      pending: entries.filter(e => e.status === 'pending').length,
      approved: entries.filter(e => e.status === 'approved').length,
      rejected: entries.filter(e => e.status === 'rejected').length,
    };
  }
}

export const waitlistStorage = new WaitlistStorage();
