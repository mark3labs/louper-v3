<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import * as Select from '$lib/components/ui/select'
  import * as Table from '$lib/components/ui/table'
  import type { ArgsResult, Diamond } from '$lib/types'
  import { copyToClipboard } from '$lib/utils'
  import { getWalletClient, getPublicClient } from '@wagmi/core'
  import type { AbiFunction } from 'abitype'
  import { CaretSort, Copy, SketchLogo } from 'radix-icons-svelte'
  import { getContext } from 'svelte'
  import Tags from 'svelte-tags-input'
  import { connected, wagmiConfig } from '$lib/stores/wagmi'
  import { toFunctionSelector, parseEther, type WriteContractReturnType } from 'viem'
  import type { Chain } from 'viem/chains'
  import ConnectWallet from './ConnectWallet.svelte'

  const diamond = getContext<Diamond>('diamond')
  const chain = getContext<Chain>('chain')
  let activeAbi: AbiFunction[] = []
  let selectedFacet: string
  let argsResults: ArgsResult[] = []
  let busy = false

  const publicClient = getContext<ReturnType<typeof getPublicClient>>('publicClient')

  const onFacetChange = (s: { value: AbiFunction[]; label: string; disable: false }) => {
    activeAbi = s.value
    selectedFacet = s.label
    for (const [idx] of Object(activeAbi).entries()) {
      argsResults[idx] = { args: [], result: null, error: undefined }
    }
  }

  const writeContract = async (idx: number) => {
    try {
      argsResults[idx].error = undefined
      busy = true
      const walletClient = await getWalletClient($wagmiConfig, { chainId: chain.id })
      const hash: WriteContractReturnType = (await walletClient?.writeContract({
        address: diamond.address,
        abi: [activeAbi[idx]],
        functionName: activeAbi[idx].name as never,
        args: argsResults[idx].args || undefined,
        value: argsResults[idx].value ? parseEther(String(argsResults[idx].value)) : 0n,
        chain,
      })) as WriteContractReturnType
      const transaction = await publicClient.waitForTransactionReceipt({ hash })
      argsResults[idx].result = transaction
    } catch (e) {
      argsResults[idx].error = (e as Error).toString()
      console.error(e)
    } finally {
      busy = false
    }
  }

  const facetsList = diamond.facets
    .filter((f) => f.name !== undefined)
    .map((f) => {
      return {
        name: f.name,
        address: f.address,
        abi: f.abi
          .filter((i) => i.type === 'function')
          .filter(
            (i) => i.stateMutability !== 'view' && i.stateMutability !== 'pure',
          ) as AbiFunction[],
      }
    })
    .filter((f) => f.abi.length > 0)
</script>

<div class="flex flex-row items-center justify-start p-2">
  <ConnectWallet />
</div>
<Table.Root>
  <Table.Caption>{selectedFacet ? `${activeAbi.length} available method(s)` : ''}</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="text-xl pb-5">
        {selectedFacet ?? 'Choose a facet to interact with.'}
      </Table.Head>
      <Table.Head class="flex items-center justify-end">
        <Select.Root onSelectedChange={onFacetChange}>
          <Select.Trigger class="w-[280px]">
            <Select.Value placeholder="Choose Facet" />
          </Select.Trigger>
          <Select.Content class="h-64 overflow-y-auto">
            {#each facetsList as f}
              <Select.Item value={f.abi}>{f.name}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each activeAbi as m, idx}
      <Table.Row>
        <Table.Cell colspan={2}>
          <Collapsible.Root>
            <div class="flex items-center justify-start space-x-4">
              <div>
                <p>
                  <span class="font-medium leading-none text-2xl text-primary">
                    {m.name}
                  </span>
                  <Collapsible.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      variant="ghost"
                      size="sm"
                      class="p-0 uppercase mx-2"
                    >
                      <CaretSort class="h-4 w-4 mr-2" />
                      <span class="text-muted-foreground">Expand</span>
                    </Button>
                  </Collapsible.Trigger>
                </p>
                <p class="text-lg text-muted-foreground">
                  {toFunctionSelector(m)}
                  <Button variant="ghost" on:click={() => copyToClipboard(toFunctionSelector(m))}>
                    <Copy />
                  </Button>
                </p>
              </div>
            </div>
            <Collapsible.Content class="p-5 flex flex-col space-y-3">
              <form
                on:submit|preventDefault={() => writeContract(idx)}
                class="flex flex-col space-y-3"
              >
                {#if m.stateMutability === 'payable'}
                  <div class="grid w-full max-w-xl items-center gap-1.5">
                    <Label>Value</Label>
                    <Input
                      placeholder="Value"
                      bind:value={argsResults[idx].value}
                      required
                      type="number"
                    />
                  </div>
                {/if}
                {#each m.inputs as input, i}
                  <div class="grid w-full max-w-xl items-center gap-1.5">
                    <Label>{input.name ?? 'var'} ({input.type})</Label>
                    {#if input.type === 'bool'}
                      <Checkbox bind:checked={argsResults[idx].args[i]} />
                    {:else if input.type.indexOf('[') > -1 && input.type.indexOf(']') > -1}
                      <div class="tags-input">
                        <Tags bind:tags={argsResults[idx].args[i]} allowPaste />
                      </div>
                    {:else}
                      <Input
                        placeholder={`${input.name ?? 'var'} (${input.type})`}
                        bind:value={argsResults[idx].args[i]}
                        type={input.type.indexOf('int') > -1 ? 'number' : 'text'}
                        required
                      />
                    {/if}
                  </div>
                {/each}
                <div>
                  <Button type="submit" disabled={busy || !$connected}>Write</Button>
                </div>
              </form>
              {#if busy}
                <div class="flex items-center justify-start">
                  <SketchLogo color="#6D28D9" class="mr-2 animate-spin h-6 w-6" />
                  <span class="text-lg text-muted-foreground">Loading...<span /></span>
                </div>
              {/if}
              {#if argsResults[idx].result !== undefined && argsResults[idx].result !== null}
                <div>
                  <pre>{JSON.stringify(
                      argsResults[idx].result,
                      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
                      2,
                    )}</pre>
                </div>
              {/if}
              {#if argsResults[idx].error}
                <div class="text-red-500 font-medium max-w-xl break-words">
                  {argsResults[idx].error}
                </div>
              {/if}
            </Collapsible.Content>
          </Collapsible.Root>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>

<style lang="postcss">
  .tags-input :global(.svelte-tags-input-layout) {
    @apply !rounded-md !border !border-input !bg-background !px-3 !text-sm;
  }

  .tags-input :global(.svelte-tags-input-tag) {
    @apply !rounded !bg-primary !text-foreground;
  }
</style>
