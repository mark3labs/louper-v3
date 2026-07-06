import type { Handle } from '@sveltejs/kit'
import { getDb } from '$lib/db.server'
import { env } from '$env/dynamic/public'

export const handle = (async ({ resolve, event }) => {
  event.locals.db = getDb()

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Only include analytics + AdSense scripts in production builds
      const isProduction = env.PUBLIC_BUILD_ENV === 'production'

      if (!isProduction) {
        // Remove the analytics script if not in production.
        // The AdSense loader is intentionally NOT injected in non-production to
        // avoid Google flagging dev/staging traffic as invalid activity.
        return html.replace(
          '<script defer data-domain="louper.dev" src="https://analytics.mark3labs.com/js/script.js"></script>',
          '<!-- Analytics disabled for non-production -->',
        )
      }

      // Production: inject the Google AdSense loader using the publisher ID
      // from PUBLIC_ADSENSE_CLIENT (set in your deployment environment / .env).
      const adsenseClient = env.PUBLIC_ADSENSE_CLIENT
      if (adsenseClient) {
        return html.replace(
          '</head>',
          `\t<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>\n  </head>`,
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
