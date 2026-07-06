<script lang="ts">
  import { onMount } from 'svelte'
  import { env } from '$env/dynamic/public'

  // Reusable Google AdSense ad unit.
  //
  // The publisher ID (ca-pub-XXXXXXXXXXXXXXXX) comes from the PUBLIC_ADSENSE_CLIENT
  // env var. The adsbygoogle.js loader is injected in production only (see
  // src/hooks.server.ts), so in dev/staging this renders an empty reserved box and
  // the push() call is a harmless no-op (window.adsbygoogle is undefined).
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

  onMount(() => {
    // onMount only runs in the browser, so this never executes during SSR.
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (e) {
      console.error('AdSense push failed:', e)
    }
  })
</script>

<div class="flex flex-col {className}">
  <span class="mb-1 text-xs uppercase tracking-wide text-muted-foreground/60"> Advertisement </span>
  <ins
    class="adsbygoogle block min-h-[120px]"
    style="display:block"
    data-ad-client={env.PUBLIC_ADSENSE_CLIENT}
    data-ad-slot={slot}
    data-ad-format={format}
    data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
  ></ins>
</div>
