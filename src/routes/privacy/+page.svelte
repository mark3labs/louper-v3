<script lang="ts">
  import Seo from '$lib/components/Seo.svelte'
  import Prose from '$lib/components/Prose.svelte'
  import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_URL } from '$lib/seo'

  const updated = new Date(LEGAL_LAST_UPDATED).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
</script>

<Seo
  title="Privacy Policy"
  description="How Louper handles data: analytics, advertising cookies, wallet connections, and your choices under GDPR and CCPA."
  canonicalPath="/privacy"
/>

<div class="mx-auto max-w-3xl">
  <h1 class="text-3xl md:text-4xl font-bold text-primary">Privacy Policy</h1>
  <p class="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

  <Prose>
    <p class="mt-6">
      This policy explains what information is collected when you use Louper (<a href={SITE_URL}
        >{SITE_URL}</a
      >), why it is collected, and what control you have over it. Louper is operated by Mark3Labs
      ("we", "us").
    </p>

    <h2>Summary</h2>
    <ul>
      <li>We do not require an account and we do not ask for your name, email or address.</li>
      <li>We do not sell personal information.</li>
      <li>Our own analytics are cookieless and aggregate.</li>
      <li>
        We display advertising from Google AdSense, which <strong>does</strong> use cookies and
        similar technologies. You can opt out — see
        <a href="#advertising">Advertising</a>.
      </li>
      <li>Connecting a wallet is optional and only needed to send transactions.</li>
    </ul>

    <h2>Information we collect</h2>

    <h3>Information you provide</h3>
    <p>
      Louper has no sign-up, and we do not operate contact forms that store submissions. If you
      email us, we hold that correspondence only as long as needed to answer you.
    </p>

    <h3>Contract lookups</h3>
    <p>
      When you inspect a contract, we record the contract address, the network, the contract name
      and a counter of how many times that contract has been viewed. This is used to power features
      such as popular-contract listings and to cache results. It describes <em
        >public blockchain contracts</em
      >, not you, and it is not linked to your identity or IP address.
    </p>

    <h3>Analytics</h3>
    <p>We use two privacy-focused analytics services to understand aggregate traffic:</p>
    <ul>
      <li>
        <strong>Plausible</strong> (self-hosted by us) — cookieless, collects no personal data and does
        not track users across sites.
      </li>
      <li>
        <strong>Simple Analytics</strong> — cookieless and privacy-focused; see their
        <a href="https://simpleanalytics.com/privacy-policy" target="_blank" rel="noopener"
          >privacy policy</a
        >.
      </li>
    </ul>
    <p>
      Neither service sets tracking cookies or builds a profile of you. They record aggregate
      figures such as page views, referrer and approximate country.
    </p>

    <h3>Server logs</h3>
    <p>
      Our hosting infrastructure keeps standard access logs, which may include IP address, user
      agent and requested URL. These are used for security, abuse prevention and debugging, and are
      retained for a limited period.
    </p>

    <h3>Wallet connections</h3>
    <p>
      Connecting a wallet is entirely optional and only required to send write transactions. When
      you connect, the site can see your public wallet address and the network you are on. We never
      receive your private keys or seed phrase, and we cannot move funds. Wallet connection is
      handled in your browser via WalletConnect and similar providers, which have their own privacy
      policies.
    </p>

    <h2 id="advertising">Advertising</h2>
    <p>
      Louper is free to use. Hosting, RPC access and explorer API quotas are funded partly through
      advertising displayed on the site.
    </p>
    <ul>
      <li>
        Google, as a third-party vendor, uses cookies to serve ads on this site. Google's use of
        advertising cookies enables it and its partners to serve ads based on your visit to this and
        other sites.
      </li>
      <li>
        You may opt out of personalised advertising by visiting
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener"
          >Google Ads Settings</a
        >.
      </li>
      <li>
        You can opt out of third-party vendor cookies for personalised advertising at
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener"
          >www.aboutads.info/choices</a
        >
        or
        <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener"
          >optout.networkadvertising.org</a
        >.
      </li>
      <li>
        Third-party ad networks may use cookies, web beacons and similar technologies. We do not
        control these technologies and they are governed by the relevant vendor's privacy policy.
        See
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener">how Google uses information from sites that use its services</a
        >.
      </li>
    </ul>
    <p>
      Advertising is clearly labelled and kept visually separate from Louper's own content.
      Advertisers have no influence over which contracts are shown, how contract data is presented,
      or the content of our guides.
    </p>

    <h2>Cookies and local storage</h2>
    <p>Louper itself does not use cookies for tracking. The following may be set:</p>
    <ul>
      <li>
        <strong>Advertising cookies</strong> set by Google and its partners, as described above.
      </li>
      <li>
        <strong>Local storage</strong> used by your wallet provider to remember a connection you chose
        to make. This stays in your browser.
      </li>
    </ul>
    <p>
      You can block or delete cookies in your browser settings. Doing so will not prevent you from
      using Louper's inspection features.
    </p>

    <h2>Third parties we rely on</h2>
    <ul>
      <li>
        <strong>Blockchain RPC providers</strong> — to read contract data from public networks.
      </li>
      <li>
        <strong>Block explorers</strong> (such as Etherscan and equivalents) — to fetch verified contract
        source and ABIs.
      </li>
      <li><strong>Google AdSense</strong> — advertising.</li>
      <li><strong>Plausible and Simple Analytics</strong> — aggregate analytics.</li>
      <li><strong>WalletConnect</strong> — optional wallet connectivity.</li>
    </ul>
    <p>
      Requests your browser makes to these services are subject to their own privacy policies. Note
      that reading data from a public blockchain necessarily involves your request reaching an RPC
      provider.
    </p>

    <h2>Legal bases (EEA/UK)</h2>
    <p>Where the GDPR applies, we process data on these bases:</p>
    <ul>
      <li>
        <strong>Legitimate interests</strong> — operating and securing the site, and understanding aggregate
        usage.
      </li>
      <li>
        <strong>Consent</strong> — for personalised advertising cookies, where consent is required in
        your jurisdiction. Where required, a consent prompt is presented by our advertising partner and
        you may withdraw consent at any time.
      </li>
    </ul>

    <h2>Your rights</h2>
    <p>
      Depending on where you live, you may have the right to access, correct, delete or port
      personal data we hold about you, to object to processing, and to lodge a complaint with a
      supervisory authority. California residents have the right to know what personal information
      is collected and to opt out of its "sale" — we do not sell personal information.
    </p>
    <p>
      Because Louper has no accounts, we usually hold no information that identifies you personally.
      To exercise a right, email
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
    </p>

    <h2>Data retention</h2>
    <p>
      Contract lookup records and cached contract metadata are kept for as long as they are useful
      for caching and site features. Server logs are kept for a limited period. Aggregate analytics
      contain no personal data.
    </p>

    <h2>Children</h2>
    <p>
      Louper is a developer tool and is not directed at children under 13 (or under 16 in the EEA).
      We do not knowingly collect personal information from children.
    </p>

    <h2>International transfers</h2>
    <p>
      Our service providers may process data outside your country, including in the United States.
      Where required, transfers rely on appropriate safeguards such as the European Commission's
      standard contractual clauses.
    </p>

    <h2>Changes to this policy</h2>
    <p>
      We may update this policy from time to time. The "last updated" date above will change when we
      do. Material changes will be highlighted on the site.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also
      our <a href="/terms">terms of service</a>.
    </p>
  </Prose>
</div>
