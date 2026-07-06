<script lang="ts">
  import { page } from '$app/stores'
  import { Button } from '$lib/components/ui/button'
  import * as Alert from '$lib/components/ui/alert'
  import { AlertTriangle } from '@lucide/svelte'
</script>

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
  <Button href="/" variant="outline">Back to home</Button>
</div>
