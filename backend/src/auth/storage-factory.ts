/**
 * Storage Factory
 * Auto-selects PostgreSQL or JSON storage based on DATABASE_URL
 */

import { PostgresStorage } from '../db/postgres-storage';
import { userStorage as jsonStorage } from './storage';

// Check if DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL;

let storage: any;

if (DATABASE_URL) {
  console.log('✅ Using PostgreSQL storage (persistent)');
  storage = new PostgresStorage(DATABASE_URL);
} else {
  console.log('⚠️  Using JSON file storage (ephemeral - data lost on redeploy)');
  storage = jsonStorage;
}

export { storage as userStorage };
