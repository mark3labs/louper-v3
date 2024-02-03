import * as chains from 'viem/chains';
import type { Chain } from 'viem/chains';

const chainMap: Record<string, Chain> = {};
const allChains: Chain[] = [];

for (const [k, v] of Object.entries(chains)) {
	if (typeof v !== 'object') continue;
	if (!('id' in v)) continue;
	chainMap[k] = v;
	allChains.push(v);
}

export { chainMap, allChains };
