<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as Dialog from '$lib/components/ui/dialog'
  import Input from '$lib/components/ui/input/input.svelte'
  import * as Table from '$lib/components/ui/table'
  import {
    FacetCutAction,
    type Contract,
    type Diamond,
    type FacetCut,
    type UpgradeStrategy,
  } from '$lib/types'
  import { abiMethods, copyToClipboard, getContractInformation } from '$lib/utils'
  import { Copy } from '@lucide/svelte'
  import { getContext } from 'svelte'
  import {
    toFunctionSelector,
    isAddress,
    type Address,
    parseAbi,
    zeroAddress,
    type WriteContractReturnType,
    type AbiItem,
    type AbiFunction,
  } from 'viem'
  import type { Chain } from 'viem/chains'
  import ConnectWallet from './ConnectWallet.svelte'
  import { connected, wagmiConfig } from '$lib/stores/wagmi'
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import { getWalletClient, waitForTransactionReceipt } from '@wagmi/core'
  import toast from 'svelte-french-toast'
  import * as Card from '$lib/components/ui/card'
  import { Label } from '$lib/components/ui/label'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  const diamond = getContext<Diamond>('diamond')
  const chain = getContext<Chain>('chain')

  let newFacets: Contract[] = []
  let newFacetAddress: Address | undefined
  let addFacetDialogOpen = false
  let addFacetError: string | undefined
  let checkboxes: Record<string, Checkbox> = {}
  let busy = false
  let strategy: UpgradeStrategy = {
    additions: {},
    replacements: {},
    removals: {},
  }
  let initAddress: Address | undefined
  let initCallData: string | undefined

  let facetCuts: FacetCut[] = []

  const buildCuts = () => {
    // Go through the strategy and build an array of fact cuts

    // Additions
    facetCuts = []
    if (strategy.additions) {
      for (const [address, selectors] of Object.entries(strategy.additions)) {
        if (!selectors.length) continue
        facetCuts = [
          ...facetCuts,
          {
            facetAddress: address as Address,
            action: FacetCutAction.Add,
            functionSelectors: selectors as string[],
          },
        ]
      }
    }

    // Replacements
    if (strategy.replacements) {
      for (const [address, selectors] of Object.entries(strategy.replacements)) {
        if (!selectors.length) continue
        facetCuts = [
          ...facetCuts,
          {
            facetAddress: address as Address,
            action: FacetCutAction.Replace,
            functionSelectors: selectors as string[],
          },
        ]
      }
    }

    // Removals
    if (strategy.removals) {
      const removalCut: FacetCut = {
        facetAddress: zeroAddress,
        action: FacetCutAction.Remove,
        functionSelectors: [],
      }
      for (const [, selectors] of Object.entries(strategy.removals)) {
        if (!selectors.length) continue
        removalCut.functionSelectors = [...removalCut.functionSelectors, ...selectors]
      }
      if (removalCut.functionSelectors.length) {
        facetCuts = [...facetCuts, removalCut]
      }
    }
  }

  const upgrade = async () => {
    const abi = [
      'function diamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors)[], address initAddress, bytes callData) external',
    ]

    buildCuts()

    try {
      busy = true
      const walletClient = await getWalletClient($wagmiConfig, { chainId: chain.id })
      const hash: WriteContractReturnType = (await walletClient?.writeContract({
        address: diamond.address,
        abi: parseAbi(abi),
        functionName: 'diamondCut' as never,
        args: [facetCuts, initAddress ?? zeroAddress, initCallData ?? '0x'],
        chain,
      })) as WriteContractReturnType
      await waitForTransactionReceipt($wagmiConfig, { hash, timeout: 60000 })
      toast.success('Diamond upgraded successfully')
      await goto(
        `/diamond/${$page.params.address}?network=${
          $page.url.searchParams.get('network') ?? 'mainnet'
        }`,
        { invalidateAll: true },
      )
    } catch (e) {
      console.error(e)
      toast.error('Diamond upgrade failed')
    } finally {
      busy = false
    }
  }

  const updateRemovals = (address: Address, selector: string) => {
    return (val: boolean | 'indeterminate' | undefined) => {
      if (val) {
        if (!strategy.removals[address]) {
          strategy.removals[address] = []
        }
        strategy.removals[address] = [...strategy.removals[address], selector]
      } else {
        strategy.removals[address] = strategy.removals[address].filter(
          (r: string) => r !== selector,
        )
      }
    }
  }

  const updateAdditionsAndReplacements = (address: Address, selector: string) => {
    return (val: boolean | 'indeterminate' | undefined) => {
      if (val) {
        // Initialize the additions and replacements arrays if they don't exist
        if (!strategy.replacements[address]) {
          strategy.replacements[address] = []
        }
        if (!strategy.additions[address]) {
          strategy.additions[address] = []
        }

        // Check if the selector exists on one of the diamond's facets already
        if (
          diamond.facets.find((f) =>
            abiMethods(f.abi).find((m) => toFunctionSelector(m) === selector),
          )
        ) {
          // If it does, add it to the replacements list
          strategy.replacements[address] = [...strategy.replacements[address], selector]
          // And check all removals arrays and remove the selector from them
          for (const [addr, removals] of Object.entries(strategy.removals)) {
            strategy.removals[addr as Address] = removals.filter((r: string) => {
              if (r !== selector) return true
              checkboxes[addr.slice(0, 5) + selector].$set({ checked: false })
              return false
            })
          }
          strategy = { ...strategy }
          return
        }

        // If it doesn't, add it to the additions list
        strategy.additions[address] = [...strategy.additions[address], selector]
      } else {
        // Remove the selector from the additions and replacements lists
        strategy.additions[address] = strategy.additions[address].filter(
          (r: string) => r !== selector,
        )
        strategy.replacements[address] = strategy.replacements[address].filter(
          (r: string) => r !== selector,
        )
      }

      strategy = { ...strategy }
    }
  }

  const addFacet = async () => {
    if (!newFacetAddress) {
      addFacetError = 'Facet address is required'
      return
    }
    if (newFacetAddress === diamond.address) {
      addFacetError = 'Cannot add the diamond itself as a facet'
      return
    }
    if (!isAddress(newFacetAddress)) {
      addFacetError = 'Invalid address'
      return
    }
    if (newFacets.find((f) => f.address === newFacetAddress)) {
      addFacetError = 'Facet already added'
      return
    }
    if (diamond.facets.find((f) => f.address === newFacetAddress)) {
      addFacetError = 'Facet already exists'
      return
    }
    try {
      addFacetError = ''
      busy = true
      const newFacet: Contract = await getContractInformation(newFacetAddress, chain.id)
      if (!newFacet.abi) {
        addFacetError = 'Could not fetch facet ABI'
        return
      }
      newFacets = [...newFacets, newFacet]
      addFacetDialogOpen = false
    } catch (e) {
      addFacetError = (e as Error).toString()
    } finally {
      busy = false
      newFacetAddress = undefined
    }
  }

  const toggleAllRemovals = (address: Address) => {
    return (checked: boolean | 'indeterminate' | undefined) => {
      for (const [k, v] of Object.entries(checkboxes)) {
        if (k.slice(0, 5) === address.slice(0, 5)) {
          if (v.$$.ctx[2].disabled) continue
          const upFn = updateRemovals(address, k.slice(-10))
          const boolChecked = checked === true || checked === 'indeterminate'
          v.$set({ checked: boolChecked })
          upFn(boolChecked)
        }
      }
    }
  }

  const toggleAllAdditionsAndReplacements = (address: Address) => {
    return (checked: boolean | 'indeterminate' | undefined) => {
      for (const [k, v] of Object.entries(checkboxes)) {
        if (k.slice(0, 5) === address.slice(0, 5)) {
          if (v.$$.ctx[2].disabled) continue
          const upFn = updateAdditionsAndReplacements(address, k.slice(-10))
          const boolChecked = checked === true || checked === 'indeterminate'
          v.$set({ checked: boolChecked })
          upFn(boolChecked)
        }
      }
    }
  }

  const getFunctionSelector = (m: AbiFunction) => {
    if (m.name.indexOf('unknown_') > -1) {
      return m.name.split('_')[1]
    }
    return toFunctionSelector(m)
  }
</script>

<div class="flex flex-row items-center justify-between p-2 space-x-3">
  <ConnectWallet />
  <div>
    <Dialog.Root bind:open={addFacetDialogOpen}>
      <Dialog.Trigger>
        {#snippet child({ props }: { props: any })}
          <Button {...props} variant="secondary">Add Facet</Button>
        {/snippet}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Enter a facet address</Dialog.Title>
          <Dialog.Description>
            {#if addFacetError}
              <p class="text-red-500">{addFacetError}</p>
            {/if}
            <form class="space-y-2 text-right my-5" on:submit|preventDefault={addFacet}>
              <Input placeholder="Facet Address" bind:value={newFacetAddress} required />
              <Button disabled={busy} type="submit">Fetch Facet ABI</Button>
            </form>
          </Dialog.Description>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Root>
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        {#snippet child({ props }: { props: any })}
          <Button {...props} disabled={!$connected}>Upgrade Diamond</Button>
        {/snippet}
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description>
            This will make modifications to your diamond contract. This can cause your contract to
            become unusable. Please make sure you know what you are doing before continuing.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action on:click={upgrade}>Continue</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </div>
</div>
<Card.Root class="my-5">
  <Card.Header>
    <Card.Title>Diamond Init</Card.Title>
    <Card.Description>Optional initialation arguments</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>
      <Label>Init Contract Address</Label>
      <Input bind:value={initAddress} placeholder="0x..." />
    </p>
    <p>
      <Label>Init Calldata</Label>
      <Input bind:value={initCallData} />
    </p>
  </Card.Content>
</Card.Root>
<Table.Root>
  <Table.Caption>Add/Remove/Replace facets</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="text-xl">Facet</Table.Head>
      <Table.Head class="text-xl" />
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <!-- New facets -->
    {#each newFacets as f}
      <Table.Row class="border border-dashed border-green-400">
        <Table.Cell>
          <p class="font-medium leading-none text-2xl text-primary">{f.name}</p>
          <p class="text-lg text-muted-foreground">
            {f.address}
            <Button variant="ghost" on:click={() => copyToClipboard(f.address)}>
              <Copy />
            </Button>
          </p>
        </Table.Cell>
        <Table.Cell>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="text-left">Add/Replace</Table.Head>
                <Table.Head />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row class="border-none">
                <Table.Cell>
                  <Checkbox onCheckedChange={toggleAllAdditionsAndReplacements(f.address)} />
                </Table.Cell>
                <Table.Cell><Badge variant="secondary">Toggle All</Badge></Table.Cell>
              </Table.Row>
              {#each abiMethods(f.abi) as m}
                <Table.Row class="border-none">
                  <Table.Cell class="text-left">
                    <div>
                      <Checkbox
                        bind:this={checkboxes[f.address.slice(0, 5) + getFunctionSelector(m)]}
                        onCheckedChange={updateAdditionsAndReplacements(
                          f.address,
                          getFunctionSelector(m),
                        )}
                      />
                    </div>
                  </Table.Cell>
                  <Table.Cell class="font-medium text-left w-full text-lg">
                    <div
                      class:bg-green-500={strategy.additions[f.address] &&
                        strategy.additions[f.address].includes(getFunctionSelector(m))}
                      class:bg-yellow-500={strategy.replacements[f.address] &&
                        strategy.replacements[f.address].includes(getFunctionSelector(m))}
                      class="flex items-center p-1 rounded-md bg-opacity-90"
                    >
                      <Badge class="mr-2">{getFunctionSelector(m)}</Badge>
                      {m.name}
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Table.Cell>
      </Table.Row>
    {/each}

    <!-- Existing facets -->
    {#each diamond.facets as f}
      <Table.Row>
        <Table.Cell>
          <p class="font-medium leading-none text-2xl text-primary">{f.name}</p>
          <p class="text-lg text-muted-foreground">
            {f.address}
            <Button variant="ghost" on:click={() => copyToClipboard(f.address)}>
              <Copy />
            </Button>
          </p>
        </Table.Cell>
        <Table.Cell>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="text-left text-red-500">Remove</Table.Head>
                <Table.Head />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row class="border-none">
                <Table.Cell>
                  <Checkbox onCheckedChange={toggleAllRemovals(f.address)} />
                </Table.Cell>
                <Table.Cell><Badge variant="secondary">Toggle All</Badge></Table.Cell>
              </Table.Row>
              {#each abiMethods(f.abi) as m}
                <Table.Row class="border-none">
                  <Table.Cell class="text-left">
                    <Checkbox
                      bind:this={checkboxes[f.address.slice(0, 5) + getFunctionSelector(m)]}
                      onCheckedChange={updateRemovals(f.address, getFunctionSelector(m))}
                      disabled={Object.values(strategy.replacements).some((r) =>
                        r.includes(getFunctionSelector(m)),
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell class="font-medium text-left w-full text-lg">
                    <div
                      class:bg-red-500={strategy.removals[f.address] &&
                        strategy.removals[f.address].includes(getFunctionSelector(m))}
                      class:bg-yellow-500={Object.values(strategy.replacements).some((r) =>
                        r.includes(getFunctionSelector(m)),
                      )}
                      class="flex items-center p-1 rounded-md bg-opacity-90"
                    >
                      <Badge class="mr-2">{getFunctionSelector(m)}</Badge>
                      {m.name}
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
