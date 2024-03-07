<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { MagnifyingGlass } from 'radix-icons-svelte';

	const diamonds = [
		{
			name: 'Aavegotchi',
			description: 'DeFi-enabled crypto collectibles game on Polygon.',
			icon: '/img/aavegotchi-polygon-logo.jpg',
			url: '/diamond/0x86935f11c86623dec8a25696e1c19a8659cbf95d?network=polygon',
			projectUrl: 'https://www.aavegotchi.com/'
		},
		{
			name: 'EscaBro',
			description: 'Multi-chain smart contract escrow payments service.',
			icon: '/img/escabro-logo.png',
			url: '/diamond/0xa06fdba8774806654bc8b09f81ea74d8c98c1560?network=mainnet',
			projectUrl: 'https://escabro.com'
		},
		{
			name: 'BarnBridge',
			description:
				'A fluctuations derivatives protocol for hedging yield sensitivity and market price.',
			icon: '/img/barnbridge-logo.jpg',
			url: '/diamond/0x10e138877df69ca44fdc68655f86c88cde142d7f?network=mainnet',
			projectUrl: 'https://barnbridge.com/'
		},
		{
			name: 'Beanstalk',
			description: 'A decentralized credit-based stablecoin protocol.',
			icon: '/img/beanstalk-logo.png',
			url: '/diamond/0xc1e088fc1323b20bcbee9bd1b9fc9546db5624c5?network=mainnet',
			projectUrl: 'https://bean.money/'
		},
		{
			name: 'PieDAO',
			description:
				'PieDAO, the asset allocation DAO for decentralized market-weighted portfolio allocations.',
			icon: '/img/piedao-logo.png',
			url: '/diamond/0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31?network=mainnet',
			projectUrl: 'https://www.piedao.org/'
		},
		{
			name: 'Gelato V2',
			description:
				'Automated smart contract executions on Avalanche, Arbitrum, BSC, Fantom, Ethereum, Optimism, Polygon, and more.',
			icon: '/img/gelato-logo.png',
			url: '/diamond/0x3caca7b48d0573d793d3b0279b5f0029180e83b6?network=mainnet',
			projectUrl: 'https://gelato.network'
		},
		{
			name: 'LIFI',
			description: 'Developer Solution Providing Advanced Bridge Aggregation with DEX Connectivity',
			icon: '/img/lifi.png',
			url: '/diamond/0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE?network=mainnet',
			projectUrl: 'https://li.fi'
		},
		{
			name: 'Connext',
			description: 'The most secure interoperability protocol to build crosschain dApps',
			icon: '/img/connext-logo.png',
			url: '/diamond/0x2b501381c6d6aFf9238526352b1c7560Aa35A7C5?network=mainnet',
			projectUrl: 'https://connext.network'
		}
	];
</script>

<h1 class="text-2xl font-bold m-5">Featured Diamonds</h1>
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each diamonds as d}
		<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
			<div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
				<Button
					class="tracking-tight text-sm font-medium"
					variant="ghost"
					on:click={() => goto(d.url, { replaceState: true })}
				>
					<MagnifyingGlass />
				</Button>
				<img src={d.icon} alt="" class="rounded-full h-10 w-10" />
			</div>
			<div class="p-6 pt-0">
				<div class="text-2xl font-bold mb-2">{d.name}</div>
				<p class="text-xs text-muted-foreground" data-svelte-h="svelte-11thuc9">
					{d.description}
				</p>
			</div>
		</div>
	{/each}
</div>
