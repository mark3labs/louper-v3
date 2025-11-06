<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'

  export let selected: string | undefined = undefined
  export let open: boolean | undefined = undefined
</script>

<SelectPrimitive.Root type="single" bind:value={selected} bind:open {...$$restProps}>
  <slot />
</SelectPrimitive.Root>
