import Database from 'bun:sqlite'
import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

let sqlite: Database | null = null
let db: BunSQLiteDatabase | null = null

export function getDb(): BunSQLiteDatabase {
  if (!db) {
    sqlite = new Database('./data/louper.db')
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
