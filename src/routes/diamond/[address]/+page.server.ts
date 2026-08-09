import type { FacetData, Contract, Diamond } from '$lib/types'
import { getCachedContractInformation, getFuncSigBySelector } from '$lib/utils.server'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import {
  createPublicClient,
  http,
  parseAbi,
  getAddress,
  type Address,
  toFunctionSelector,
  type Abi,
  fallback,
} from 'viem'
import type { Chain } from 'viem/chains'
import { chainMap } from '$lib/chains'
import { type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'
import { recordDiamondVisit } from '$lib/diamond.server'
import consola from 'consola'

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const { address } = params
  const network = url.searchParams.get('network') || 'mainnet'

  const chain: Chain | undefined = chainMap[network]
  if (!chain) {
    throw error(404, { message: `Unknown network: ${network}` })
  }

  const transports = [
    http(`http://erpc:4000/main/evm/${chain.id}`, { timeout: 10_000, retryCount: 1 }),
    ...chain.rpcUrls.default.http.map((url) => http(url, { timeout: 10_000, retryCount: 1 })),
  ]

  const publicClient = createPublicClient({
    chain,
    transport: fallback(transports),
  })
  const abi = parseAbi(['function facets() view returns ((address,bytes4[])[])'])

  try {
    let diamondAbi: Abi = []

    // Fetch all facet addresses
    const facetData = <FacetData>await publicClient.readContract({
      address: getAddress(address),
      abi,
      functionName: 'facets',
    })

    // Build the diamond
    const diamond: Diamond = {
      ...(await getCachedContractInformation(getAddress(address), chain.id, locals.db)),
      facets: [],
    }

    // Fetch all facet information asynchronously
    const facetPromises = facetData.map(([address, selectors]) =>
      buildFacet(address, selectors, chain.id, locals.db),
    )

    // Wait for all promises to resolve
    const facets = await Promise.all(facetPromises)

    // Filter out any undefined facets and add them to the diamond
    diamond.facets = facets.filter((facet) => facet !== undefined)

    // A diamond with no facets has nothing meaningful to show. Flag it so the
    // AdSense loader is not injected (the layout also suppresses the ad units,
    // and the page marks itself noindex).
    locals.thinContent = diamond.facets.length < 1

    // Combine all facet ABIs into the diamond ABI
    for (const facet of diamond.facets) {
      diamondAbi = [...diamondAbi, ...facet.abi]
    }

    // Udate the database
    consola.info('Updating stats...')
    await recordDiamondVisit(locals.db, {
      network,
      address,
      name: diamond.name,
      facetCount: diamond.facets.length,
    })

    return {
      chain: network,
      diamond,
      diamondAbi,
    }
  } catch (e) {
    console.error(e)
    throw error(400, { message: 'Unable to fetch diamond details' })
  }
}

const buildFacet = async (
  address: Address,
  selectors: string[],
  chainId: number,
  db: BunSQLiteDatabase,
): Promise<Contract | undefined> => {
  const facet: Contract = await getCachedContractInformation(address, chainId, db)

  const abiSigs = []
  if (!facet.abi.length) {
    for (const s of selectors) {
      const sig = await getFuncSigBySelector(s)
      abiSigs.push(`function ${sig}`)
    }
    facet.abi = parseAbi(abiSigs)
  }

  const fileredAbi: Abi = facet.abi.filter((item) => {
    if (item.type !== 'function') return true
    if (item.name.indexOf('unknown_') > -1) return true
    if (!item.outputs) {
      item.outputs = []
    }
    return selectors.includes(toFunctionSelector(item))
  })

  facet.abi = fileredAbi

  return facet
}
