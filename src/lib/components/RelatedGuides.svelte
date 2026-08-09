<script lang="ts">
  import { relatedArticles } from '$lib/content/learn'

  /** Cross-links shown at the bottom of every guide. */
  let { slug, limit = 3 }: { slug: string; limit?: number } = $props()

  const related = $derived(relatedArticles(slug, limit))
</script>

{#if related.length}
  <nav aria-label="Related guides" class="mt-12 border-t pt-6">
    <h2 class="mb-4 text-lg font-semibold text-primary">Keep reading</h2>
    <ul class="grid gap-3 md:grid-cols-3 list-none ml-0">
      {#each related as r (r.slug)}
        <li class="ml-0">
          <a
            href={`/learn/${r.slug}`}
            class="block h-full rounded-lg border p-4 no-underline transition-colors hover:border-primary/60"
          >
            <span class="block text-xs uppercase tracking-wide text-muted-foreground">
              {r.category}
            </span>
            <span class="mt-1 block font-medium text-foreground">{r.title}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
