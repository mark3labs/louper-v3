<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'

  type Props = {
    selected?: string
    open?: boolean
  }

  let { selected = $bindable(undefined), open = $bindable(undefined), ...restProps }: Props = $props()
</script>

<SelectPrimitive.Root type="single" bind:value={selected} bind:open {...restProps}>
  <slot />
</SelectPrimitive.Root>
