<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte'
  import * as Popover from '$lib/components/ui/popover'
  import { switchChain } from '@wagmi/core'
  import { ShadowInner } from 'radix-icons-svelte'
  import { getContext, onMount } from 'svelte'
  import {
    chainId,
    connected,
    disconnectWagmi,
    signerAddress,
    web3Modal,
    wagmiConfig,
    isUsingSafe,
  } from '$lib/stores/wagmi'
  import { connect } from '@wagmi/core'
  import type { Chain } from 'viem/chains'
  import { safe } from '@wagmi/connectors'
  import SafeAppsSDK from '@safe-global/safe-apps-sdk'

  let busy = false
  let isSafeApp = false

  const chain = getContext<Chain>('chain')

  const connectWallet = async () => {
    try {
      busy = true
      if (isSafeApp) {
        await connect($wagmiConfig, {
          connector: safe(),
        })
      } else {
        await $web3Modal.open()
      }
      if ($connected && $chainId !== chain.id) {
        if (isSafeApp) {
          isUsingSafe.set(true)
        }
        await switchChain($wagmiConfig, { chainId: chain.id })
      }
    } catch (e) {
      console.error(e)
      await disconnectWagmi()
    } finally {
      busy = false
    }
  }

  const disconnectWallet = async () => {
    isUsingSafe.set(false)
    await disconnectWagmi()
  }

  onMount(async () => {
    // check if we're in an iframe
    if (window?.parent === window) {
      return
    }

    const sdk = new SafeAppsSDK()
    const safe = await Promise.race([
      sdk.safe.getInfo(),
      new Promise<undefined>((resolve) => setTimeout(resolve, 200)),
    ])
    isSafeApp = !!safe
  })
</script>

{#if $connected && $signerAddress}
  <Popover.Root>
    <Popover.Trigger>
      <Button variant="secondary" disabled={busy}>
        <span class="text-green-500 font-medium"><ShadowInner class="h-4 w-4 mr-2" /></span>
        {$signerAddress.slice(0, 5)}...{$signerAddress.slice(-4)}
      </Button>
    </Popover.Trigger>
    <Popover.Content class="text-center">
      <Button on:click={disconnectWallet}>Disconnect</Button>
    </Popover.Content>
  </Popover.Root>
{:else}
  <Button on:click={connectWallet} disabled={busy}>Connect Wallet</Button>
{/if}
