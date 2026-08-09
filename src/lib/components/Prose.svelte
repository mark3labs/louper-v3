<script lang="ts">
  import type { Snippet } from 'svelte'

  /**
   * Shared typography wrapper for long-form static pages (legal, contact).
   * Articles under /learn use Article.svelte, which layers headers and SEO on
   * top of the same style rules.
   */
  let { children, class: className = '' }: { children: Snippet; class?: string } = $props()
</script>

<div class="prose-louper {className}">
  {@render children()}
</div>

<style lang="postcss">
  .prose-louper :global(h2) {
    @apply mt-10 mb-3 text-2xl font-bold text-primary scroll-mt-24;
  }
  .prose-louper :global(h3) {
    @apply mt-6 mb-2 text-lg font-semibold scroll-mt-24;
  }
  .prose-louper :global(p) {
    @apply my-4 leading-7 text-foreground/90;
  }
  .prose-louper :global(ul) {
    @apply my-4 ml-6 list-disc text-foreground/90;
  }
  .prose-louper :global(ol) {
    @apply my-4 ml-6 list-decimal text-foreground/90;
  }
  .prose-louper :global(li) {
    @apply my-2 leading-7;
  }
  .prose-louper :global(a) {
    @apply text-primary underline underline-offset-4 hover:opacity-80;
  }
  .prose-louper :global(code) {
    @apply rounded bg-muted px-[0.3rem] py-[0.15rem] font-mono text-sm font-semibold;
  }
  .prose-louper :global(strong) {
    @apply font-semibold text-foreground;
  }
</style>
