<script lang="ts">
  import { cn } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = HTMLAttributes<HTMLDivElement> & {
    children?: Snippet
  }

  let { class: className, children, ...restProps }: Props = $props()
</script>

<div class={cn('px-2 py-1.5 text-sm font-semibold', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
