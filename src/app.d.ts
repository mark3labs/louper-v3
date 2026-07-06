// See https://kit.svelte.dev/docs/types#app

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: BunSQLiteDatabase
    }
    // interface PageData {}
    // interface Platform {}
  }

  // Google AdSense global injected by the adsbygoogle.js loader
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export {}
