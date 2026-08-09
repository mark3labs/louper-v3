<script lang="ts">
  import { onMount } from 'svelte'
  import { adsenseClient, isValidSlot } from '$lib/ads'

  /**
   * A single Google AdSense unit.
   *
   * This component assumes the caller has already decided ads are permitted on
   * the current screen (see `shouldRenderAds` in $lib/ads). It additionally
   * refuses to render if the publisher ID or slot ID is missing or is still the
   * placeholder value, so a misconfiguration produces no markup at all rather
   * than an empty box labelled "Advertisement".
   */
  let {
    slot,
    format = 'auto',
    fullWidthResponsive = true,
    className = '',
  }: {
    slot: string
    format?: string
    fullWidthResponsive?: boolean
    className?: string
  } = $props()

  const client = adsenseClient()
  const enabled = $derived(!!client && isValidSlot(slot))

  let mounted = $state(false)

  onMount(() => {
    if (!enabled) return
    mounted = true
    try {
      // `Window.adsbygoogle` is declared in src/app.d.ts
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (e) {
      console.error('AdSense push failed:', e)
    }
  })
</script>

{#if enabled && mounted}
  <aside class="flex flex-col {className}" aria-label="Advertisement">
    <span class="mb-1 text-xs uppercase tracking-wide text-muted-foreground/60">Advertisement</span>
    <ins
      class="adsbygoogle block"
      style="display:block"
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    ></ins>
  </aside>
{/if}
