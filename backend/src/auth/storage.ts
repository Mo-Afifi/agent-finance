/**
 * User Storage Layer
 * 
 * MVP: JSON file-based storage
 * TODO: Migrate to production database (PostgreSQL/MySQL)
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface User {
  userId: string;
  email: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAgent {
  agentId: string;
  userId: string;
  ownerEmail: string;
  name: string;
  createdAt: string;
}

class UserStorage {
  private users: Map<string, User> = new Map();
  private emailToUserId: Map<string, string> = new Map();
  private apiKeyToUserId: Map<string, string> = new Map();
  private agents: Map<string, UserAgent> = new Map();
  private initialized = false;

  /**
   * Initialize storage - load from JSON file
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure data directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });

      // Load users from file
      try {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        
        // Rebuild in-memory maps
        for (const user of parsed.users || []) {
          this.users.set(user.userId, user);
          this.emailToUserId.set(user.email, user.userId);
          this.apiKeyToUserId.set(user.apiKey, user.userId);
        }

        // Load agents
        for (const agent of parsed.agents || []) {
          this.agents.set(agent.agentId, agent);
        }
      } catch (err: any) {
        // File doesn't exist yet - that's fine
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize user storage:', error);
      throw error;
    }
  }

  /**
   * Persist storage to JSON file
   */
  private async persist(): Promise<void> {
    const data = {
      users: Array.from(this.users.values()),
      agents: Array.from(this.agents.values()),
    };
    
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Generate a new API key
   */
  private generateApiKey(): string {
    const random = randomBytes(32).toString('hex');
    return `opay_${random}`;
  }

  /**
   * Create or get user by email
   */
  async upsertUser(email: string): Promise<User> {
    await this.init();

    // Check if user exists
    const existingUserId = this.emailToUserId.get(email);
    if (existingUserId) {
      const user = this.users.get(existingUserId);
      if (user) return user;
    }

    // Create new user
    const userId = `user_${randomBytes(16).toString('hex')}`;
    const apiKey = this.generateApiKey();
    const now = new Date().toISOString();

    const user: User = {
      userId,
      email,
      apiKey,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(userId, user);
    this.emailToUserId.set(email, userId);
    this.apiKeyToUserId.set(apiKey, userId);

    await this.persist();

    return user;
  }

  /**
   * Get user by API key
   */
  async getUserByApiKey(apiKey: string): Promise<User | null> {
    await this.init();

    const userId = this.apiKeyToUserId.get(apiKey);
    if (!userId) return null;

    return this.users.get(userId) || null;
  }

  /**
   * Get user by userId
   */
  async getUserById(userId: string): Promise<User | null> {
    await this.init();
    return this.users.get(userId) || null;
  }

  /**
   * Regenerate API key for user
   */
  async regenerateApiKey(userId: string): Promise<User | null> {
    await this.init();

    const user = this.users.get(userId);
    if (!user) return null;

    // Remove old API key mapping
    this.apiKeyToUserId.delete(user.apiKey);

    // Generate new API key
    const newApiKey = this.generateApiKey();
    user.apiKey = newApiKey;
    user.updatedAt = new Date().toISOString();

    // Update mappings
    this.apiKeyToUserId.set(newApiKey, userId);
    this.users.set(userId, user);

    await this.persist();

    return user;
  }

  /**
   * Register an agent for a user
   */
  async registerAgent(agentId: string, userId: string, name: string): Promise<UserAgent> {
    await this.init();

    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const agent: UserAgent = {
      agentId,
      userId,
      ownerEmail: user.email,
      name,
      createdAt: new Date().toISOString(),
    };

    this.agents.set(agentId, agent);
    await this.persist();

    return agent;
  }

  /**
   * Get agent by agentId
   */
  async getAgent(agentId: string): Promise<UserAgent | null> {
    await this.init();
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents for a user
   */
  async getAgentsByUserId(userId: string): Promise<UserAgent[]> {
    await this.init();
    return Array.from(this.agents.values()).filter(
      (agent) => agent.userId === userId
    );
  }

  /**
   * Check if user owns agent
   */
  async userOwnsAgent(userId: string, agentId: string): Promise<boolean> {
    await this.init();
    const agent = this.agents.get(agentId);
    return agent?.userId === userId;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string, userId: string): Promise<void> {
    await this.init();
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    if (agent.userId !== userId) {
      throw new Error('Unauthorized: You do not own this agent');
    }
    
    this.agents.delete(agentId);
    await this.persist();
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    await this.init();
    return Array.from(this.users.values());
  }

  /**
   * Get all agents (admin only)
   */
  async getAllAgents(): Promise<UserAgent[]> {
    await this.init();
    return Array.from(this.agents.values());
  }
}

// Singleton instance
export const userStorage = new UserStorage();
