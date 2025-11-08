<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    tags?: string[]
    allowPaste?: boolean
    placeholder?: string
    class?: string
  }

  let {
    tags = $bindable([]),
    allowPaste = false,
    placeholder = 'Add tag...',
    class: className,
  }: Props = $props()

  let inputValue = $state('')

  function addTag(tag: string) {
    // Ensure tags is always an array
    if (!tags) {
      tags = []
    }
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      tags = [...tags, trimmed]
    }
  }

  function removeTag(index: number) {
    if (!tags) return
    tags = tags.filter((_, i) => i !== index)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
        inputValue = ''
      }
    } else if (e.key === 'Backspace' && !inputValue && tags && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  function handlePaste(e: ClipboardEvent) {
    if (!allowPaste) return
    e.preventDefault()
    const pastedText = e.clipboardData?.getData('text') || ''
    const newTags = pastedText
      .split(/[,\n\t]/)
      .map((t) => t.trim())
      .filter(Boolean)
    newTags.forEach(addTag)
    inputValue = ''
  }

  function handleBlur() {
    if (inputValue.trim()) {
      addTag(inputValue)
      inputValue = ''
    }
  }
</script>

<div
  class={cn(
    'svelte-tags-input-layout flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
    className,
  )}
>
  {#each tags || [] as tag, i}
    <span
      class="svelte-tags-input-tag inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
    >
      {tag}
      <button
        type="button"
        class="ml-1 hover:text-primary-foreground/80"
        onclick={() => removeTag(i)}
        aria-label="Remove tag"
      >
        ×
      </button>
    </span>
  {/each}
  <input
    bind:value={inputValue}
    onkeydown={handleKeydown}
    onpaste={handlePaste}
    onblur={handleBlur}
    type="text"
    {placeholder}
    class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
  />
</div>
