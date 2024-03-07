import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const diamonds = sqliteTable('diamonds', {
  id: text('id', { length: 36 }).primaryKey().unique(),
  network: text('network').notNull(),
  address: text('address').notNull(),
  name: text('name').notNull(),
  visits: integer('visits').notNull().default(0),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
})
