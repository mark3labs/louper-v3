<script lang="ts">
  import { page } from '$app/stores'
  import { Button } from '$lib/components/ui/button'
  import * as Alert from '$lib/components/ui/alert'
  import { AlertTriangle } from '@lucide/svelte'
  import Seo from '$lib/components/Seo.svelte'
</script>

<!-- Error screens carry no publisher content, so they must never be indexed
     (and the layout suppresses advertising on them). -->
<Seo
  title={$page.status === 404 ? 'Page not found' : 'Something went wrong'}
  description="The page you requested could not be loaded."
  noindex
/>

<div class="flex flex-col items-center justify-center space-y-6 py-16">
  <Alert.Root class="max-w-xl p-5" variant="destructive">
    <AlertTriangle class="h-6 w-6" />
    <Alert.Title class="ml-2 text-xl">
      {$page.status === 404 ? 'Not found' : 'Something went wrong'}
    </Alert.Title>
    <Alert.Description class="ml-2">
      {$page.error?.message ?? 'An unexpected error occurred.'}
      {#if $page.status === 400}
        <p class="mt-2 text-sm text-muted-foreground">
          Double-check the diamond address and network — the contract must implement the EIP-2535
          <code>facets()</code> loupe function.
        </p>
      {/if}
    </Alert.Description>
  </Alert.Root>
  <div class="flex flex-wrap items-center justify-center gap-3">
    <Button href="/" variant="outline">Back to home</Button>
    <Button href="/learn/inspect-a-diamond-with-louper" variant="ghost">
      Troubleshooting guide
    </Button>
  </div>
</div>
