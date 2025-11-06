<script lang="ts">
  import { allChains, chainMap } from '$lib/chains'
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Tabs from '$lib/components/ui/tabs'
  import { copyToClipboard } from '$lib/utils'
  import { switchChain } from '@wagmi/core'
  import { Copy, ExternalLink, Search } from '@lucide/svelte'
  import { onDestroy, onMount, setContext } from 'svelte'
  import { pushState } from '$app/navigation'
  import {
    chainId,
    connected,
    defaultConfig,
    disconnectWagmi,
    wagmiConfig,
  } from '$lib/stores/wagmi'
  import type { Chain } from 'viem'
  import { createPublicClient, http, fallback } from 'viem'
  import type { PageData } from './$types'
  import EditFacet from './EditFacet.svelte'
  import FacetsTable from './FacetsTable.svelte'
  import ReadFacetMethods from './ReadFacetMethods.svelte'
  import WriteFacetMethods from './WriteFacetMethods.svelte'
  import { page } from '$app/stores'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'

  export let data: PageData
  let selectedTab = $page.url.hash.replace('#', '') || 'facets'

  const chain: Chain = chainMap[data.chain]

  const transports = chain.rpcUrls.default.http.map((url) => http(url))

  const publicClient = createPublicClient({
    chain: chain,
    transport: fallback(transports),
  })

  setContext('diamond', data.diamond)
  setContext('chain', chain)
  setContext('publicClient', publicClient)

  const explorerUrl = chain?.blockExplorers?.default.url || 'https://etherscan.io'
  onMount(async () => {
    const louper = defaultConfig({
      walletConnectProjectId: '6d8897eb4adc9e4bb2f608642115f17a',
      chains: allChains as [Chain],
    })
    await louper.init()
  })

  const disconnect = async () => {
    if (browser) {
      const url = `${$page.url.pathname}${$page.url.search}#${selectedTab}`
      pushState(url, { url })

      if (!$connected) return
      await disconnectWagmi()
    }
  }

  onDestroy(async () => {
    await disconnect()
  })

  $: if ($connected && $chainId !== chain.id) {
    switchChain($wagmiConfig, { chainId: chain.id }).catch(() => disconnectWagmi())
  }
</script>

<div class="flex flex-col space-y-6">
  <div class="py-5">
    <p class="text-4xl text-primary font-bold">{data.diamond.name}</p>
    <p class="text-xl text-muted-foreground font-bold">
      {data.diamond.address}
      <Button variant="ghost" onclick={() => copyToClipboard(data.diamond.address)} class="p-1">
        <Copy />
      </Button>
      <Button
        variant="ghost"
        class="p-1"
        href={`${explorerUrl}/address/${data.diamond.address}`}
        target="_blank"
      >
        <ExternalLink />
      </Button>
    </p>
  </div>
  <!-- Move the magnifying glass btn here into a new div and add the text View Diamond ABI -->
  <div class="mt-5">
    <div class="flex items-center gap-2 mb-4">
      <Dialog.Root>
        <Dialog.Trigger
          class="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>View Diamond ABI</span>
          <Search />
        </Dialog.Trigger>
        <Dialog.Content class="min-w-fit">
          <Dialog.Header>
            <Dialog.Title class="mb-5">{data.diamond.name}</Dialog.Title>
            <div class="max-h-[50vh] overflow-y-scroll">
              <Dialog.Description class="relative">
                <pre
                  class="rounded-lg bg-muted px-[0.5rem] py-[0.3rem] font-mono text-sm font-semibold mx-2">{JSON.stringify(
                    data.diamondAbi,
                    null,
                    2,
                  ).trim()}</pre>
                <Button
                  variant="ghost"
                  class="absolute top-3 right-3"
                  onclick={() => copyToClipboard(JSON.stringify(data.diamondAbi))}
                >
                  <Copy />
                </Button>
              </Dialog.Description>
            </div>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog.Root>
    </div>
    <Tabs.Root bind:value={selectedTab} class="w-full">
      <Tabs.List class="mb-5">
        <Tabs.Trigger value="facets" onclick={disconnect}>Facets</Tabs.Trigger>
        <Tabs.Trigger value="history" onclick={disconnect}>History</Tabs.Trigger>
        <Tabs.Trigger value="read" onclick={disconnect}>Read</Tabs.Trigger>
        <Tabs.Trigger value="write" onclick={disconnect}>Write</Tabs.Trigger>
        <Tabs.Trigger value="edit" onclick={disconnect}>Edit</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="facets" class="border rounded-[0.5rem] p-5">
        <FacetsTable />
      </Tabs.Content>
      <Tabs.Content value="history" class="border rounded-[0.5rem] p-5">
        🚧 Under Construction... 🏗
      </Tabs.Content>
      <Tabs.Content value="read" class="border rounded-[0.5rem] p-5">
        <ReadFacetMethods />
      </Tabs.Content>
      <Tabs.Content value="write" class="border rounded-[0.5rem] p-5">
        <WriteFacetMethods />
      </Tabs.Content>
      <Tabs.Content value="edit" class="border rounded-[0.5rem] p-5">
        <EditFacet />
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>
