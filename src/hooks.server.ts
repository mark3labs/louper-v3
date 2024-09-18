import type { Handle } from '@sveltejs/kit'
import Database from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'

export const handle = (async ({ resolve, event }) => {
  const sqlite = new Database('./data/louper.db')
  const db = drizzle(sqlite)

  event.locals.db = db

  const response = await resolve(event)

  response.headers.append('Access-Control-Allow-Origin', `*`)
  response.headers.append('Access-Control-Allow-Methods', `GET`)
  response.headers.append(
    'Access-Control-Allow-Headers',
    `X-Requested-With, content-type, Authorization`,
  )

  return response
}) satisfies Handle
