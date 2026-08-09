import type { RequestHandler } from './$types'
import { SITE_URL } from '$lib/seo'

/**
 * robots.txt
 *
 * Served dynamically so the sitemap URL stays in sync with $lib/seo.
 *
 * `/diamond/*` is intentionally crawlable — those pages are real, server
 * rendered content — but the `/json` API responses and error-prone query
 * permutations are not useful to index.
 */
export const GET: RequestHandler = async ({ setHeaders }) => {
  const body = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Machine-readable API output has no value in a search index.
Disallow: /diamond/*/json
Disallow: /chains

# Ad crawlers need access to render pages for ad targeting and policy review.
User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

  setHeaders({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400',
  })

  return new Response(body)
}
