<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'
  
  type Props = CollapsiblePrimitive.ContentProps & {
    children?: Snippet
  }

  let { children, ...restProps }: Props = $props()
</script>

<CollapsiblePrimitive.Content {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</CollapsiblePrimitive.Content>
