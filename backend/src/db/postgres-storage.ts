/**
 * PostgreSQL Storage Implementation
 * Replaces JSON file storage with persistent database
 */

import { Pool } from 'pg';

export interface User {
  userId: string;
  email: string;
  apiKey: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Agent {
  agentId: string;
  userId: string;
  ownerEmail: string;
  name: string;
  createdAt: string;
}

export interface WaitlistEntry {
  email: string;
  name?: string;
  signupDate: string;
  status: string;
  notes?: string;
}

export class PostgresStorage {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }, // Supabase requires SSL
    });
  }

  // ==================== Users ====================

  async upsertUser(email: string): Promise<User> {
    const userId = 'user_' + this.generateId();
    const apiKey = 'opay_' + this.generateApiKey();

    const result = await this.pool.query(
      `INSERT INTO users (user_id, email, api_key, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (email) 
       DO UPDATE SET updated_at = NOW()
       RETURNING user_id, email, api_key, created_at, updated_at`,
      [userId, email, apiKey]
    );

    const row = result.rows[0];
    return {
      userId: row.user_id,
      email: row.email,
      apiKey: row.api_key,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      userId: row.user_id,
      email: row.email,
      apiKey: row.api_key,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      userId: row.user_id,
      email: row.email,
      apiKey: row.api_key,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }

  async getUserByApiKey(apiKey: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE api_key = $1',
      [apiKey]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      userId: row.user_id,
      email: row.email,
      apiKey: row.api_key,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.pool.query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return result.rows.map(row => ({
      userId: row.user_id,
      email: row.email,
      apiKey: row.api_key,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    }));
  }

  // ==================== Agents ====================

  async registerAgent(agentId: string, userId: string, name: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    await this.pool.query(
      `INSERT INTO agents (agent_id, user_id, owner_email, name, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (agent_id, user_id) DO NOTHING`,
      [agentId, userId, user.email, name]
    );
  }

  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    const result = await this.pool.query(
      'SELECT * FROM agents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(row => ({
      agentId: row.agent_id,
      userId: row.user_id,
      ownerEmail: row.owner_email,
      name: row.name,
      createdAt: row.created_at.toISOString(),
    }));
  }

  async getAllAgents(): Promise<Agent[]> {
    const result = await this.pool.query(
      'SELECT * FROM agents ORDER BY created_at DESC'
    );
    return result.rows.map(row => ({
      agentId: row.agent_id,
      userId: row.user_id,
      ownerEmail: row.owner_email,
      name: row.name,
      createdAt: row.created_at.toISOString(),
    }));
  }

  async userOwnsAgent(userId: string, agentId: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT 1 FROM agents WHERE agent_id = $1 AND user_id = $2',
      [agentId, userId]
    );
    return result.rows.length > 0;
  }

  async deleteAgent(agentId: string, userId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM agents WHERE agent_id = $1 AND user_id = $2',
      [agentId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ==================== Waitlist ====================

  async addWaitlistSignup(email: string, name?: string): Promise<WaitlistEntry> {
    const result = await this.pool.query(
      `INSERT INTO waitlist (email, name, signup_date, status)
       VALUES ($1, $2, NOW(), 'pending')
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [email, name || null]
    );

    if (result.rows.length === 0) {
      throw new Error('Email already on waitlist');
    }

    const row = result.rows[0];
    return {
      email: row.email,
      name: row.name,
      signupDate: row.signup_date.toISOString(),
      status: row.status,
      notes: row.notes,
    };
  }

  async getAllWaitlist(): Promise<WaitlistEntry[]> {
    const result = await this.pool.query(
      'SELECT * FROM waitlist ORDER BY signup_date DESC'
    );
    return result.rows.map(row => ({
      email: row.email,
      name: row.name,
      signupDate: row.signup_date.toISOString(),
      status: row.status,
      notes: row.notes,
    }));
  }

  async updateWaitlistStatus(email: string, status: string, notes?: string): Promise<WaitlistEntry | null> {
    const result = await this.pool.query(
      `UPDATE waitlist SET status = $1, notes = $2 WHERE email = $3 RETURNING *`,
      [status, notes || null, email]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      email: row.email,
      name: row.name,
      signupDate: row.signup_date.toISOString(),
      status: row.status,
      notes: row.notes,
    };
  }

  // ==================== Utilities ====================

  private generateId(): string {
    return require('crypto').createHash('md5')
      .update(Date.now() + Math.random().toString())
      .digest('hex');
  }

  private generateApiKey(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
