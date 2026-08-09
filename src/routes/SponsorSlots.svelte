<script lang="ts">
  import AdSlot from '$lib/components/AdSlot.svelte'
  import { adUnits } from '$lib/ads'

  /**
   * Renders the configured AdSense units.
   *
   * IMPORTANT: this component does not decide *whether* ads are allowed on the
   * current screen — that is the layout's job via `shouldRenderAds()`. Adding a
   * usage of this component anywhere else would bypass the policy checks.
   *
   * Slot IDs come from PUBLIC_ADSENSE_SLOT_* env vars; unset or placeholder
   * values are filtered out in $lib/ads, so this renders nothing when
   * unconfigured.
   */
</script>

{#if adUnits.length}
  <div class="grid gap-4">
    {#each adUnits as ad (ad.slot)}
      <AdSlot slot={ad.slot} className={ad.className} />
    {/each}
  </div>
{/if}
