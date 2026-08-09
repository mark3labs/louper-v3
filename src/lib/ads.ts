import { env } from '$env/dynamic/public'

/**
 * Central advertising policy.
 *
 * Google's "Google-served ads on screens without publisher-content" policy
 * prohibits ads on screens that have no content, are under construction, or
 * serve navigational/alert purposes. Everything in this module exists to make
 * those cases impossible to hit by accident.
 */

/**
 * AdSense publisher ID.
 *
 * This is NOT a secret: it is rendered into every page as `data-ad-client`
 * and is already committed in `static/ads.txt`. It lives in source so a
 * deployment works with zero configuration. `scripts/check-content.js`
 * asserts it stays in sync with ads.txt.
 */
export const ADSENSE_CLIENT = 'ca-pub-9877658282151286'

/**
 * AdSense ad unit IDs (the `data-ad-slot` numbers from the AdSense dashboard).
 *
 * Also not secret — these appear in the page HTML. Add real unit IDs here and
 * commit; there is nothing to configure at deploy time.
 *
 * The value below is a placeholder and is deliberately rejected by
 * `isValidSlot`, so an unconfigured site renders no ad markup at all rather
 * than an empty box labelled "Advertisement" (which is itself a policy
 * problem). Replace it with a real unit ID to switch ads on.
 */
export const AD_SLOTS: string[] = ['0000000000']

/** Placeholder used before real AdSense unit IDs were configured. */
const PLACEHOLDER_SLOT = '0000000000'

/** Strips whitespace and stray surrounding quotes from an env-provided slot. */
export const normaliseSlot = (slot: string | undefined): string =>
  (slot ?? '').trim().replace(/^['"]|['"]$/g, '')

/**
 * A slot ID is only usable if it is a real, non-placeholder numeric unit ID.
 *
 * Values are normalised first: pasting a unit ID into a .env file or a
 * docker-compose `environment:` block easily leaves surrounding whitespace or
 * quotes, and silently showing no ads because of an invisible space is a
 * miserable thing to debug.
 */
export const isValidSlot = (slot: string | undefined): boolean => {
  const s = normaliseSlot(slot)
  return !!s && s !== PLACEHOLDER_SLOT && /^\d{6,}$/.test(s)
}

/**
 * The AdSense publisher ID, e.g. `ca-pub-1234567890123456`.
 *
 * Defaults to the committed ADSENSE_CLIENT constant. PUBLIC_ADSENSE_CLIENT may
 * override it (useful for testing against a different account) but is not
 * required for normal operation.
 */
export const adsenseClient = (): string | undefined => {
  const client = (env.PUBLIC_ADSENSE_CLIENT || ADSENSE_CLIENT).trim()
  return /^ca-pub-\d+$/.test(client) ? client : undefined
}

/**
 * Ads are only ever loaded in production. Rendering them in dev or staging
 * risks Google flagging the traffic as invalid activity.
 */
export const isProduction = (): boolean => env.PUBLIC_BUILD_ENV === 'production'

/**
 * Routes that are allowed to display advertising.
 *
 * The rule: a page qualifies only if it carries substantial publisher content
 * of its own. Utility, legal and navigational pages are excluded — they are
 * thin by nature, and ads on them are exactly what the policy targets.
 */
export const pathAllowsAds = (pathname: string): boolean => {
  if (!pathname) return false

  // Legal/utility pages: intentionally excluded.
  const denied = ['/privacy', '/terms', '/contact']
  if (denied.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return false

  // Homepage, guides and diamond inspection pages all carry real content.
  if (pathname === '/') return true
  if (pathname === '/learn' || pathname.startsWith('/learn/')) return true
  if (pathname === '/about') return true
  if (pathname.startsWith('/diamond/')) return true

  return false
}

/**
 * Final gate used by the layout. Every condition must hold before a single ad
 * tag is rendered.
 *
 * @param pathname     Current route.
 * @param isNavigating True while SvelteKit is between pages (a loading screen).
 * @param hasError     True when the error boundary is showing.
 * @param thinContent  True when the route matched but resolved to little or no
 *                     content (e.g. a diamond that exposes zero facets).
 */
export const shouldRenderAds = ({
  pathname,
  isNavigating,
  hasError,
  thinContent = false,
}: {
  pathname: string
  isNavigating: boolean
  hasError: boolean
  thinContent?: boolean
}): boolean => {
  if (!isProduction()) return false
  if (!adsenseClient()) return false
  if (hasError) return false // never on error screens
  if (isNavigating) return false // never on loading screens
  if (thinContent) return false // never on screens with no real content
  if (!pathAllowsAds(pathname)) return false
  return adUnits.some((u) => isValidSlot(u.slot))
}

export type AdUnit = {
  /** The AdSense `data-ad-slot` value. */
  slot: string
  className?: string
}

/**
 * Configured AdSense units.
 *
 * Sourced from the committed AD_SLOTS constant, with an optional
 * PUBLIC_ADSENSE_SLOT_CONTENT override for one-off testing. Anything that
 * fails `isValidSlot` (unset, placeholder, non-numeric) is dropped, so an
 * unconfigured deployment renders nothing rather than an empty labelled ad
 * frame.
 *
 * NOTE: if this array is empty, NO ads appear anywhere on the site and the
 * adsbygoogle loader is never injected. That is the intended behaviour for an
 * unconfigured deployment — see `describeAdConfig()` for a diagnostic.
 */
export const adUnits: AdUnit[] = (
  env.PUBLIC_ADSENSE_SLOT_CONTENT ? [env.PUBLIC_ADSENSE_SLOT_CONTENT] : AD_SLOTS
)
  .map((slot) => ({ slot: normaliseSlot(slot) }))
  .filter((u) => isValidSlot(u.slot))

/**
 * Human-readable explanation of why ads are (or are not) configured.
 *
 * Logged once at server start so a misconfigured deployment is visible in the
 * logs rather than silently rendering no ads.
 */
export const describeAdConfig = (): string => {
  if (!isProduction()) {
    return `ads disabled: PUBLIC_BUILD_ENV is "${env.PUBLIC_BUILD_ENV ?? '<unset>'}", not "production"`
  }
  if (!adsenseClient()) {
    return `ads disabled: invalid publisher ID "${env.PUBLIC_ADSENSE_CLIENT || ADSENSE_CLIENT}" (expected ca-pub-<digits>)`
  }
  if (adUnits.length === 0) {
    return (
      `ads disabled: no valid ad unit. AD_SLOTS in src/lib/ads.ts is ` +
      `[${AD_SLOTS.map((s) => `"${s}"`).join(', ')}] — replace the placeholder ` +
      `with a real AdSense unit ID (6+ digits) and redeploy`
    )
  }
  return `ads enabled: ${adUnits.length} unit(s) for client ${adsenseClient()}`
}
