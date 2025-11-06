<script lang="ts">
  import * as Table from '$lib/components/ui/table'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Button } from '$lib/components/ui/button'
  import type { Diamond } from '$lib/types'
  import { Copy, ChevronsUpDown, Search, ExternalLink } from '@lucide/svelte'
  import { getContext } from 'svelte'
  import { copyToClipboard, abiMethods } from '$lib/utils'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Badge } from '$lib/components/ui/badge'
  import Separator from '$lib/components/ui/separator/separator.svelte'
  import { type Chain, toFunctionSelector } from 'viem'

  const diamond = getContext<Diamond>('diamond')
  const chain = getContext<Chain>('chain')
  const explorerUrl = chain?.blockExplorers?.default.url || 'https://etherscan.io'
</script>

<Table.Root>
  <Table.Caption>{diamond.facets.length} total facets</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="text-xl">Facet</Table.Head>
      <Table.Head class="text-xl">Methods</Table.Head>
      <Table.Head class="text-center text-xl">ABI</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each diamond.facets as f}
      <Table.Row class="border-b-0">
        <Table.Cell>
          <p class="font-medium leading-none text-2xl text-primary">{f.name}</p>
          <p class="text-lg text-muted-foreground">
            {f.address}
            <Button variant="ghost" on:click={() => copyToClipboard(f.address)} class="p-1">
              <Copy />
            </Button>
            <Button
              variant="ghost"
              class="p-1"
              href={`${explorerUrl}/address/${f.address}`}
              target="_blank"
            >
              <ExternalLink />
            </Button>
          </p>
        </Table.Cell>
        <Table.Cell class="w-1/2">
          <Collapsible.Root>
            <div class="flex items-center justify-start space-x-4">
              <h4 class="text-sm font-semibold">{f.abi.filter((m) => m.type === 'function').length}</h4>
              <Collapsible.Trigger>
                {#snippet child({ props }: { props: any })}
                  <Button {...props} variant="ghost" size="sm" class="w-9 p-0">
                    <ChevronsUpDown class="h-4 w-4" />
                    <span class="sr-only">Toggle</span>
                  </Button>
                {/snippet}
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content>
              <ul class="my-6 ml-6 [&>li]:mt-5">
                {#each abiMethods(f.abi) as m}
                  <li>
                    <div class="flex h-5 items-center space-x-4 text-sm">
                      <code
                        class="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap"
                      >
                        {m.name}
                      </code>
                      <Separator orientation="vertical" />

                      {#if m.name.indexOf('unknown_') > -1}
                        <code
                          class="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                        >
                          {m.name.split('_')[1]}
                        </code>
                        <Button
                          variant="ghost"
                          on:click={() => copyToClipboard(m.name.split('_')[1])}
                        >
                          <Copy />
                        </Button>
                      {:else}
                        <code
                          class="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                        >
                          {toFunctionSelector(m)}
                        </code>
                        <Button
                          variant="ghost"
                          on:click={() => copyToClipboard(toFunctionSelector(m))}
                        >
                          <Copy />
                        </Button>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ul>
            </Collapsible.Content>
          </Collapsible.Root>
        </Table.Cell>
        <Table.Cell class="text-center">
          <Dialog.Root>
            <Dialog.Trigger>
              {#snippet child({ props }: { props: any })}
                <button {...props} type="button" class="inline-flex items-center justify-center">
                  <Search />
                </button>
              {/snippet}
            </Dialog.Trigger>
            <Dialog.Content class="min-w-fit">
              <Dialog.Header>
                <Dialog.Title class="mb-5">{f.name}</Dialog.Title>
                <div class="max-h-[50vh] overflow-y-scroll">
                  <Dialog.Description class="relative">
                    <pre
                      class="rounded-lg bg-muted px-[0.5rem] py-[0.3rem] font-mono text-sm font-semibold mx-2">{JSON.stringify(
                        f.abi,
                        null,
                        2,
                      ).trim()}</pre>
                    <Button
                      variant="ghost"
                      class="absolute top-3 right-3"
                      on:click={() => copyToClipboard(JSON.stringify(f.abi))}
                    >
                      <Copy />
                    </Button>
                  </Dialog.Description>
                </div>
              </Dialog.Header>
            </Dialog.Content>
          </Dialog.Root>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
