import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'
import { type Abi, type AbiFunction, type Address } from 'viem'
import type { Contract } from './types'
import toast from 'svelte-french-toast'
import Database from 'bun:sqlite'
import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'
import { contracts } from '../schema'
import { and, eq } from 'drizzle-orm'
import consola from 'consola'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type FlyAndScaleParams = {
  y?: number
  x?: number
  start?: number
  duration?: number
}

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 },
): TransitionConfig => {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA
    const [minB, maxB] = scaleB

    const percentage = (valueA - minA) / (maxA - minA)
    const valueB = percentage * (maxB - minB) + minB

    return valueB
  }

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str
      return str + `${key}:${style[key]};`
    }, '')
  }

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t,
      })
    },
    easing: cubicOut,
  }
}

export const getContractInformation = async (
  address: Address,
  chainId: number,
): Promise<Contract> => {
  try {
    const response = await fetch(`https://anyabi.xyz/api/get-abi/${chainId}/${address}`)
    if (!response.ok) return { name: 'Unverified', address, abi: [] }
    const contractData = await response.json()

    return {
      ...contractData,
      address,
    }
  } catch (e) {
    consola.error(e)
    throw new Error('Contract not found')
  }
}

export const getCachedContractInformation = async (
  address: Address,
  chainId: number,
  db: BunSQLiteDatabase,
): Promise<Contract> => {
  try {
    consola.info('Fetching contract information for', address, 'on chain', chainId)
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
    const contract = await getContractInformation(address, chainId)

    // Don't cache unverified contracts
    if (contract.name === 'Unverified') {
      return contract
    }

    // Update the database
    consola.info('Updating db cache')
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
    throw new Error('Contract not found')
  }
}

export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard!')
}

export const getFuncSigBySelector = async (selector: string): Promise<string> => {
  const response = await fetch(
    `https://api.openchain.xyz/signature-database/v1/lookup?function=${selector}&filter=true`,
  )
  const data = await response.json()

  if (data && data.result && data.result.function && data.result.function[selector]) {
    return data.result.function[selector][0].name
  }

  return 'unknown()'
}

export const abiMethods = (abi: Abi): AbiFunction[] =>
  abi.filter((i) => i.type === 'function') as AbiFunction[]

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
