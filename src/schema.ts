import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const diamonds = sqliteTable('diamonds', {
  id: text('id', { length: 36 }).primaryKey().unique(),
  network: text('network').notNull(),
  address: text('address').notNull(),
  name: text('name').notNull(),
  visits: integer('visits').notNull().default(0),
  /**
   * Number of facets returned by the contract's `facets()` loupe call on the
   * most recent successful load.
   *
   * 0 means "not yet recorded" for rows created before this column existed, as
   * well as genuinely empty diamonds. Either way such rows are excluded from
   * the sitemap until a visit records a real count. See scripts/backfill-facet-counts.ts.
   */
  facetCount: integer('facetCount').notNull().default(0),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
})

export const contracts = sqliteTable('contracts', {
  id: text('id', { length: 36 }).primaryKey().unique(),
  chainId: integer('chainId').notNull(),
  address: text('address').notNull(),
  name: text('name').notNull(),
  abi: text('abi').notNull(),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
})
