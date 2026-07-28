<script lang="ts">
  import AdSlot from '$lib/components/AdSlot.svelte'

  // Google AdSense slot configuration.
  //
  // UPDATE the `slot` values below with real AdSense unit IDs (the
  // data-ad-slot number) created in your AdSense dashboard. The publisher ID
  // (ca-pub-...) is provided via the PUBLIC_ADSENSE_CLIENT env var and the
  // adsbygoogle.js loader is injected in production by src/hooks.server.ts.
  //
  // Add more entries to render additional ad units on the page.
  const adSlots: { slot: string; className?: string }[] = [
    { slot: '0000000000' }, // placeholder - replace with a real AdSense unit ID
  ]
</script>

<div class="grid gap-4 mb-8">
  {#each adSlots as ad, i (i)}
    <AdSlot slot={ad.slot} className={ad.className} />
  {/each}
</div>
