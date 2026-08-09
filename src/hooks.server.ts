import type { Handle } from '@sveltejs/kit'
import { getDb } from '$lib/db.server'
import { adUnits, adsenseClient, isProduction, pathAllowsAds } from '$lib/ads'

export const handle = (async ({ resolve, event }) => {
  event.locals.db = getDb()

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Only include analytics + AdSense scripts in production builds
      if (!isProduction()) {
        // Remove the analytics script if not in production.
        // The AdSense loader is intentionally NOT injected in non-production to
        // avoid Google flagging dev/staging traffic as invalid activity.
        return html.replace(
          '<script defer data-domain="louper.dev" src="https://analytics.mark3labs.com/js/script.js"></script>',
          '<!-- Analytics disabled for non-production -->',
        )
      }

      // Production: inject the Google AdSense loader only when
      //   1. a valid publisher ID is configured,
      //   2. at least one real ad unit exists,
      //   3. the current route is allowed to show ads at all, and
      //   4. the load function did not flag the page as thin.
      //
      // Conditions 3 and 4 keep the loader off legal/utility pages and off
      // pages that resolved to no content. The layout applies the remaining
      // runtime checks (error boundary, loading state) before any ad unit is
      // actually rendered.
      const client = adsenseClient()
      if (
        client &&
        adUnits.length > 0 &&
        pathAllowsAds(event.url.pathname) &&
        !event.locals.thinContent
      ) {
        return html.replace(
          '</head>',
          `\t<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>\n  </head>`,
        )
      }

      return html
    },
  })

  response.headers.append('Access-Control-Allow-Origin', `*`)
  response.headers.append('Access-Control-Allow-Methods', `GET`)
  response.headers.append(
    'Access-Control-Allow-Headers',
    `X-Requested-With, content-type, Authorization`,
  )

  return response
}) satisfies Handle
