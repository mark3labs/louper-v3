<script lang="ts">
  import { cn } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'

  type $$Props = HTMLAttributes<HTMLDivElement>

  let className: $$Props['class'] = undefined
  export { className as class }
</script>

<div class={cn('px-2 py-1.5 text-sm font-semibold', className)} {...$$restProps}>
  <slot />
</div>
