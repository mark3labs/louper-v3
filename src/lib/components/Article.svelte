<script lang="ts">
  import type { Snippet } from 'svelte'
  import Seo from '$lib/components/Seo.svelte'
  import { SITE_URL, canonical } from '$lib/seo'
  import { Calendar, Clock, ChevronLeft } from '@lucide/svelte'
  import type { LearnArticle } from '$lib/content/learn'

  /**
   * Shared shell for /learn articles. Handles SEO, JSON-LD, breadcrumbs and
   * consistent prose typography so individual articles only contain content.
   */
  let { article, children }: { article: LearnArticle; children: Snippet } = $props()

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      author: { '@type': 'Organization', name: 'Mark3Labs', url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Louper',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/img/louper-logo.png` },
      },
      mainEntityOfPage: canonical(`/learn/${article.slug}`),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonical('/') },
        { '@type': 'ListItem', position: 2, name: 'Learn', item: canonical('/learn') },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: canonical(`/learn/${article.slug}`),
        },
      ],
    },
  ]
</script>

<Seo
  title={article.title}
  description={article.description}
  canonicalPath={`/learn/${article.slug}`}
  type="article"
  publishedAt={article.publishedAt}
  {jsonLd}
/>

<article class="mx-auto max-w-3xl">
  <a
    href="/learn"
    class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
  >
    <ChevronLeft class="h-4 w-4" /> All guides
  </a>

  <header class="mt-4 mb-8 border-b pb-6">
    <h1 class="text-3xl md:text-4xl font-bold text-primary">{article.title}</h1>
    <p class="mt-3 text-lg text-muted-foreground">{article.description}</p>
    <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span class="inline-flex items-center gap-1">
        <Calendar class="h-3.5 w-3.5" />
        <time datetime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </span>
      <span class="inline-flex items-center gap-1">
        <Clock class="h-3.5 w-3.5" />
        {article.readingMinutes} min read
      </span>
    </div>
  </header>

  <div class="prose-louper">
    {@render children()}
  </div>

  <footer class="mt-12 border-t pt-6">
    <p class="text-sm text-muted-foreground">
      Found an error or want to suggest a topic? Louper is open source —
      <a href="https://github.com/mark3labs/louper-v3" class="text-primary hover:underline">
        open an issue on GitHub
      </a>
      or <a href="/contact" class="text-primary hover:underline">get in touch</a>.
    </p>
  </footer>
</article>

<style lang="postcss">
  /* Local prose styles (project does not use @tailwindcss/typography). */
  .prose-louper :global(h2) {
    @apply mt-10 mb-3 text-2xl font-bold text-primary scroll-mt-24;
  }
  .prose-louper :global(h3) {
    @apply mt-8 mb-2 text-xl font-semibold scroll-mt-24;
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
  .prose-louper :global(pre) {
    @apply my-5 overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm leading-6;
  }
  .prose-louper :global(pre code) {
    @apply bg-transparent p-0 font-normal;
  }
  .prose-louper :global(blockquote) {
    @apply my-5 border-l-4 border-primary/40 bg-muted/40 py-2 pl-4 italic text-muted-foreground;
  }
  .prose-louper :global(table) {
    @apply my-6 w-full border-collapse text-sm;
  }
  .prose-louper :global(th) {
    @apply border-b px-3 py-2 text-left font-semibold;
  }
  .prose-louper :global(td) {
    @apply border-b border-border/50 px-3 py-2 align-top;
  }
  .prose-louper :global(strong) {
    @apply font-semibold text-foreground;
  }
</style>
