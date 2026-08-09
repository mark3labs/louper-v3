// See https://kit.svelte.dev/docs/types#app

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: BunSQLiteDatabase
      /**
       * Set by a load function when the page resolved to little or no content
       * (e.g. a diamond exposing zero facets). `hooks.server.ts` reads this to
       * skip injecting the AdSense loader on such screens.
       */
      thinContent?: boolean
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
