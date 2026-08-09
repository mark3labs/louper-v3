<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('the-diamond-loupe')!

  const interfaceCode = `interface IDiamondLoupe {
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    /// @notice Gets all facet addresses and their four byte function selectors.
    function facets() external view returns (Facet[] memory facets_);

    /// @notice Gets all the function selectors supported by a specific facet.
    function facetFunctionSelectors(address _facet)
        external view returns (bytes4[] memory facetFunctionSelectors_);

    /// @notice Get all the facet addresses used by a diamond.
    function facetAddresses()
        external view returns (address[] memory facetAddresses_);

    /// @notice Gets the facet that supports the given selector.
    function facetAddress(bytes4 _functionSelector)
        external view returns (address facetAddress_);
}`

  const callCode = `// The single call that powers Louper's facet table
const facets = await publicClient.readContract({
  address: diamondAddress,
  abi: parseAbi([
    'function facets() view returns ((address,bytes4[])[])'
  ]),
  functionName: 'facets',
})

// => [
//      ['0xf7993A...', ['0x1f931c1c']],
//      ['0xF5ba8D...', ['0xcdffacc6', '0x52ef6b2c', ...]],
//      ...
//    ]`
</script>

<Article {article}>
  <p>
    A jeweller's loupe is the small magnifying glass used to examine a gemstone. EIP-2535 borrows
    the name for the four <code>view</code> functions that let anyone examine a diamond's internal structure.
    Without them, a diamond would be opaque: the selector-to-facet mapping lives in storage, so no amount
    of reading the deployed bytecode tells you what the contract can do.
  </p>

  <h2>The interface</h2>

  <p>The standard mandates all four functions. A conforming diamond must implement every one:</p>

  <pre><code>{interfaceCode}</code></pre>

  <h2>What each function is for</h2>

  <h3>facets()</h3>

  <p>
    The workhorse. Returns every facet address paired with all the selectors it owns, in one call.
    This is what Louper calls first, and it is enough to reconstruct the diamond's entire routing
    table:
  </p>

  <pre><code>{callCode}</code></pre>

  <p>
    Because it returns a dynamic array of structs containing dynamic arrays, the response can be
    large. On a diamond with 40+ facets and several hundred selectors the ABI-encoded result runs to
    tens of kilobytes. That is fine for an <code>eth_call</code>, but it is why some public RPC
    endpoints time out on the largest diamonds — Louper uses fallback transports for exactly this
    reason.
  </p>

  <h3>facetAddresses()</h3>

  <p>
    Just the list of facet addresses, with no selectors. Cheap, and useful when you only need to
    know which contracts are involved — for example to check whether every facet is verified on a
    block explorer.
  </p>

  <h3>facetFunctionSelectors(address)</h3>

  <p>
    The selectors owned by one specific facet. Useful for targeted checks: before a
    <code>Replace</code> operation you can confirm exactly which selectors currently point at the old
    facet.
  </p>

  <h3>facetAddress(bytes4)</h3>

  <p>
    Reverse lookup: given a selector, which facet handles it? Returns the zero address if the
    selector is not registered. This is the function to reach for when debugging a
    <code>"Function does not exist"</code> revert — it tells you immediately whether the selector was
    ever registered.
  </p>

  <h2>Reconstructing a usable ABI</h2>

  <p>
    The loupe gives you addresses and selectors, but selectors alone are not enough to actually call
    a function — you need parameter types to encode arguments. Tools bridge the gap in two steps:
  </p>

  <ol>
    <li>Call <code>facets()</code> to get each facet address and its selectors.</li>
    <li>
      Fetch each facet's verified ABI from a block explorer, then keep only the entries whose
      computed selector appears in that facet's list.
    </li>
  </ol>

  <p>
    That filtering step matters. A facet contract often declares more external functions than the
    diamond has registered for it, and including the unregistered ones would produce an ABI that
    reverts at runtime. Concatenating every filtered facet ABI yields the combined diamond ABI —
    which is what Louper's <strong>View Diamond ABI</strong> button gives you.
  </p>

  <p>
    Where a facet is unverified, the fallback is a selector-lookup database, and anything still
    unresolved is shown as <code>unknown_0x...</code>. See
    <a href="/learn/function-selectors-explained">function selectors explained</a> for why the names cannot
    simply be recovered from the chain.
  </p>

  <h2>The loupe and ERC-165</h2>

  <p>
    EIP-2535 also requires <code>supportsInterface</code> from ERC-165, and a compliant diamond
    should report support for the loupe interface ID. In practice this is a weaker signal than it
    looks: plenty of deployed diamonds return <code>false</code> for interfaces they clearly
    implement, because the flag has to be set explicitly during initialisation and is easy to
    forget. Calling
    <code>facets()</code> directly is the more reliable test.
  </p>

  <h2>When the loupe is missing</h2>

  <p>
    Some contracts use a diamond-style fallback but never implement the loupe. They are not EIP-2535
    compliant, and there is no general way to enumerate their facets — you would have to replay
    every historical <code>DiamondCut</code> event to reconstruct the current state. If Louper
    reports that it cannot fetch diamond details, a missing <code>facets()</code> function is the most
    common cause, followed by the address simply not being a diamond at all.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
