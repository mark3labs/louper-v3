<script lang="ts">
  import {
    buildTitle,
    canonical,
    clampDescription,
    DEFAULT_DESCRIPTION,
    DEFAULT_OG_IMAGE,
    SITE_NAME,
  } from '$lib/seo'
  import { page } from '$app/stores'

  /**
   * Per-page SEO tags. Renders a unique <title>, meta description, canonical
   * URL and Open Graph / Twitter card metadata.
   *
   * `noindex` should be set on error pages and any screen that has no
   * meaningful publisher content of its own.
   */
  let {
    title,
    description = DEFAULT_DESCRIPTION,
    canonicalPath,
    image = DEFAULT_OG_IMAGE,
    noindex = false,
    type = 'website',
    publishedAt,
    jsonLd,
  }: {
    title?: string
    description?: string
    canonicalPath?: string
    image?: string
    noindex?: boolean
    type?: 'website' | 'article'
    publishedAt?: string
    jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  } = $props()

  let fullTitle = $derived(buildTitle(title))
  let desc = $derived(clampDescription(description))
  let href = $derived(canonical(canonicalPath ?? $page.url.pathname))

  // JSON-LD has to be injected as raw HTML because Svelte would otherwise
  // escape the JSON payload inside the script element.
  //
  // Safety: the payload is always JSON.stringify output (never raw user
  // input), and every `<` is escaped to \u003c so a value such as a contract
  // name can never terminate the element early. The tag name is assembled by
  // concatenation so this file contains no literal closing script tag.
  let jsonLdTag = $derived(
    jsonLd
      ? `<scr${'ipt'} type="application/ld+json">` +
          JSON.stringify(jsonLd).replace(/</g, '\\u003c') +
          `</scr${'ipt'}>`
      : undefined,
  )
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={desc} />
  <link rel="canonical" {href} />

  {#if noindex}
    <meta name="robots" content="noindex, follow" />
  {:else}
    <meta name="robots" content="index, follow, max-image-preview:large" />
  {/if}

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={desc} />
  <meta property="og:url" content={href} />
  <meta property="og:image" content={image} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={desc} />
  <meta name="twitter:image" content={image} />

  {#if publishedAt}
    <meta property="article:published_time" content={publishedAt} />
  {/if}

  {#if jsonLdTag}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- see justification above -->
    {@html jsonLdTag}
  {/if}
</svelte:head>
