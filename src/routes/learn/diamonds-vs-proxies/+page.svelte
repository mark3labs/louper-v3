<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('diamonds-vs-proxies')!

  const transparentCode = `// Transparent proxy: one implementation, all calls
contract TransparentUpgradeableProxy {
    address implementation;  // stored at a fixed EIP-1967 slot

    fallback() external payable {
        // admin calls go to the proxy's own admin functions,
        // everything else delegatecalls the single implementation
        _delegate(implementation);
    }
}`

  const uupsCode = `// UUPS: upgrade logic lives in the implementation
contract MyContractV1 is UUPSUpgradeable, OwnableUpgradeable {
    function _authorizeUpgrade(address) internal override onlyOwner {}

    // ... protocol logic, all in this one contract, all under 24 KB
}`

  const diamondCode = `// Diamond: many implementations, routed per selector
fallback() external payable {
    address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
    require(facet != address(0), "Diamond: Function does not exist");
    _delegate(facet);
}`
</script>

<Article {article}>
  <p>
    Diamonds are often presented as the natural evolution of proxy patterns. They are not — they are
    a different set of trade-offs, better for some systems and worse for others. This guide compares
    EIP-2535 against the two patterns most teams actually use.
  </p>

  <h2>The three patterns in one paragraph each</h2>

  <h3>Transparent proxy (EIP-1967 + OpenZeppelin)</h3>
  <p>
    A proxy holds an implementation address in a fixed storage slot and delegatecalls it for every
    call. A separate <code>ProxyAdmin</code> contract performs upgrades. The proxy inspects
    <code>msg.sender</code> on each call to decide whether it is an admin call or a user call, which is
    where the "transparent" name and a small permanent gas overhead come from.
  </p>

  <pre><code>{transparentCode}</code></pre>

  <h3>UUPS (EIP-1822 style)</h3>
  <p>
    Same single-implementation idea, but the upgrade function lives in the <em>implementation</em>
    rather than the proxy. That makes the proxy smaller and cheaper to call, at the cost of a sharp edge:
    ship an implementation without upgrade logic and the contract is frozen forever.
  </p>

  <pre><code>{uupsCode}</code></pre>

  <h3>Diamond (EIP-2535)</h3>
  <p>
    A proxy with a <em>mapping</em> of implementations rather than a single one. Each function
    selector routes to its own facet, and <code>diamondCut</code> edits that mapping.
  </p>

  <pre><code>{diamondCode}</code></pre>

  <h2>Head to head</h2>

  <table>
    <thead>
      <tr>
        <th>Dimension</th>
        <th>Transparent</th>
        <th>UUPS</th>
        <th>Diamond</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>24 KB size limit</td>
        <td>Applies to the whole implementation</td>
        <td>Applies to the whole implementation</td>
        <td>Applies per facet — effectively unbounded</td>
      </tr>
      <tr>
        <td>Upgrade granularity</td>
        <td>All-or-nothing</td>
        <td>All-or-nothing</td>
        <td>Per function selector</td>
      </tr>
      <tr>
        <td>Per-call gas overhead</td>
        <td>Highest (admin check + delegatecall)</td>
        <td>Lowest (delegatecall only)</td>
        <td>Middle (storage lookup + delegatecall)</td>
      </tr>
      <tr>
        <td>Deployment cost</td>
        <td>Low</td>
        <td>Low</td>
        <td>High — many facets plus the cut transaction</td>
      </tr>
      <tr>
        <td>Explorer support</td>
        <td>Good</td>
        <td>Good</td>
        <td>Poor without loupe-aware tooling</td>
      </tr>
      <tr>
        <td>Storage discipline required</td>
        <td>Moderate (append-only)</td>
        <td>Moderate (append-only)</td>
        <td>High (append-only + cross-facet isolation)</td>
      </tr>
      <tr>
        <td>Audit surface</td>
        <td>One implementation</td>
        <td>One implementation</td>
        <td>Every facet plus their interactions</td>
      </tr>
      <tr>
        <td>Ecosystem familiarity</td>
        <td>Very high</td>
        <td>High</td>
        <td>Low</td>
      </tr>
    </tbody>
  </table>

  <h2>Where diamonds genuinely win</h2>

  <ul>
    <li>
      <strong>You are over 24 KB and cannot reasonably slim down.</strong> This is the strongest and least
      arguable reason. No amount of optimiser tuning fixes a protocol that is fundamentally too large.
    </li>
    <li>
      <strong>Independent release cadences.</strong> A bug fix in one module should not require redeploying
      and re-auditing an unrelated one.
    </li>
    <li>
      <strong>Multiple owners.</strong> Different teams, or different multisigs, can be given authority
      over different selectors.
    </li>
    <li>
      <strong>Smaller upgrade blast radius.</strong> Replacing one selector changes exactly one code path,
      which is far easier to reason about than swapping an entire implementation.
    </li>
  </ul>

  <h2>Where a plain proxy wins</h2>

  <ul>
    <li>
      <strong>You fit in 24 KB.</strong> Most protocols do. Adopting a diamond "just in case" buys complexity
      you are not using.
    </li>
    <li>
      <strong>Your team is small.</strong> The storage discipline diamonds demand scales badly when one
      person is holding the whole layout in their head at 2am.
    </li>
    <li>
      <strong>You want off-the-shelf tooling.</strong> OpenZeppelin's upgrade plugins will refuse an unsafe
      storage change automatically. Equivalent tooling for diamonds is thinner and often bespoke.
    </li>
    <li>
      <strong>Auditor availability and cost.</strong> Far more reviewers are fluent in transparent/UUPS
      proxies, and a diamond audit is simply a bigger job.
    </li>
    <li>
      <strong>Users need to read your contract.</strong> On a plain proxy, a block explorer shows the
      full ABI. On a diamond it shows a fallback and nothing else.
    </li>
  </ul>

  <h2>The honest summary</h2>

  <p>
    Diamonds trade simplicity for modularity. If the 24 KB limit is a real constraint for you, or if
    independent module upgrades are a genuine organisational requirement, that trade is worth making
    and EIP-2535 is a well-designed way to make it. If neither is true, a UUPS proxy will serve you
    better, and choosing one is not a sign of a less sophisticated team.
  </p>

  <p>
    A pragmatic middle path that several protocols use: start with a UUPS proxy, and migrate to a
    diamond only when you actually hit the size wall. The migration is not trivial, but it is far
    cheaper than carrying diamond complexity through the entire life of a project that never needed
    it.
  </p>

  <p>
    If you are reviewing a diamond that someone else deployed — whether to integrate with it or to
    audit it — start with <a href="/learn/inspect-a-diamond-with-louper">inspecting it in Louper</a>
    and then work through the
    <a href="/learn/diamond-security-checklist">security checklist</a>.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
