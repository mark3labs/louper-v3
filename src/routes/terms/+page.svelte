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
  title="Terms of Service"
  description="The terms governing use of Louper, including acceptable use, disclaimers about smart contract data, and limitation of liability."
  canonicalPath="/terms"
/>

<div class="mx-auto max-w-3xl">
  <h1 class="text-3xl md:text-4xl font-bold text-primary">Terms of Service</h1>
  <p class="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

  <Prose>
    <p class="mt-6">
      These terms govern your use of Louper at <a href={SITE_URL}>{SITE_URL}</a> and its related command
      line tool (together, the "Service"), operated by Mark3Labs. By using the Service you agree to these
      terms. If you do not agree, please do not use the Service.
    </p>

    <h2>1. What Louper is</h2>
    <p>
      Louper is a free, open source tool for inspecting EIP-2535 Diamond smart contracts. It reads
      publicly available data from blockchain networks and block explorers and presents it in a
      readable form. It also provides educational guides about the diamond standard.
    </p>

    <h2>2. Not financial, legal or security advice</h2>
    <p>
      <strong>
        Louper is an inspection tool, not an audit service. Nothing on this site is financial,
        investment, legal or security advice.
      </strong>
      Information displayed describes what a contract exposes; it does not indicate that a contract is
      safe, trustworthy, or fit for any purpose. Our
      <a href="/learn/diamond-security-checklist">security checklist</a> is educational material and is
      not a substitute for a professional audit.
    </p>
    <p>
      Interacting with smart contracts carries risk, including total loss of funds. You are solely
      responsible for your own decisions and transactions.
    </p>

    <h2>3. Accuracy of data</h2>
    <p>
      Data is sourced from public blockchain nodes and third-party block explorers. It may be
      incomplete, delayed, cached, or wrong — for example when a facet is unverified, when an
      explorer returns stale metadata, or when an RPC provider returns an error. We make no warranty
      as to the accuracy, completeness or timeliness of any information shown. Always verify
      critical information directly against the chain.
    </p>

    <h2>4. Wallet connections and transactions</h2>
    <p>
      Connecting a wallet is optional. When you send a transaction through the Service, you do so
      directly from your own wallet to the blockchain. We never take custody of your funds, never
      receive your private keys, and cannot reverse, cancel or recover any transaction. You are
      responsible for confirming the network, contract address and arguments before signing.
    </p>

    <h2>5. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>
        Use automated tools to place unreasonable load on the Service, or to circumvent rate limits.
      </li>
      <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure.</li>
      <li>Use the Service to facilitate illegal activity, fraud or the targeting of others.</li>
      <li>
        Interfere with advertising displayed on the site, or generate invalid activity against it.
      </li>
      <li>
        Misrepresent data obtained from the Service as an audit, endorsement or certification.
      </li>
    </ul>
    <p>
      Reasonable programmatic use of the public JSON endpoint is welcome. If you need higher volume,
      please get in touch rather than scraping aggressively.
    </p>

    <h2>6. Intellectual property</h2>
    <p>
      Louper's source code is released under the licence stated in its
      <a href="https://github.com/mark3labs/louper-v3" target="_blank" rel="noopener"
        >GitHub repository</a
      >, and your use of the code is governed by that licence. Written guides and site content are ©
      Mark3Labs and may be quoted with attribution and a link, but not republished wholesale.
    </p>
    <p>
      Smart contract data, ABIs and source code belong to their respective authors. Project names
      and logos are the property of their owners; their appearance on Louper does not imply any
      affiliation or endorsement in either direction.
    </p>

    <h2>7. Third-party links and advertising</h2>
    <p>
      The Service links to third-party sites, including block explorers and project websites, and
      displays third-party advertising. We do not control and are not responsible for third-party
      content, products or practices. Advertising is clearly labelled and is not an endorsement. See
      our <a href="/privacy">privacy policy</a> for how advertising cookies are handled.
    </p>

    <h2>8. Availability</h2>
    <p>
      The Service is provided free of charge and without any uptime commitment. We may change,
      suspend or discontinue any part of it at any time, and may restrict access that we reasonably
      believe to be abusive.
    </p>

    <h2>9. Disclaimer of warranties</h2>
    <p>
      The Service is provided "as is" and "as available", without warranties of any kind, express or
      implied, including merchantability, fitness for a particular purpose, accuracy and
      non-infringement, to the maximum extent permitted by law.
    </p>

    <h2>10. Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, Mark3Labs and its contributors shall not be liable for
      any indirect, incidental, special, consequential or exemplary damages, or for any loss of
      funds, profits, data or goodwill, arising out of your use of or inability to use the Service —
      including reliance on any information it displays.
    </p>

    <h2>11. Indemnity</h2>
    <p>
      You agree to indemnify and hold harmless Mark3Labs and its contributors from any claim or
      demand arising out of your use of the Service or your violation of these terms.
    </p>

    <h2>12. Changes to these terms</h2>
    <p>
      We may update these terms from time to time. The "last updated" date will change when we do.
      Continuing to use the Service after a change means you accept the revised terms.
    </p>

    <h2>13. Contact</h2>
    <p>
      Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or see
      the <a href="/contact">contact page</a>.
    </p>
  </Prose>
</div>
