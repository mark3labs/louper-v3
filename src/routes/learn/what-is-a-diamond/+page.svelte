<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('what-is-a-diamond')!

  const fallbackCode = `// Simplified fallback found in every EIP-2535 diamond
fallback() external payable {
    // 1. Look up which facet implements msg.sig
    address facet = selectorToFacet[msg.sig];
    require(facet != address(0), "Function does not exist");

    // 2. delegatecall into that facet, keeping the diamond's storage
    assembly {
        calldatacopy(0, 0, calldatasize())
        let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
        returndatacopy(0, 0, returndatasize())
        switch result
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
}`

  const cutCode = `struct FacetCut {
    address facetAddress;
    FacetCutAction action; // Add, Replace or Remove
    bytes4[] functionSelectors;
}

function diamondCut(
    FacetCut[] calldata _diamondCut,
    address _init,
    bytes calldata _calldata
) external;`
</script>

<Article {article}>
  <p>
    A <strong>diamond</strong> is a smart contract that gets its functionality from other contracts
    called <strong>facets</strong>. It is defined by
    <a href="https://eips.ethereum.org/EIPS/eip-2535" target="_blank" rel="noopener">EIP-2535</a>, a
    standard for building modular, upgradeable contracts that are not limited by the size cap that
    applies to a single deployed contract.
  </p>

  <p>
    If you have used a proxy contract before, a diamond will feel familiar: calls arrive at one
    address, and that address forwards them somewhere else using <code>delegatecall</code>. The
    difference is that a normal proxy forwards <em>every</em> call to
    <em>one</em>
    implementation, while a diamond forwards each function to a different implementation depending on
    which function was called.
  </p>

  <h2>The problem diamonds solve</h2>

  <p>
    Ethereum enforces a hard limit on deployed bytecode size. <a
      href="https://eips.ethereum.org/EIPS/eip-170"
      target="_blank"
      rel="noopener">EIP-170</a
    > caps a contract at 24,576 bytes. That sounds like a lot until you build a protocol with lending,
    staking, governance, and a token all in one system. Teams routinely hit the ceiling and are forced
    into awkward choices:
  </p>

  <ul>
    <li>Split the protocol across several addresses that must then coordinate with each other.</li>
    <li>Strip out input validation and error strings to claw back a few hundred bytes.</li>
    <li>Deploy a monolithic proxy and redeploy the entire implementation for a one-line fix.</li>
  </ul>

  <p>
    Diamonds address all three. Because logic lives in separate facet contracts, the 24 KB limit
    applies to each facet individually rather than to the protocol as a whole. And because facets
    are registered per-function, you can replace a single function without touching anything else.
  </p>

  <h2>How a diamond actually works</h2>

  <p>
    Every diamond stores a mapping from a <strong>4-byte function selector</strong> to the address
    of the facet that implements it. When a call comes in, the diamond's <code>fallback</code>
    function looks up <code>msg.sig</code> in that mapping and delegatecalls the matching facet:
  </p>

  <pre><code>{fallbackCode}</code></pre>

  <p>
    The critical detail is <code>delegatecall</code>. It runs the facet's code in the
    <em>diamond's</em>
    storage context. The facet supplies the logic; the diamond owns all the data. This is why facets are
    usually described as stateless — they never hold the protocol's state themselves, they only operate
    on the diamond's storage. Getting this wrong is the single most common source of diamond bugs, which
    is why storage layout gets
    <a href="/learn/diamond-storage-patterns">its own guide</a>.
  </p>

  <h2>Facets, selectors and the loupe</h2>

  <p>
    A facet is just a normal Solidity contract. There is nothing special about its code — what makes
    it a facet is that a diamond has registered some of its function selectors. The same facet can
    be shared by many diamonds, which is common for utility facets like ownership.
  </p>

  <p>
    Because the mapping of selectors to facets lives in storage rather than in the bytecode, you
    cannot learn a diamond's full interface just by looking at its verified source. EIP-2535 solves
    this by requiring four introspection functions, collectively called the
    <strong>diamond loupe</strong>:
  </p>

  <ul>
    <li><code>facets()</code> — every facet address with all of its selectors</li>
    <li><code>facetAddresses()</code> — just the facet addresses</li>
    <li><code>facetFunctionSelectors(address)</code> — the selectors for one facet</li>
    <li><code>facetAddress(bytes4)</code> — which facet handles a given selector</li>
  </ul>

  <p>
    These are what Louper calls when you inspect a contract. <a href="/learn/the-diamond-loupe"
      >The loupe guide</a
    > covers each function in detail.
  </p>

  <h2>Upgrading: the diamondCut function</h2>

  <p>
    Changes are made through <code>diamondCut</code>, which takes a list of operations and applies
    them atomically:
  </p>

  <pre><code>{cutCode}</code></pre>

  <p>Each entry uses one of three actions:</p>

  <ul>
    <li><strong>Add</strong> — register selectors that the diamond does not have yet</li>
    <li><strong>Replace</strong> — point existing selectors at a different facet</li>
    <li><strong>Remove</strong> — delete selectors entirely (the facet address must be zero)</li>
  </ul>

  <p>
    The optional <code>_init</code> and <code>_calldata</code> arguments let you run a one-time
    migration in the same transaction, which matters when an upgrade changes the shape of stored
    data. See <a href="/learn/upgrading-with-diamondcut">upgrading with diamondCut</a>.
  </p>

  <h2>When a diamond is the right choice</h2>

  <p>Diamonds are a good fit when at least one of these is true:</p>

  <ul>
    <li>Your protocol genuinely does not fit inside 24 KB.</li>
    <li>
      Different parts of the system change at different rates and you want to upgrade them
      independently.
    </li>
    <li>Multiple teams own different modules and need to ship without coordinating deployments.</li>
    <li>You want fine-grained upgrade permissions, facet by facet.</li>
  </ul>

  <h2>When it is not</h2>

  <p>
    It would be dishonest to present diamonds as a free win. They carry real costs, and for many
    projects a simpler pattern is the better engineering decision:
  </p>

  <ul>
    <li>
      <strong>Every call costs more.</strong> The selector lookup and delegatecall add overhead to each
      transaction compared to a direct call.
    </li>
    <li>
      <strong>Tooling support is thinner.</strong> Block explorers cannot show the full interface without
      loupe-aware tooling, which is precisely the gap Louper fills.
    </li>
    <li>
      <strong>The attack surface is larger.</strong> Shared storage across many facets creates collision
      risks that a single-implementation proxy simply does not have.
    </li>
    <li>
      <strong>Audits cost more.</strong> Reviewers must reason about every combination of facets, not
      one contract.
    </li>
  </ul>

  <p>
    If your contract fits comfortably in 24 KB and you upgrade it rarely, a transparent or UUPS
    proxy is usually the more sensible choice. We compare them directly in
    <a href="/learn/diamonds-vs-proxies">diamonds vs proxies</a>.
  </p>

  <h2>Seeing it in practice</h2>

  <p>
    Reading about facets only takes you so far. Open a production diamond such as the <a
      href="/diamond/0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE?network=mainnet">LI.FI Diamond</a
    >
    in Louper and you will see dozens of facets, each with its own selectors, all served from a single
    address. Then try
    <a href="/learn/inspect-a-diamond-with-louper">inspecting a diamond yourself</a>.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
