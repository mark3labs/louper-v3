<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from 'bits-ui'
  
  type Props = CollapsiblePrimitive.ContentProps

  let { ...restProps }: Props = $props()
</script>

<CollapsiblePrimitive.Content {...restProps}>
  <slot />
</CollapsiblePrimitive.Content>
