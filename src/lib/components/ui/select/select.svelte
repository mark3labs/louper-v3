<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'

  type Props = {
    selected?: string
    open?: boolean
    children?: Snippet
  }

  let { selected = $bindable(undefined), open = $bindable(undefined), children, ...restProps }: Props = $props()
</script>

<SelectPrimitive.Root type="single" bind:value={selected} bind:open {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</SelectPrimitive.Root>
