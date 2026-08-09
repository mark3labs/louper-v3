<script lang="ts">
  import Seo from '$lib/components/Seo.svelte'
  import Prose from '$lib/components/Prose.svelte'
  import { CONTACT_EMAIL, canonical } from '$lib/seo'
  import { Mail, Github, MessageCircle } from '@lucide/svelte'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: canonical('/contact'),
    mainEntity: {
      '@type': 'Organization',
      name: 'Mark3Labs',
      email: CONTACT_EMAIL,
      url: 'https://github.com/mark3labs',
    },
  }

  const channels = [
    {
      icon: Github,
      title: 'GitHub Issues',
      body: 'Bug reports, feature requests, missing networks, and corrections to the guides. This is the fastest route for anything technical, and the discussion stays public and searchable.',
      href: 'https://github.com/mark3labs/louper-v3/issues',
      label: 'Open an issue',
      external: true,
    },
    {
      icon: MessageCircle,
      title: 'Discord',
      body: 'Questions about diamonds, help interpreting what Louper shows you, or general discussion with other developers working with EIP-2535.',
      href: 'https://discord.com/channels/730508054143172710/951483625092816976',
      label: 'Join the conversation',
      external: true,
    },
    {
      icon: Mail,
      title: 'Email',
      body: 'Partnership and advertising enquiries, privacy and data requests, security disclosures, and anything you would rather not discuss in public.',
      href: `mailto:${CONTACT_EMAIL}`,
      label: CONTACT_EMAIL,
      external: false,
    },
  ]
</script>

<Seo
  title="Contact"
  description="How to reach the Louper team: GitHub issues for bugs and feature requests, Discord for questions, and email for privacy, security and partnership enquiries."
  canonicalPath="/contact"
  {jsonLd}
/>

<div class="mx-auto max-w-3xl">
  <h1 class="text-3xl md:text-4xl font-bold text-primary">Contact</h1>
  <p class="mt-3 text-lg text-muted-foreground">
    Louper is built and maintained by Mark3Labs. Here is how to reach us.
  </p>

  <div class="mt-8 grid gap-4">
    {#each channels as c (c.title)}
      <div class="rounded-lg border bg-card p-5">
        <h2 class="flex items-center gap-2 text-lg font-semibold text-primary">
          <c.icon class="h-5 w-5" />
          {c.title}
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">{c.body}</p>
        <a
          href={c.href}
          target={c.external ? '_blank' : undefined}
          rel={c.external ? 'noopener' : undefined}
          class="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          {c.label}
        </a>
      </div>
    {/each}
  </div>

  <Prose>
    <h2>Reporting a security issue</h2>
    <p>
      If you have found a vulnerability in Louper itself, please email
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> rather than opening a public issue, and
      give us a reasonable window to respond before disclosing.
    </p>
    <p>
      Please note we cannot help with vulnerabilities in third-party smart contracts that you have
      inspected using Louper — those should be reported to the relevant project directly.
    </p>

    <h2>Getting a contract listed</h2>
    <p>
      The featured diamonds on the homepage are curated examples of production EIP-2535 deployments.
      If you maintain a notable diamond and would like it considered, open a GitHub issue with the
      address, network and a short description of the protocol.
    </p>

    <h2>Privacy and data requests</h2>
    <p>
      For requests relating to personal data, email us with details of what you are asking for. As
      explained in our <a href="/privacy">privacy policy</a>, Louper has no user accounts and we
      typically hold no information that identifies you.
    </p>

    <h2>Before you write</h2>
    <p>
      A lot of common questions are already answered in the guides — in particular
      <a href="/learn/inspect-a-diamond-with-louper">how to inspect a diamond</a>, which covers the
      usual causes of "Unable to fetch diamond details" and missing facet names.
    </p>
  </Prose>
</div>
