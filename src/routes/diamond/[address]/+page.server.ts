import type { FacetData, Contract, Diamond } from '$lib/types';
import { getContractInformation, getFuncSigBySelector } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	createPublicClient,
	http,
	parseAbi,
	getAddress,
	type Address,
	toFunctionSelector,
	type Abi
} from 'viem';
import type { Chain } from 'viem/chains';
import { chainMap } from '$lib/chains';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { diamonds } from '../../../schema';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, url }) => {
	const { address } = params;
	const network = <string>url.searchParams.get('network') ?? 'mainnet';

	const chain: Chain = chainMap[network];

	const publicClient = createPublicClient({
		chain,
		transport: http()
	});
	const abi = parseAbi(['function facets() view returns ((address,bytes4[])[])']);

	try {
		let diamondAbi: Abi = [];

		// Fetch all facet addresses
		const facetData = <FacetData>await publicClient.readContract({
			address: getAddress(address),
			abi,
			functionName: 'facets'
		});

		// Build the diamond
		const diamond: Diamond = {
			...(await getContractInformation(getAddress(address), chain.id)),
			facets: []
		};

		// Fetch all facet information
		for (const [address, selectors] of facetData) {
			const facet = await buildFacet(address, selectors, chain.id);
			if (!facet) continue;
			diamond.facets.push(facet);
			diamondAbi = [...diamondAbi, ...facet.abi];
		}

		// Udate the database
		const sqlite = new Database('./data/louper.db');
		const db = drizzle(sqlite);
		await db
			.insert(diamonds)
			.values({
				id: `${network}:${address}`,
				network,
				address,
				name: diamond.name,
				visits: 1
			})
			.onConflictDoUpdate({
				target: [diamonds.id],
				set: {
					visits: sql`${diamonds.visits} + 1`
				}
			});

		return {
			chain: network,
			diamond,
			diamondAbi
		};
	} catch (e) {
		console.error(e);
		throw error(400, { message: 'Unable to fetch diamond details' });
	}
};

const buildFacet = async (
	address: Address,
	selectors: string[],
	chainId: number
): Promise<Contract | undefined> => {
	const facet: Contract = await getContractInformation(address, chainId);

	const abiSigs = [];
	if (!facet.abi.length) {
		for (const s of selectors) {
			const sig = await getFuncSigBySelector(s);
			abiSigs.push(`function ${sig}`);
		}
		facet.abi = parseAbi(abiSigs);
	}

	const fileredAbi: Abi = facet.abi.filter((item) => {
		if (item.type !== 'function') return true;
		if (!item.outputs) {
			item.outputs = [];
		}
		return selectors.includes(toFunctionSelector(item));
	});

	facet.abi = fileredAbi;

	return facet;
};
