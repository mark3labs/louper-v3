<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte'
  import * as Popover from '$lib/components/ui/popover'
  import { switchChain } from '@wagmi/core'
  import { Dot } from '@lucide/svelte'
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
        if (!$wagmiConfig) {
          console.error('Wagmi config not initialized')
          return
        }
        await connect($wagmiConfig, {
          connector: safe(),
        })
      } else {
        if (!$web3Modal) {
          console.error('Web3Modal not initialized')
          return
        }
        await $web3Modal.open()
      }
      if ($connected && $chainId !== chain.id) {
        if (!$wagmiConfig) {
          console.error('Wagmi config not initialized for chain switch')
          return
        }
        await switchChain($wagmiConfig, { chainId: chain.id })
      }
      if (isSafeApp) {
        isUsingSafe.set(true)
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
      {#snippet child({ props }: { props: any })}
        <Button {...props} variant="secondary" disabled={busy}>
          <span class="text-green-500 font-medium"><Dot class="h-4 w-4 mr-2" /></span>
          {$signerAddress.slice(0, 5)}...{$signerAddress.slice(-4)}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="text-center">
      <Button onclick={disconnectWallet}>Disconnect</Button>
    </Popover.Content>
  </Popover.Root>
{:else}
  <Button onclick={connectWallet} disabled={busy}>Connect Wallet</Button>
{/if}
