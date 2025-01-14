import { defineChain } from 'viem'
import * as chains from 'viem/chains'
import type { Chain } from 'viem/chains'

const chainMap: Record<string, Chain> = {}
const allChains: Chain[] = []

for (const [k, v] of Object.entries(chains)) {
  if (typeof v !== 'object') continue
  if (!('id' in v)) continue
  if (v.id.toString() === '31337') continue
  if (k === 'localhost') continue
  if (k.includes('wanchain')) continue
  if (k === 'saigon') continue
  if (k.includes('skale')) continue
  if (k === 'zkSyncInMemoryNode') continue
  if (k === 'zkSyncLocalNode') continue
  if (k === 'lineaTestnet') continue
  chainMap[k] = v
  allChains.push(v)
}

const ab = defineChain({
  id: 2741,
  name: 'abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'Abstract Mainnet',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.raas.matterhosted.dev'],
    },
  },
  contracts: {
  },
})
chainMap['abstract'] = ab
allChains.push(ab)

export { chainMap, allChains }
