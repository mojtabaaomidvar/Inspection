import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './data/inspection.db';

// اطمینان از وجود فولدر data
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// فعال کردن foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      national_id TEXT,
      email TEXT,
      emails TEXT,
      phone TEXT,
      category TEXT,
      contacts INTEGER DEFAULT 0,
      contracts INTEGER DEFAULT 0,
      logo_color TEXT,
      abbreviated_name TEXT,
      company_type TEXT,
      registration_no TEXT,
      economic_code TEXT,
      address_en TEXT,
      address_fa TEXT,
      departments TEXT,
      contact_persons TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      contract_no TEXT NOT NULL,
      external_contract_no TEXT,
      source_type TEXT,
      source_ref TEXT,
      source_file TEXT,
      source_letter_date TEXT,
      source_letter_image TEXT,
      source_email_from TEXT,
      source_email_date TEXT,
      client_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      contract_title TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      total_value REAL DEFAULT 0,
      invoiced REAL DEFAULT 0,
      currency TEXT DEFAULT 'IRR',
      status TEXT DEFAULT 'ACTIVE',
      type TEXT NOT NULL,
      tariffs INTEGER DEFAULT 0,
      contract_count INTEGER DEFAULT 1,
      tariff_lines TEXT,
      department TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS contract_tariffs (
      id TEXT PRIMARY KEY,
      contract_id TEXT NOT NULL,
      description TEXT NOT NULL,
      unit TEXT NOT NULL,
      rate REAL NOT NULL,
      currency TEXT DEFAULT 'IRR',
      total REAL DEFAULT 0,
      is_lump_sum INTEGER DEFAULT 0,
      total_quantity REAL DEFAULT 0,
      consumed_quantity REAL DEFAULT 0,
      invoiced REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
    CREATE INDEX IF NOT EXISTS idx_tariffs_contract_id ON contract_tariffs(contract_id);
  `);

  console.log('✅ Database initialized successfully');
}

export default db;