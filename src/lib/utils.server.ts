import type { Address } from 'viem'
import type { Contract } from './types'
import consola from 'consola'
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'
import { contracts } from '../schema'
import { and, eq } from 'drizzle-orm'

export const getContractInformation = async (
  address: Address,
  chainId: number,
): Promise<Contract> => {
  try {
    const response = await fetch(`https://anyabi.xyz/api/get-abi/${chainId}/${address}`)
    if (!response.ok) {
      consola.info('ABI not found.')
      return { name: 'Unverified', address, abi: [] }
    }
    const contractData = await response.json()

    return {
      ...contractData,
      address,
    }
  } catch (e) {
    consola.error(e)
    consola.info('ABI not found.')
    return { name: 'Unverified', address, abi: [] }
  }
}

export const getCachedContractInformation = async (
  address: Address,
  chainId: number,
  db: BunSQLiteDatabase,
): Promise<Contract> => {
  try {
    consola.info('Fetching contract information for', address, 'on chain', chainId)
    consola.info('Checking for cached ABI...')
    const result = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.address, address), eq(contracts.chainId, chainId)))

    if (result.length) {
      consola.info('Found in db cache')
      return {
        name: result[0].name,
        abi: [...JSON.parse(result[0].abi)],
        address,
      }
    }
    consola.info('Not found in cache. Fetching from anyabi.xyz...')
    const contract = await getContractInformation(address, chainId)

    // Don't cache unverified contracts
    if (contract.name === 'Unverified') {
      return contract
    }

    // Update the database
    consola.info('Updating db cache...')
    await db.insert(contracts).values({
      id: `${chainId}:${address}`,
      name: contract.name,
      address,
      abi: JSON.stringify(contract.abi),
      chainId,
    })

    return contract
  } catch (e) {
    consola.error(e)
    throw new Error('Failed to fetch contract information')
  }
}

export const getFuncSigBySelector = async (selector: string): Promise<string> => {
  const response = await fetch(
    `https://api.openchain.xyz/signature-database/v1/lookup?function=${selector}&filter=true`,
  )
  const data = await response.json()

  if (data && data.result && data.result.function && data.result.function[selector]) {
    return data.result.function[selector][0].name
  }

  return `unknown_${selector}()`
}
