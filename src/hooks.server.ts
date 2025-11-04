import type { Handle } from '@sveltejs/kit'
import { getDb } from '$lib/db.server'
import { env } from '$env/dynamic/public'

export const handle = (async ({ resolve, event }) => {
  event.locals.db = getDb()

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Only include analytics script in production builds
      const isProduction = env.PUBLIC_BUILD_ENV === 'production'

      if (!isProduction) {
        // Remove the analytics script if not in production
        return html.replace(
          '<script defer data-domain="louper.dev" src="https://analytics.mark3labs.com/js/script.js"></script>',
          '<!-- Analytics disabled for non-production -->',
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
