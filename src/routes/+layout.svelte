<script lang="ts">
	import { Toaster } from 'svelte-french-toast';
	import '../app.postcss';
	import { Check, ChevronUp, MagnifyingGlass } from 'radix-icons-svelte';
	import type { Address } from 'viem';
	import * as allChains from 'viem/chains';
	import * as Popover from '$lib/components/ui/popover';
	import { afterNavigate, goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { page } from '$app/stores';
	import * as Command from '$lib/components/ui/command';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';

	let network: string | undefined;
	let address: Address | undefined;
	let searchOpen = false;

	const chainOptions = Object.entries(allChains)
		.map(([key, chain]) => ({
			value: key,
			label: chain.name
		}))
		.filter((f) => f.value !== 'localhost' && f.value !== 'hardhat');

	$: selectedValue = chainOptions.find((f) => f.value === network)?.label ?? 'Select a chain...';

	const gotoDiamond = () => {
		goto(`/diamond/${address}?network=${network}`, { replaceState: true });
	};

	afterNavigate(() => {
		address = '' as Address;
		network = '';
		if ($page.params.address) {
			address = $page.params.address as Address;
		}
		if ($page.url.searchParams.has('network')) {
			network = $page.url.searchParams.get('network') as string;
		}
	});

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		searchOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<div class="border-b fixed top-0 bg-background w-full z-50 flex flex-row justify-between">
	<nav class="flex flex-row items-center p-2">
		<img src="/img/louper-logo.png" alt="Louper - The Ethereum Diamond Inspector" class="h-12" />
		<h2 class="ml-2 text-lg font-bold text-primary">Louper - The Ethereum Diamond Inspector</h2>
	</nav>
	<nav class="flex flex-row items-center p-2">
		<Button on:click={() => window.open('https://flair.dev?utm=louper', '_blank')}>
			Index Your Diamond w/ Flair!
		</Button>
	</nav>
</div>

<div class="container pt-20">
	<div class="my-24 rounded-[0.5rem] border shadow-sm shadow-primary">
		<div class="border-b">
			<div class="flex h-16 items-center p-5">
				<nav class="flex items-center space-x-4 lg:space-x-6 mx-6">
					<a
						href="/"
						class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Home
					</a>
					<a
						href="https://eips.ethereum.org/EIPS/eip-2535"
						target="_blank"
						class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Diamond Standard (EIP-2535)
					</a>
					<a
						href="/"
						class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Github
					</a>
					<a
						href="https://discord.com/channels/730508054143172710/951483625092816976"
						target="_blank"
						class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>
						Discord
					</a>
				</nav>
				<div class="ml-auto flex items-center space-x-4">
					<div>
						<input
							class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-9 md:w-[100px] lg:w-[300px]"
							type="search"
							placeholder="Diamond address..."
							bind:value={address}
						/>
					</div>
					<div>
						<Popover.Root bind:open={searchOpen} let:ids preventScroll>
							<Popover.Trigger asChild let:builder>
								<Button
									builders={[builder]}
									variant="outline"
									role="combobox"
									aria-expanded={searchOpen}
									class="w-[200px] justify-between"
								>
									{selectedValue}
									<ChevronUp class="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-[200px] p-0 h-96">
								<Command.Root>
									<Command.Input placeholder="Search chains..." />
									<Command.Empty>No chain found.</Command.Empty>
									<Command.Group>
										{#each chainOptions as chain}
											<Command.Item
												value={chain.value}
												onSelect={(currentValue) => {
													network = currentValue;
													closeAndFocusTrigger(ids.trigger);
												}}
											>
												<Check
													class={cn('mr-2 h-4 w-4', network !== chain.value && 'text-transparent')}
												/>
												{chain.label}
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.Root>
							</Popover.Content>
						</Popover.Root>
					</div>
					<button on:click={gotoDiamond}>
						<MagnifyingGlass class="h-6 w-8" />
					</button>
				</div>
			</div>
		</div>
		<div class="p-5">
			{#if $navigating}
				<div class="flex items-centerm justify-center space-x-2">
					<img
						src="/img/louper-logo.png"
						alt="Louper - The Ethereum Diamond Inspector"
						class="h-12 animate-spin"
					/>
					<span class="text-xl font-bold text-primary">Loading...</span>
				</div>
			{:else}
				<slot />
			{/if}
		</div>
	</div>
</div>
<Toaster />

<style lang="postcss">
</style>
