<script lang="ts">
  import Featured from './Featured.svelte'
  import Seo from '$lib/components/Seo.svelte'
  import { learnArticles } from '$lib/content/learn'
  import { SITE_URL } from '$lib/seo'
  import { Search, Layers, FileCode2, ShieldCheck } from '@lucide/svelte'

  const steps = [
    {
      icon: Search,
      title: 'Enter an address',
      body: 'Paste any diamond contract address and choose its network. No account, no API key, no rate limit.',
    },
    {
      icon: Layers,
      title: 'Louper calls the loupe',
      body: 'Louper reads the on-chain facets() function to enumerate every facet contract and every function selector the diamond routes.',
    },
    {
      icon: FileCode2,
      title: 'Selectors become readable',
      body: 'Verified source is matched against each selector to recover real function names, parameters and a combined, callable ABI.',
    },
    {
      icon: ShieldCheck,
      title: 'Inspect and interact',
      body: 'Browse facets, call view functions for free, send transactions with your own wallet, and export the ABI as JSON.',
    },
  ]

  const faqs = [
    {
      q: 'What is an EIP-2535 diamond?',
      a: 'A diamond is a smart contract that routes each function call to a separate implementation contract called a facet. This lets a protocol exceed the 24 KB contract size limit and upgrade individual functions without redeploying everything.',
    },
    {
      q: 'Why can I not see a diamond on a normal block explorer?',
      a: "A diamond's function-to-facet mapping lives in contract storage, not in its bytecode. An explorer only sees a fallback function, so it cannot show you the contract's real interface. Louper reads the mapping from chain state instead.",
    },
    {
      q: 'Is Louper free?',
      a: 'Yes. Louper is free and open source, with no accounts and no usage limits. Hosting and RPC costs are covered by Mark3Labs and by advertising displayed on the site.',
    },
    {
      q: 'Why do some functions show as unknown_0x12345678?',
      a: 'That facet is not verified on a block explorer, and its selector is not in any public selector database. Function names cannot be recovered from bytecode alone, so only the raw 4-byte selector is available.',
    },
    {
      q: 'Does Louper audit contracts?',
      a: 'No. Louper reports what a contract exposes; it makes no judgement about whether that contract is safe. Use it as a research tool alongside a professional audit, not as a replacement for one.',
    },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Louper',
      url: SITE_URL,
      description:
        'Free open source tool for inspecting EIP-2535 Diamond smart contracts across EVM networks.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]
</script>

<Seo
  description="Louper is a free, open source tool for inspecting EIP-2535 Diamond smart contracts. Explore facets, function selectors and combined ABIs across 20+ EVM networks."
  canonicalPath="/"
  {jsonLd}
/>

<div class="space-y-16">
  <section class="mx-auto max-w-3xl text-center">
    <h1 class="text-3xl md:text-4xl font-bold text-primary">
      Inspect any EIP-2535 Diamond contract
    </h1>
    <p class="mt-4 text-lg leading-7 text-muted-foreground">
      Diamond contracts spread their logic across many facet contracts, which is why a block
      explorer shows you almost nothing when you look one up. Louper reads the diamond directly from
      chain state and reconstructs the full picture: every facet, every function selector, and a
      combined ABI you can actually use.
    </p>
    <p class="mt-4 leading-7 text-muted-foreground">
      Paste an address in the search bar above to get started, or explore one of the production
      diamonds below. New to the standard? Start with
      <a href="/learn/what-is-a-diamond" class="text-primary hover:underline">
        What Is a Diamond? EIP-2535 Explained</a
      >.
    </p>
  </section>

  <section class="text-left">
    <h2 class="mb-2 text-2xl font-bold text-primary">How Louper works</h2>
    <p class="mb-6 max-w-3xl text-muted-foreground">
      Everything is read live from the blockchain, so what you see reflects the contract as it
      exists right now — not as a deployment script intended it to be.
    </p>
    <ol class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {#each steps as step, i (step.title)}
        <li class="rounded-lg border bg-card p-5">
          <div class="flex items-center gap-2">
            <step.icon class="h-5 w-5 text-primary" />
            <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step {i + 1}
            </span>
          </div>
          <h3 class="mt-3 font-semibold text-foreground">{step.title}</h3>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
        </li>
      {/each}
    </ol>
  </section>

  <section class="text-left">
    <Featured />
  </section>

  <section class="text-left">
    <h2 class="mb-2 text-2xl font-bold text-primary">Learn the diamond standard</h2>
    <p class="mb-6 max-w-3xl text-muted-foreground">
      Technical guides written for engineers building, integrating with, or auditing EIP-2535
      contracts.
    </p>
    <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each learnArticles.slice(0, 6) as a (a.slug)}
        <li>
          <a
            href={`/learn/${a.slug}`}
            class="flex h-full flex-col rounded-lg border bg-card p-5 transition-colors hover:border-primary/60"
          >
            <span class="text-xs uppercase tracking-wide text-muted-foreground">{a.category}</span>
            <h3 class="mt-1 font-semibold text-foreground">{a.title}</h3>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{a.description}</p>
          </a>
        </li>
      {/each}
    </ul>
    <a href="/learn" class="mt-6 inline-block font-medium text-primary hover:underline">
      Browse all guides →
    </a>
  </section>

  <section class="mx-auto max-w-3xl text-left">
    <h2 class="mb-6 text-2xl font-bold text-primary">Frequently asked questions</h2>
    <dl class="space-y-6">
      {#each faqs as f (f.q)}
        <div class="border-b pb-5 last:border-b-0">
          <dt class="font-semibold text-foreground">{f.q}</dt>
          <dd class="mt-2 leading-7 text-muted-foreground">{f.a}</dd>
        </div>
      {/each}
    </dl>
  </section>
</div>
