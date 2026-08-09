import Database from 'bun:sqlite'
import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

let sqlite: Database | null = null
let db: BunSQLiteDatabase | null = null

export function getDb(): BunSQLiteDatabase {
  if (!db) {
    sqlite = new Database('./data/louper.db')
    // Rollback-journal SQLite gives a writer an exclusive lock. Without a busy
    // timeout, any concurrent writer (e.g. scripts/backfill-facet-counts.ts,
    // or another request) fails immediately with SQLITE_BUSY. Waiting briefly
    // is strictly better than erroring, since our writes are short upserts.
    sqlite.exec('PRAGMA busy_timeout = 5000')
    db = drizzle(sqlite)
  }
  return db
}

export function closeDb() {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}
