<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('inspect-a-diamond-with-louper')!

  const urlCode = `https://louper.dev/diamond/<address>?network=<network>

# Examples
https://louper.dev/diamond/0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE?network=mainnet
https://louper.dev/diamond/0x86935f11c86623dec8a25696e1c19a8659cbf95d?network=polygon`

  const jsonCode = `# Machine-readable output for any diamond
curl "https://louper.dev/diamond/0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE/json?network=mainnet"

# Shape of the response:
# {
#   "chain": "mainnet",
#   "diamond": {
#     "name": "LiFiDiamond",
#     "address": "0x1231...",
#     "facets": [ { "name": "...", "address": "0x...", "abi": [ ... ] } ]
#   },
#   "diamondAbi": [ ... ]   // every facet ABI, combined
# }`

  const diffCode = `# Snapshot the selector set today...
curl -s "https://louper.dev/diamond/$D/json?network=mainnet" \\
  | jq -r '.diamond.facets[] | .address as $a | .abi[] | select(.type=="function") | "\\($a) \\(.name)"' \\
  | sort > before.txt

# ...and after an upgrade, then diff.
diff before.txt after.txt`

  const cliCode = `npm install -g @mark3labs/louper-cli@latest
louper -a 0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE -n mainnet`
</script>

<Article {article}>
  <p>
    Louper reads a diamond's structure directly from chain state using the
    <a href="/learn/the-diamond-loupe">loupe functions</a>, then enriches it with verified source
    from block explorers. This guide walks through the whole workflow, from looking up a contract to
    exporting an ABI you can script against.
  </p>

  <h2>1. Open a diamond</h2>

  <p>
    Use the search bar at the top of any page: paste the diamond's address, pick the network, and
    submit. You can also link directly, which is handy for documentation and bug reports:
  </p>

  <pre><code>{urlCode}</code></pre>

  <p>
    Every supported network has its own key. If you land on an error page, the two usual causes are
    a wrong network selection and an address that is not actually a diamond — Louper needs a working
    <code>facets()</code> function to enumerate anything.
  </p>

  <h2>2. Read the Facets tab</h2>

  <p>The default view lists every facet the diamond currently routes to. For each one you get:</p>

  <ul>
    <li>
      <strong>The facet name</strong>, taken from verified source. An address shown without a
      meaningful name means the contract is unverified.
    </li>
    <li><strong>The facet address</strong>, with copy and block-explorer buttons.</li>
    <li>
      <strong>A method count</strong>, expandable into the full list of function names and their
      4-byte selectors.
    </li>
    <li><strong>An ABI viewer</strong> for that individual facet.</li>
  </ul>

  <p>
    Functions displayed as <code>unknown_0x12345678</code> are selectors that Louper could not resolve
    to a name — the facet is unverified and the selector is not in any public database. Treat these as
    unknown code, especially on facets that hold privileges.
  </p>

  <h2>3. Call view functions in the Read tab</h2>

  <p>
    The <strong>Read</strong> tab exposes every <code>view</code> and <code>pure</code> function across
    all facets, grouped by facet. Calls are free and require no wallet. This is the fastest way to answer
    ownership questions during a review:
  </p>

  <ul>
    <li><code>owner()</code> — who can upgrade the diamond</li>
    <li><code>paused()</code> — whether an emergency stop is active</li>
    <li><code>facetAddress(bytes4)</code> — which facet handles a given selector</li>
  </ul>

  <h2>4. Simulate state changes in the Write tab</h2>

  <p>
    The <strong>Write</strong> tab lists state-changing functions and requires a connected wallet. Louper
    will prompt you to switch to the diamond's network, since sending a transaction on the wrong chain
    is a common and expensive mistake.
  </p>

  <blockquote>
    Write calls send real transactions and spend real funds. Confirm the network, the diamond
    address, and the exact arguments before signing anything.
  </blockquote>

  <h2>5. Export the combined ABI</h2>

  <p>
    The <strong>View Diamond ABI</strong> button assembles every facet's filtered ABI into a single JSON
    array. This is the artifact you want for integration work: point ethers, viem or web3.py at the diamond
    address with this ABI and every function routes correctly, because from a caller's perspective a diamond
    is one contract.
  </p>

  <p>
    Note that it is <em>filtered</em> — only functions actually registered on the diamond are
    included, so it will not contain entries that would revert. See
    <a href="/learn/the-diamond-loupe">the loupe guide</a> for why that filtering step is necessary.
  </p>

  <h2>6. Automate with the JSON endpoint</h2>

  <p>Every diamond page has a JSON equivalent at the same path with <code>/json</code> appended:</p>

  <pre><code>{jsonCode}</code></pre>

  <p>
    This is the building block for monitoring. Snapshot a diamond's selector table, then diff it
    after an upgrade to see exactly what changed on chain rather than what a deploy script claimed:
  </p>

  <pre><code>{diffCode}</code></pre>

  <p>
    Wire that into CI or a scheduled job and you have upgrade detection for any diamond you depend
    on, which is item 10 on the <a href="/learn/diamond-security-checklist">security checklist</a>.
  </p>

  <h2>7. Use the CLI for local work</h2>

  <p>The same inspection is available in a terminal:</p>

  <pre><code>{cliCode}</code></pre>

  <h2>Troubleshooting</h2>

  <h3>"Unable to fetch diamond details"</h3>
  <p>
    Either the address is not a diamond, the network is wrong, or the contract does not implement
    <code>facets()</code>. Verify with a direct call before assuming Louper is at fault.
  </p>

  <h3>Facet names are missing</h3>
  <p>
    The facet source is not verified on that network's explorer. Louper falls back to selector
    lookups, but names cannot be recovered from bytecode alone.
  </p>

  <h3>The page is slow on very large diamonds</h3>
  <p>
    A diamond with dozens of facets requires a verified-source lookup per facet on a cache miss.
    Results are cached, so a second load is substantially faster.
  </p>

  <h3>The data looks stale after an upgrade</h3>
  <p>
    Contract metadata is cached. The facet list itself is read live from chain, so a reload will
    show structural changes; names for a brand-new facet may lag until its source is verified and
    picked up.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
