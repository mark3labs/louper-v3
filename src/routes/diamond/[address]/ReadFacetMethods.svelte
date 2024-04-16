<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import * as Select from '$lib/components/ui/select'
  import * as Table from '$lib/components/ui/table'
  import type { ArgsResult, Diamond, FacetSelection } from '$lib/types'
  import { abiMethods, copyToClipboard } from '$lib/utils'
  import type { AbiFunction } from 'abitype'
  import { CaretSort, Copy, CornerBottomLeft, SketchLogo } from 'radix-icons-svelte'
  import { getContext } from 'svelte'
  import Tags from 'svelte-tags-input'
  import { type PublicClient, toFunctionSelector } from 'viem'

  const diamond = getContext<Diamond>('diamond')
  let activeAbi: AbiFunction[] = []
  let selectedFacet: string
  let argsResults: ArgsResult[] = []
  let busy = false

  const onFacetChange = (s: unknown) => {
    const selection = <FacetSelection>s
    activeAbi = selection.value
    selectedFacet = selection.label
    for (const [idx] of Object(activeAbi).entries()) {
      argsResults[idx] = { args: [], result: null }
    }
  }

  const publicClient = getContext<PublicClient>('publicClient')

  const queryContract = async (idx: number) => {
    try {
      argsResults[idx].result = null
      argsResults[idx].error = undefined
      busy = true
      const data = await publicClient.readContract({
        address: diamond.address,
        abi: [activeAbi[idx]],
        functionName: activeAbi[idx].name,
        args: argsResults[idx].args,
      })
      argsResults[idx].result = data
    } catch (e: unknown) {
      if (e instanceof Error) {
        argsResults[idx].error = e.toString()
      } else {
        argsResults[idx].error = 'An unknown error occurred'
      }
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
        abi: abiMethods(f.abi).filter(
          (i) => i.stateMutability !== 'nonpayable' && i.stateMutability !== 'payable',
        ),
      }
    })
    .filter((f) => f.abi.length > 0)
</script>

<Table.Root>
  <Table.Caption>{selectedFacet ? `${activeAbi.length} available method(s)` : ''}</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="text-xl pb-5"
        >{selectedFacet ?? 'Choose a facet to interact with.'}</Table.Head
      >
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
                on:submit|preventDefault={() => queryContract(idx)}
                class="flex flex-col space-y-3"
              >
                {#each m.inputs as input, i}
                  <div class="grid w-full max-w-xl items-center gap-1.5">
                    <Label for="email">{input.name ?? 'var'} ({input.type})</Label>
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
                  <Button type="submit" disabled={busy}>Query</Button>
                </div>
                <div class="flex items-center justify-start space-x-2">
                  <CornerBottomLeft />
                  <div>
                    {m.outputs.reduce((a, o) => `${a}${o.name} ${o.type}, `, '').slice(0, -2)}
                  </div>
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
                <div class="text-red-500 font-medium">{argsResults[idx].error}</div>
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
