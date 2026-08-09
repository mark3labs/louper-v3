/**
 * Backfills `diamonds.facetCount` for rows created before the column existed.
 *
 * Rows added before migration 0002 default to facetCount = 0, which excludes
 * them from the sitemap until someone visits them again. This script calls
 * `facets()` for each affected diamond and records the real count.
 *
 * Usage:
 *   bun run scripts/backfill-facet-counts.ts            # backfill facetCount = 0 rows
 *   bun run scripts/backfill-facet-counts.ts --all      # re-check every row
 *   bun run scripts/backfill-facet-counts.ts --dry-run  # report without writing
 *
 * Safe to re-run and safe to interrupt: each diamond is written as it is
 * resolved. Contracts that no longer respond to `facets()` are left at 0 so
 * they stay out of the sitemap.
 */

import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { eq } from 'drizzle-orm'
import { createPublicClient, http, parseAbi, getAddress, fallback } from 'viem'
import { chainMap } from '../src/lib/chains'
import { diamonds } from '../src/schema'

const DRY_RUN = process.argv.includes('--dry-run')
const ALL = process.argv.includes('--all')

/** Concurrent RPC calls. Keep modest to avoid rate limits on public endpoints. */
const CONCURRENCY = 5

const loupeAbi = parseAbi(['function facets() view returns ((address,bytes4[])[])'])

const sqlite = new Database('./data/louper.db')
const db = drizzle(sqlite)

const rows = db.select().from(diamonds).all()
const targets = ALL ? rows : rows.filter((r) => (r.facetCount ?? 0) < 1)

console.info(
  `${rows.length} cached diamonds, ${targets.length} to check` + `${DRY_RUN ? ' (dry run)' : ''}`,
)

let updated = 0
let unchanged = 0
let failed = 0
let skipped = 0

const resolveFacetCount = async (network: string, address: string): Promise<number | null> => {
  const chain = chainMap[network]
  if (!chain) return null

  const client = createPublicClient({
    chain,
    transport: fallback(
      chain.rpcUrls.default.http.map((url) => http(url, { timeout: 10_000, retryCount: 1 })),
    ),
  })

  const facets = await client.readContract({
    address: getAddress(address),
    abi: loupeAbi,
    functionName: 'facets',
  })

  return facets.length
}

const processRow = async (row: (typeof rows)[number]) => {
  if (!chainMap[row.network]) {
    skipped++
    console.warn(`  skip   ${row.network}:${row.address} (unsupported network)`)
    return
  }

  try {
    const count = await resolveFacetCount(row.network, row.address)
    if (count === null) {
      skipped++
      return
    }

    if (count === row.facetCount) {
      unchanged++
      return
    }

    if (!DRY_RUN) {
      await db.update(diamonds).set({ facetCount: count }).where(eq(diamonds.id, row.id))
    }

    updated++
    console.info(`  ok     ${row.network}:${row.address} -> ${count} facets`)
  } catch (e) {
    failed++
    const message = e instanceof Error ? e.message.split('\n')[0] : String(e)
    console.warn(`  fail   ${row.network}:${row.address} (${message})`)
  }
}

// Simple concurrency-limited queue.
const queue = [...targets]
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const row = queue.shift()
      if (row) await processRow(row)
    }
  }),
)

console.info(
  `\nDone. updated=${updated} unchanged=${unchanged} failed=${failed} skipped=${skipped}`,
)

sqlite.close()
process.exit(0)
