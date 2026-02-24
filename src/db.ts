/**
 * SQLite database layer for authentication
 *
 * Uses better-sqlite3 which is a synchronous, file-based SQLite driver.
 * The database file is only read when auth operations occur — no background
 * process or persistent connection is needed.
 *
 * @module db
 */

import Database from 'better-sqlite3';
import path from 'path';

/** Singleton database instance */
let db: Database.Database | null = null;

/**
 * Returns the path to the SQLite database file.
 * Configurable via AUTH_DB_PATH environment variable.
 * Falls back to data/auth.db relative to the project root (cwd).
 * @returns The absolute path to the auth database file
 */
export function getDbPath(): string {
  return process.env.AUTH_DB_PATH || path.join(process.cwd(), 'data', 'auth.db');
}

/**
 * Initialises the SQLite database, creating the users table if it does not
 * already exist. Returns the singleton database instance.
 * @returns The better-sqlite3 Database instance
 */
export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = getDbPath();
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');

  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}

/**
 * Closes the database connection and clears the singleton.
 * Useful for tests and graceful shutdown.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
