/**
 * Central SEO configuration and helpers.
 *
 * Every route should render `<Seo ... />` (see $lib/components/Seo.svelte) so
 * that each URL gets a unique <title>, meta description and canonical URL.
 * Duplicate titles/descriptions across thousands of generated URLs is a strong
 * "thin / auto-generated content" signal to search and ad-network crawlers.
 */

export const SITE_URL = 'https://louper.dev'
export const SITE_NAME = 'Louper'
export const SITE_TAGLINE = 'The Ethereum Diamond Inspector'
export const SITE_TITLE = `${SITE_NAME} - ${SITE_TAGLINE}`
export const DEFAULT_DESCRIPTION =
  'Louper is a free open source tool for inspecting EIP-2535 Diamond smart contracts. Explore facets, function selectors and ABIs across 20+ EVM networks.'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/thumbnail.jpg`

export const CONTACT_EMAIL = 'louper@mark3labs.com'

/** Last time the legal documents were reviewed. Keep in sync with the pages. */
export const LEGAL_LAST_UPDATED = '2026-08-09'

/**
 * Builds a page title. Pages pass their own specific title and we append the
 * site name, except on the homepage where the title is already the site name.
 */
export const buildTitle = (title?: string): string =>
  title && title.trim() ? `${title} | ${SITE_NAME}` : SITE_TITLE

/**
 * Builds an absolute canonical URL from a path.
 *
 * Query strings are dropped by default because most of Louper's query params
 * (e.g. `?network=`) are handled explicitly by callers that want them kept.
 */
export const canonical = (path: string): string => {
  if (!path) return SITE_URL
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Truncates a description to a length that search engines actually display. */
export const clampDescription = (text: string, max = 160): string => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/[\s,.;:-]+$/, '')}…`
}
