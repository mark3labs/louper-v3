import type { RequestHandler } from './$types'
import { learnArticles } from '$lib/content/learn'
import { featuredDiamonds } from '$lib/content/featured'
import { SITE_URL } from '$lib/seo'
import { diamonds } from '../../schema'
import { and, desc, gte } from 'drizzle-orm'
import { chainMap } from '$lib/chains'
import consola from 'consola'

/**
 * XML sitemap.
 *
 * Diamond pages are included when the cached record confirms the contract is
 * genuinely a diamond with real content:
 *
 *   - A row only exists in `diamonds` if `facets()` resolved successfully, so
 *     every row is a confirmed EIP-2535 contract (non-diamonds throw during
 *     load and are never recorded).
 *   - `facetCount >= MIN_FACETS` additionally proves the diamond actually
 *     exposes facets. Rows predating the facetCount column default to 0 and
 *     are skipped until their next visit refreshes them, so we never advertise
 *     a URL whose content we have not verified.
 */

/**
 * Hard ceiling on URLs in a single sitemap. The spec allows 50,000; we stay
 * below it so the file never becomes invalid as the cache grows. If this limit
 * is reached the sitemap should be split into a sitemap index.
 */
const MAX_URLS = 45_000

/** A diamond must expose at least this many facets to be worth indexing. */
const MIN_FACETS = 1

/**
 * Minimum visits before a diamond is advertised. 1 includes everything ever
 * successfully loaded; raise it to bias the sitemap towards popular contracts.
 */
const MIN_VISITS = 1

type Entry = {
  path: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: string
  lastmod?: string
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const GET: RequestHandler = async ({ locals, setHeaders }) => {
  const today = new Date().toISOString().split('T')[0]

  const entries: Entry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0', lastmod: today },
    { path: '/learn', changefreq: 'weekly', priority: '0.9', lastmod: today },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/contact', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  ]

  for (const article of learnArticles) {
    entries.push({
      path: `/learn/${article.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: article.updatedAt ?? article.publishedAt,
    })
  }

  // Curated diamonds are always included — they are linked from the homepage.
  const seen = new Set<string>()
  for (const d of featuredDiamonds) {
    seen.add(d.url.toLowerCase())
    entries.push({ path: d.url, changefreq: 'weekly', priority: '0.6' })
  }

  // Cached diamonds. Failure here must not break the sitemap.
  try {
    const remaining = Math.max(0, MAX_URLS - entries.length)

    const cached = await locals.db
      .select({
        address: diamonds.address,
        network: diamonds.network,
        visits: diamonds.visits,
        facetCount: diamonds.facetCount,
      })
      .from(diamonds)
      .where(and(gte(diamonds.facetCount, MIN_FACETS), gte(diamonds.visits, MIN_VISITS)))
      // Most-visited first, so that if the cap truncates the list we keep the
      // diamonds people actually look at.
      .orderBy(desc(diamonds.visits))
      .limit(remaining + 1)

    const truncated = cached.length > remaining

    for (const d of cached.slice(0, remaining)) {
      // Skip networks the app no longer supports — those URLs would 404.
      if (!chainMap[d.network]) continue

      const path = `/diamond/${d.address}?network=${d.network}`
      if (seen.has(path.toLowerCase())) continue
      seen.add(path.toLowerCase())

      entries.push({
        path,
        changefreq: 'weekly',
        // Give heavily-visited diamonds a nudge over long-tail ones.
        priority: d.visits >= 50 ? '0.6' : '0.4',
      })
    }

    if (truncated) {
      consola.warn(`sitemap: hit the ${MAX_URLS} URL cap — consider splitting into a sitemap index`)
    }
  } catch (e) {
    consola.warn('sitemap: could not load cached diamonds', e)
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => {
    const loc = escapeXml(`${SITE_URL}${e.path}`)
    return `  <url>
    <loc>${loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

  setHeaders({
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  })

  return new Response(body)
}
