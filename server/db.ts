import fs from 'fs';
import path from 'path';

export interface DBTransaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note: string;
  timestamp: string;
  dateStr: string;
  timeStr: string;
}

export interface DBSettings {
  userId: string;
  monthlyBudget: number;
  currencySymbol: string;
  currencyCode: string;
}

export interface DBUser {
  id: string;
  username: string;
  email?: string;
  password?: string;
  joinedDate: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  transactions: DBTransaction[];
  settings: DBSettings[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'user-demo',
      username: 'demo_user',
      email: 'demo@student.edu',
      joinedDate: new Date().toISOString(),
    },
  ],
  transactions: [], // Starts completely empty - zero fabricated data!
  settings: [
    {
      userId: 'user-demo',
      monthlyBudget: 2000,
      currencySymbol: '$',
      currencyCode: 'USD',
    },
  ],
};

// Ensure data folder and db file exist
function initDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content) as DatabaseSchema;
    return parsed;
  } catch (err) {
    console.error('Error initializing database, using in-memory fallback:', err);
    return INITIAL_DB;
  }
}

// Thread-safe read and write
export function readDatabase(): DatabaseSchema {
  return initDB();
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to database:', err);
  }
}
