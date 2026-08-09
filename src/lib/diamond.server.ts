import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'
import { sql } from 'drizzle-orm'
import consola from 'consola'
import { diamonds } from '../schema'

/**
 * Records a successful diamond load.
 *
 * Both the HTML page loader and the /json endpoint call this so that visit
 * counts and facet counts cannot drift apart between the two code paths.
 *
 * `facetCount` is important beyond statistics: the sitemap only advertises
 * diamonds that are confirmed to have at least one facet, so a page is never
 * submitted to search engines until we have actually seen it resolve.
 */
export const recordDiamondVisit = async (
  db: BunSQLiteDatabase,
  {
    network,
    address,
    name,
    facetCount,
  }: { network: string; address: string; name: string; facetCount: number },
): Promise<void> => {
  try {
    await db
      .insert(diamonds)
      .values({
        id: `${network}:${address}`,
        network,
        address,
        name,
        visits: 1,
        facetCount,
      })
      .onConflictDoUpdate({
        target: [diamonds.id],
        set: {
          visits: sql`${diamonds.visits} + 1`,
          // Refresh both on every visit. A facet can be added or removed by a
          // diamondCut at any time, and a contract that was "Unverified" when
          // first seen may since have been verified and gained a real name.
          facetCount,
          name,
        },
      })
  } catch (e) {
    // Stats must never break a page render.
    consola.warn('Failed to record diamond visit', e)
  }
}
