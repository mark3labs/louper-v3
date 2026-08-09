<script lang="ts">
  import Seo from '$lib/components/Seo.svelte'
  import { learnArticles, learnCategories } from '$lib/content/learn'
  import { canonical } from '$lib/seo'
  import { Clock } from '@lucide/svelte'

  const byCategory = learnCategories
    .map((c) => ({ category: c, items: learnArticles.filter((a) => a.category === c) }))
    .filter((g) => g.items.length > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Learn: EIP-2535 Diamond Guides',
    description:
      'In-depth guides to the EIP-2535 Diamond standard: facets, selectors, storage patterns, upgrades and security.',
    url: canonical('/learn'),
    hasPart: learnArticles.map((a) => ({
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      url: canonical(`/learn/${a.slug}`),
      datePublished: a.publishedAt,
    })),
  }
</script>

<Seo
  title="Learn: Guides to EIP-2535 Diamonds"
  description="In-depth guides to the EIP-2535 Diamond standard — facets, function selectors, storage patterns, diamondCut upgrades and security review."
  canonicalPath="/learn"
  {jsonLd}
/>

<div class="mx-auto max-w-4xl">
  <header class="border-b pb-6">
    <h1 class="text-3xl md:text-4xl font-bold text-primary">Learn</h1>
    <p class="mt-3 text-lg text-muted-foreground">
      Practical, technical guides to the EIP-2535 Diamond standard — written for engineers building,
      integrating with, or auditing diamond contracts.
    </p>
  </header>

  {#if learnArticles.length}
    <div class="mt-8 rounded-lg border bg-card p-5">
      <p class="text-sm text-muted-foreground">
        New to diamonds? Start with
        <a href="/learn/what-is-a-diamond" class="font-medium text-primary hover:underline">
          What Is a Diamond? EIP-2535 Explained
        </a>, then read
        <a href="/learn/the-diamond-loupe" class="font-medium text-primary hover:underline">
          The Diamond Loupe
        </a> to understand how tools like Louper read a deployed contract.
      </p>
    </div>
  {/if}

  {#each byCategory as group (group.category)}
    <section class="mt-10">
      <h2 class="mb-4 text-xl font-semibold text-primary">{group.category}</h2>
      <ul class="grid gap-4 md:grid-cols-2">
        {#each group.items as a (a.slug)}
          <li>
            <a
              href={`/learn/${a.slug}`}
              class="flex h-full flex-col rounded-lg border bg-card p-5 transition-colors hover:border-primary/60"
            >
              <h3 class="text-lg font-semibold text-foreground">{a.title}</h3>
              <p class="mt-2 flex-1 text-sm text-muted-foreground">{a.description}</p>
              <span class="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock class="h-3.5 w-3.5" />
                {a.readingMinutes} min read
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>
