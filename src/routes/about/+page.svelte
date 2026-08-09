<script lang="ts">
  import Seo from '$lib/components/Seo.svelte'
  import { CONTACT_EMAIL, SITE_URL, canonical } from '$lib/seo'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: canonical('/about'),
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'Louper',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description:
        'Free open source tool for inspecting EIP-2535 Diamond smart contracts across EVM networks.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  }
</script>

<Seo
  title="About Louper"
  description="Louper is a free, open source tool for inspecting EIP-2535 Diamond smart contracts. Learn who builds it, how it works, and how it is funded."
  canonicalPath="/about"
  {jsonLd}
/>

<div class="mx-auto max-w-3xl">
  <h1 class="text-3xl md:text-4xl font-bold text-primary">About Louper</h1>
  <p class="mt-3 text-lg text-muted-foreground">
    A free, open source inspector for EIP-2535 Diamond smart contracts.
  </p>

  <div class="mt-8 space-y-6 leading-7 text-foreground/90">
    <section>
      <h2 class="mb-2 text-2xl font-bold text-primary">What Louper does</h2>
      <p>
        Diamond contracts built on <a
          href="https://eips.ethereum.org/EIPS/eip-2535"
          target="_blank"
          rel="noopener"
          class="text-primary hover:underline">EIP-2535</a
        >
        route each function call to a separate implementation contract called a facet. Because that routing
        table lives in contract storage rather than in bytecode, ordinary block explorers cannot show
        you what a diamond actually does — they see a fallback function and nothing else.
      </p>
      <p class="mt-4">
        Louper solves that. Give it an address and a network, and it calls the contract's
        <a href="/learn/the-diamond-loupe" class="text-primary hover:underline">loupe functions</a>
        to enumerate every facet and every function selector, then matches those selectors against verified
        source to reconstruct a human-readable interface. You get the full facet list, a combined ABI,
        and the ability to call read and write functions directly.
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-2xl font-bold text-primary">How it works</h2>
      <ol class="ml-6 list-decimal space-y-2">
        <li>Louper calls <code class="rounded bg-muted px-1">facets()</code> on the diamond.</li>
        <li>For each facet address returned, it fetches verified source from a block explorer.</li>
        <li>
          It filters each facet's ABI down to only the selectors the diamond actually registered.
        </li>
        <li>Unresolved selectors fall back to public selector databases.</li>
        <li>The result is rendered server-side and cached to keep repeat lookups fast.</li>
      </ol>
      <p class="mt-4">
        Everything is read from live chain state, so what you see reflects the contract as it exists
        now — not as a deployment script intended it to be.
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-2xl font-bold text-primary">Who builds it</h2>
      <p>
        Louper is built and maintained by <a
          href="https://github.com/mark3labs"
          target="_blank"
          rel="noopener"
          class="text-primary hover:underline">Mark3Labs</a
        >. It has been used by diamond developers, auditors and integrators since 2022, and the
        source is public under an open source licence.
      </p>
      <p class="mt-4">
        Contributions are welcome on <a
          href="https://github.com/mark3labs/louper-v3"
          target="_blank"
          rel="noopener"
          class="text-primary hover:underline">GitHub</a
        >, whether that is a bug report, a new chain, or a correction to one of the
        <a href="/learn" class="text-primary hover:underline">guides</a>.
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-2xl font-bold text-primary">How it is funded</h2>
      <p>
        Louper is free to use and has no accounts, no paywall and no usage limits. Running it costs
        money — RPC access, explorer API quotas and hosting — which is covered by Mark3Labs and by
        advertising displayed on the site. Ads are clearly labelled and never influence which
        contracts are shown or how they are presented.
      </p>
      <p class="mt-4">
        We do not sell your data. See the <a href="/privacy" class="text-primary hover:underline"
          >privacy policy</a
        > for exactly what is and is not collected.
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-2xl font-bold text-primary">Limitations worth knowing</h2>
      <ul class="ml-6 list-disc space-y-2">
        <li>
          Louper cannot show names for functions on unverified facets — only raw selectors. Bytecode
          does not contain function names.
        </li>
        <li>
          A contract that does not implement <code class="rounded bg-muted px-1">facets()</code> cannot
          be enumerated, even if it uses a diamond-like fallback.
        </li>
        <li>
          Contract metadata is cached, so a facet verified moments ago may take time to appear with
          its proper name.
        </li>
        <li>
          Louper is an inspection tool, not an audit. It reports what a contract exposes, not
          whether it is safe.
        </li>
      </ul>
    </section>

    <section>
      <h2 class="mb-2 text-2xl font-bold text-primary">Contact</h2>
      <p>
        Questions, corrections or partnership enquiries: <a
          href={`mailto:${CONTACT_EMAIL}`}
          class="text-primary hover:underline">{CONTACT_EMAIL}</a
        >, or see the <a href="/contact" class="text-primary hover:underline">contact page</a>.
      </p>
    </section>
  </div>
</div>
