<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('upgrading-with-diamondcut')!

  const sigCode = `enum FacetCutAction { Add, Replace, Remove }

struct FacetCut {
    address facetAddress;
    FacetCutAction action;
    bytes4[] functionSelectors;
}

/// @param _diamondCut  Facets and selectors to add, replace or remove
/// @param _init        Address of the contract to delegatecall for setup (or address(0))
/// @param _calldata    Encoded call to execute on _init
function diamondCut(
    FacetCut[] calldata _diamondCut,
    address _init,
    bytes calldata _calldata
) external;

event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);`

  const addCode = `FacetCut[] memory cut = new FacetCut[](1);

bytes4[] memory selectors = new bytes4[](2);
selectors[0] = StakingFacet.stake.selector;
selectors[1] = StakingFacet.unstake.selector;

cut[0] = FacetCut({
    facetAddress: address(new StakingFacet()),
    action: FacetCutAction.Add,
    functionSelectors: selectors
});

IDiamondCut(diamond).diamondCut(cut, address(0), "");`

  const replaceCode = `// Deploy the fixed facet, then repoint ONLY the selectors it changes.
address newFacet = address(new StakingFacetV2());

bytes4[] memory selectors = new bytes4[](1);
selectors[0] = StakingFacet.stake.selector;

cut[0] = FacetCut({
    facetAddress: newFacet,
    action: FacetCutAction.Replace,
    functionSelectors: selectors
});`

  const removeCode = `// Remove REQUIRES facetAddress == address(0)
cut[0] = FacetCut({
    facetAddress: address(0),
    action: FacetCutAction.Remove,
    functionSelectors: selectors
});`

  const initCode = `contract InitV2 {
    function init() external {
        AppStorage storage s = LibAppStorage.diamondStorage();
        s.rate = 500;                  // seed the new field
        s.version = 2;
    }
}

IDiamondCut(diamond).diamondCut(
    cut,
    address(new InitV2()),
    abi.encodeWithSignature("init()")
);`
</script>

<Article {article}>
  <p>
    <code>diamondCut</code> is the only way a diamond's structure changes. It adds, replaces and removes
    selector-to-facet mappings, optionally running a migration in the same atomic transaction. Understanding
    its rules is the difference between a routine upgrade and a permanently broken protocol.
  </p>

  <h2>The signature</h2>

  <pre><code>{sigCode}</code></pre>

  <p>
    The whole array is applied in one transaction. If any single operation reverts, the entire
    upgrade reverts — there is no partially-applied state. The <code>DiamondCut</code> event is mandatory,
    and it is what lets indexers reconstruct a diamond's full history.
  </p>

  <h2>Add</h2>

  <p>Registers selectors the diamond does not currently have:</p>

  <pre><code>{addCode}</code></pre>

  <p>Add reverts if:</p>
  <ul>
    <li>Any selector is already registered to any facet.</li>
    <li>
      <code>facetAddress</code> has no code. Deploying and cutting in the same transaction is fine, but
      passing an EOA or an undeployed address is not.
    </li>
    <li>The selector array is empty.</li>
  </ul>

  <h2>Replace</h2>

  <p>Points existing selectors at a different facet. This is the normal path for a bug fix:</p>

  <pre><code>{replaceCode}</code></pre>

  <p>
    Replace reverts if a selector is not currently registered, or if it already points at the facet
    you are naming. Note that replacing is per-selector, not per-facet: if the old facet owned ten
    selectors and you replace three, the other seven still route to the old contract. That split is
    legal and sometimes intentional, but it is rarely what people mean to do — always list every
    selector the new facet should own.
  </p>

  <h2>Remove</h2>

  <p>
    Deletes selectors entirely. Afterwards, calling them reverts in the fallback. The facet address
    <strong>must</strong> be the zero address:
  </p>

  <pre><code>{removeCode}</code></pre>

  <p>
    Removing is how you retire functionality, and it is also the escape hatch if a facet turns out
    to be malicious — provided you still control <code>diamondCut</code>.
  </p>

  <h2>Initialisation</h2>

  <p>
    The <code>_init</code> and <code>_calldata</code> parameters let you run setup logic
    <em>atomically</em> with the structural change. The diamond <code>delegatecall</code>s
    <code>_init</code>, so the code runs against the diamond's own storage:
  </p>

  <pre><code>{initCode}</code></pre>

  <p>
    Atomicity is the point. If you added a facet that reads <code>s.rate</code> and seeded that field
    in a separate follow-up transaction, there would be a window — however brief — where the new function
    is live and reading zero. On a public chain, someone will find that window.
  </p>

  <p>
    Pass <code>address(0)</code> and empty calldata when no migration is needed. The reference
    implementation requires that if <code>_init</code> is non-zero it must contain code, and it bubbles
    up any revert from the init call.
  </p>

  <h2>Failure modes worth rehearsing</h2>

  <h3>Removing diamondCut itself</h3>
  <p>
    <code>diamondCut</code> is a selector like any other, usually owned by
    <code>DiamondCutFacet</code>. Remove it and the diamond becomes permanently immutable. That is
    occasionally a deliberate goal, but doing it by accident — for example by removing every
    selector belonging to a facet without checking what is in it — is unrecoverable.
  </p>

  <h3>Removing the loupe</h3>
  <p>
    Less catastrophic but still bad: without <code>facets()</code>, external tooling can no longer
    enumerate the diamond, and the contract stops being EIP-2535 compliant.
  </p>

  <h3>Init functions that can be re-run</h3>
  <p>
    An <code>init</code> that resets ownership or re-seeds balances, and is left registered and unguarded,
    is a live takeover vector. Init contracts should be single-purpose, unregistered as diamond selectors,
    and guarded if there is any chance of a second call.
  </p>

  <h3>Storage layout drift</h3>
  <p>
    <code>diamondCut</code> validates selectors. It knows nothing about storage. If your new facet
    was compiled against a struct whose layout differs from the deployed one, the cut succeeds and
    the data silently corrupts. See
    <a href="/learn/diamond-storage-patterns">diamond storage patterns</a>.
  </p>

  <h2>A pre-flight checklist</h2>

  <ol>
    <li>
      Read the current selector table from chain — do not trust local deployment artifacts. Louper's
      facet view or its JSON export both work.
    </li>
    <li>
      Diff current selectors against the ones your new facets export, and classify each difference
      as Add, Replace or Remove explicitly.
    </li>
    <li>
      Confirm <code>diamondCut</code> and all four loupe selectors survive the operation.
    </li>
    <li>Diff the storage layout of every changed facet against the deployed version.</li>
    <li>
      Simulate the exact calldata against a mainnet fork, then read back known state values
      afterwards.
    </li>
    <li>Verify every new facet's source before the cut, so reviewers can see what was added.</li>
  </ol>

  <p>
    After the upgrade, load the diamond in Louper and confirm the facet table matches what you
    intended. It reads live chain state, so it reflects what actually happened rather than what your
    script believed would happen.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
