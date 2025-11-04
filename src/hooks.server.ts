import type { Handle } from '@sveltejs/kit'
import { getDb } from '$lib/db.server'

export const handle = (async ({ resolve, event }) => {
  event.locals.db = getDb()

  const response = await resolve(event)

  response.headers.append('Access-Control-Allow-Origin', `*`)
  response.headers.append('Access-Control-Allow-Methods', `GET`)
  response.headers.append(
    'Access-Control-Allow-Headers',
    `X-Requested-With, content-type, Authorization`,
  )

  return response
}) satisfies Handle
