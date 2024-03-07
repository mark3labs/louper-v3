import type { Abi, Address } from 'viem'

export interface Contract {
  name: string
  address: Address
  abi: Abi
}

export interface Diamond extends Contract {
  facets: Contract[]
}

export interface ArgsResult {
  args: Array<unknown> | never[]
  result: object | string | number | boolean | null
  error: string | undefined
  value: bigint | undefined
}

export type UpgradeStrategy = {
  additions: Record<Address, string[]>
  removals: Record<Address, string[]>
  replacements: Record<Address, string[]>
}

export enum FacetCutAction {
  Add = 0,
  Replace = 1,
  Remove = 2,
}

export interface FacetCut {
  facetAddress: Address
  action: FacetCutAction
  functionSelectors: string[] | never[]
}

export type FacetData = Array<[Address, string[]]>
