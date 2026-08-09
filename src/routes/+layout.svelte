<script lang="ts">
  import { Toaster } from '$lib/components/ui/sonner'
  import { toast } from 'svelte-sonner'
  import '../app.postcss'
  import { Check, ChevronsUpDown, Search, Terminal } from '@lucide/svelte'
  import { isAddress, type Address } from 'viem'
  import { chainMap } from '$lib/chains'
  import * as Popover from '$lib/components/ui/popover'
  import { afterNavigate, goto } from '$app/navigation'
  import { navigating } from '$app/stores'
  import { page } from '$app/stores'
  import * as Command from '$lib/components/ui/command'
  import { cn } from '$lib/utils'
  import { Button } from '$lib/components/ui/button'
  import * as Alert from '$lib/components/ui/alert'
  import type { Snippet } from 'svelte'
  import SponsorSlots from './SponsorSlots.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import { shouldRenderAds } from '$lib/ads'

  let {
    children,
  }: {
    children: Snippet
  } = $props()

  let network: string | undefined = $state()
  let address: Address | undefined = $state()
  let searchOpen = $state(false)

  const chainOptions = Object.entries(chainMap).map(([key, chain]) => ({
    value: key,
    label: chain.name,
  }))

  let selectedValue = $derived(
    chainOptions.find((f) => f.value === network)?.label ?? 'Select a chain...',
  )

  let canSearch = $derived(!!network && !!address && isAddress(address))

  const gotoDiamond = (e?: Event) => {
    e?.preventDefault()
    if (!canSearch) {
      toast.error('Enter a valid diamond address and select a chain')
      return
    }
    const networkParam = network === 'ethereum' ? 'mainnet' : network
    goto(`/diamond/${address}?network=${networkParam}`, { replaceState: true })
  }

  afterNavigate(() => {
    address = '' as Address
    network = ''
    if ($page.params.address) {
      address = $page.params.address as Address
    }
    if ($page.url.searchParams.has('network')) {
      const n = $page.url.searchParams.get('network') as string
      // Legacy URLs used `ethereum` instead of `mainnet`
      network = n === 'ethereum' ? 'mainnet' : n
    }
  })

  // Advertising gate. Ads must never render on loading screens, on the error
  // boundary, or on thin utility pages -- see $lib/ads for the full policy.
  //
  // A diamond that resolves with zero facets has nothing meaningful on the
  // page, so it counts as thin content even though the route itself is allowed.
  let isThinDiamond = $derived(
    $page.url.pathname.startsWith('/diamond/') && ($page.data?.diamond?.facets?.length ?? 0) < 1,
  )

  let adsVisible = $derived(
    shouldRenderAds({
      pathname: $page.url.pathname,
      isNavigating: !!$navigating,
      hasError: !!$page.error,
      thinContent: isThinDiamond,
    }),
  )
</script>

<div class="border-b fixed top-0 bg-background w-full z-50 flex flex-row justify-between">
  <nav class="flex flex-row items-center p-2 min-w-0">
    <img src="/img/louper-logo.png" alt="Louper - The Ethereum Diamond Inspector" class="h-12" />
    <h2 class="ml-2 text-lg font-bold text-primary truncate">
      <span class="sm:hidden">Louper</span>
      <span class="hidden sm:inline">Louper - The Ethereum Diamond Inspector</span>
    </h2>
  </nav>
  <nav class="flex flex-row items-center p-2"></nav>
</div>

<div class="pt-20 container max-w-2xl">
  <Alert.Root class="p-5">
    <Terminal class="h-8 w-8" />
    <Alert.Title class="ml-2 text-xl">Try Louper CLI!</Alert.Title>
    <Alert.Description class="ml-2 font-mono text-opacity-25 before:content-['$']">
      &nbsp;npm install -g @mark3labs/louper-cli@latest
    </Alert.Description>
  </Alert.Root>
</div>

<div class="container">
  <div class="my-12 rounded-[0.5rem] border shadow-sm shadow-primary">
    <div class="border-b">
      <div class="flex flex-wrap items-center gap-y-3 p-5">
        <nav class="flex flex-wrap items-center gap-x-4 gap-y-2 lg:gap-x-6 mx-2 md:mx-6">
          <a
            href="/"
            class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </a>
          <a
            href="/learn"
            class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Learn
          </a>
          <a
            href="https://eips.ethereum.org/EIPS/eip-2535"
            target="_blank"
            class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Diamond Standard (EIP-2535)
          </a>
          <a
            href="https://github.com/mark3labs/louper-v3"
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
        <form class="ml-auto flex flex-wrap items-center gap-2 md:gap-4" onsubmit={gotoDiamond}>
          <div>
            <label for="diamond-address-input" class="sr-only">Diamond address</label>
            <input
              id="diamond-address-input"
              class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-9 md:w-[100px] lg:w-[300px]"
              type="search"
              placeholder="Diamond address..."
              autocomplete="off"
              spellcheck="false"
              bind:value={address}
            />
          </div>
          <div>
            <Popover.Root bind:open={searchOpen}>
              <Popover.Trigger>
                {#snippet child({ props }: { props: any })}
                  <Button
                    {...props}
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    class="w-[200px] justify-between"
                  >
                    {selectedValue}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-[200px] p-0">
                <Command.Root>
                  <Command.Input placeholder="Search chains..." />
                  <Command.List>
                    <Command.Empty>No chain found.</Command.Empty>
                    <Command.Group>
                      {#each chainOptions as chain (chain.value)}
                        <Command.Item
                          value={`${chain.label} ${chain.value}`}
                          onSelect={() => {
                            network = chain.value
                            searchOpen = false
                          }}
                        >
                          <Check
                            class={cn(
                              'mr-2 h-4 w-4',
                              network !== chain.value && 'text-transparent',
                            )}
                          />
                          {chain.label}
                        </Command.Item>
                      {/each}
                    </Command.Group>
                  </Command.List>
                </Command.Root>
              </Popover.Content>
            </Popover.Root>
          </div>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Inspect diamond"
            title="Inspect diamond"
            disabled={!canSearch}
          >
            <Search class="h-6 w-8" />
          </Button>
        </form>
      </div>
    </div>
    <div class="p-5">
      {#if $navigating}
        <div class="flex items-center justify-center space-x-2">
          <img
            src="/img/louper-logo.png"
            alt="Louper - The Ethereum Diamond Inspector"
            class="h-12 animate-spin"
          />
          <span class="text-xl font-bold text-primary">Loading...</span>
        </div>
      {:else}
        {@render children()}
      {/if}
    </div>
  </div>

  <!-- Advertising sits below the page content, never above it, and only on
       screens that carry substantial publisher content of their own. -->
  {#if adsVisible}
    <div class="mb-12">
      <SponsorSlots />
    </div>
  {/if}
</div>

<SiteFooter />
<Toaster richColors theme="dark" position="bottom-right" />

<style lang="postcss">
</style>
