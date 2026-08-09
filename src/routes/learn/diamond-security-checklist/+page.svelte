<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('diamond-security-checklist')!

  const ownerCode = `// Who can call diamondCut? Read it directly:
cast call $DIAMOND "owner()(address)" --rpc-url $RPC

// Then check whether that address is an EOA or a multisig:
cast code $OWNER --rpc-url $RPC   // "0x" means EOA`

  const initGuardCode = `// UNSAFE: can be called again by anyone if left registered
contract Init {
    function init() external {
        LibDiamond.setContractOwner(msg.sender);  // takeover vector
    }
}

// SAFER: single purpose, no privilege changes, guarded
contract InitV2 {
    function init() external {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(s.version == 1, "already migrated");
        s.rate = 500;
        s.version = 2;
    }
}`

  const loupeCheckCode = `# Does every facet still resolve? Any zero address is a dead selector.
cast call $DIAMOND "facetAddress(bytes4)(address)" 0x1f931c1c --rpc-url $RPC

# Is the cut function still present? (0x1f931c1c = diamondCut)
# A zero result means the diamond is now immutable.`
</script>

<Article {article}>
  <p>
    This is a practical review checklist for EIP-2535 contracts, whether you are auditing your own
    diamond before an upgrade or assessing someone else's before integrating. It assumes familiarity
    with <a href="/learn/what-is-a-diamond">how diamonds work</a>; each item explains what to check
    and why it matters.
  </p>

  <blockquote>
    This checklist is a starting point for review, not a substitute for a professional audit. It
    cannot tell you whether a specific contract is safe.
  </blockquote>

  <h2>1. Who controls diamondCut?</h2>

  <p>
    This is the first and most important question about any diamond. Whoever can call
    <code>diamondCut</code> can replace any function with arbitrary code, and therefore can drain anything
    the contract holds.
  </p>

  <pre><code>{ownerCode}</code></pre>

  <ul>
    <li>
      <strong>A single EOA</strong> means one private key can rewrite the protocol. For a contract holding
      user funds this is a critical finding, not a nitpick.
    </li>
    <li>
      <strong>A multisig</strong> is better. Check the threshold and the signer count — a 1-of-3 is an
      EOA wearing a hat.
    </li>
    <li>
      <strong>A timelock</strong> is better still, because users get warning and an exit window. Check
      the delay is long enough to actually act on.
    </li>
    <li>
      <strong>Zero address / no cut facet</strong> means the diamond is immutable. Safe from upgrades,
      but also unfixable.
    </li>
  </ul>

  <h2>2. Is every facet verified?</h2>

  <p>
    List the facets in Louper and check each one on a block explorer. An unverified facet is code
    you cannot read that can move the protocol's money. Note that verification of the
    <em>diamond</em> tells you nothing about the facets — they are separate contracts.
  </p>

  <p>
    Louper marks functions it cannot resolve as <code>unknown_0x...</code>. A handful of those on a
    peripheral facet may be benign; a core facet full of them warrants stopping.
  </p>

  <h2>3. Are the loupe functions intact?</h2>

  <pre><code>{loupeCheckCode}</code></pre>

  <p>
    A diamond that has lost <code>facets()</code> cannot be enumerated by tooling, which makes ongoing
    monitoring effectively impossible. It also usually indicates a botched upgrade.
  </p>

  <h2>4. Storage layout discipline</h2>

  <p>
    Storage collisions are the highest-severity bug class unique to diamonds, and they fail
    silently. See <a href="/learn/diamond-storage-patterns">diamond storage patterns</a> for the mechanics.
    During review, confirm:
  </p>

  <ul>
    <li>
      No facet declares ordinary state variables outside the agreed pattern. With AppStorage, the
      shared struct must be the first and only state variable in every facet.
    </li>
    <li>
      Diamond Storage slots are derived from distinct, namespaced strings — not from short or
      guessable constants, and never reused across modules.
    </li>
    <li>
      Struct changes across versions are strictly append-only. No insertions, no reordering, no type
      changes, no repacking.
    </li>
    <li>Nested structs that may grow have reserved gaps.</li>
    <li>
      Storage layouts were diffed mechanically (e.g. <code>forge inspect storage-layout</code>), not
      eyeballed.
    </li>
  </ul>

  <h2>5. Initialisation safety</h2>

  <p>
    Init contracts run via <code>delegatecall</code> with full access to diamond storage. They are the
    most privileged code in the system and the most frequently overlooked.
  </p>

  <pre><code>{initGuardCode}</code></pre>

  <ul>
    <li>Init functions must not be registered as diamond selectors.</li>
    <li>They should be idempotency-guarded, or provably callable only once.</li>
    <li>They should never set or reset ownership outside the very first deployment.</li>
    <li>Constructor logic in a facet is dead code — it never runs under delegatecall.</li>
  </ul>

  <h2>6. Selector hygiene</h2>

  <ul>
    <li>
      No unexpected selectors. Diff the live selector set against what the source is supposed to
      export; anything extra deserves an explanation.
    </li>
    <li>
      No leftover selectors from removed facets still pointing at old addresses — a partial
      <code>Replace</code> is easy to do by accident.
    </li>
    <li>
      Watch for functions that look administrative but are not access-controlled. In a diamond these
      are easy to miss because they are spread across many files.
    </li>
  </ul>

  <h2>7. Access control consistency</h2>

  <p>
    Each facet enforces its own permissions. There is no central place where the compiler checks
    that every sensitive function is guarded, so gaps are easy to introduce — particularly when a
    new facet is written by someone who did not write the original ones.
  </p>

  <ul>
    <li>Enumerate every state-changing function and record which modifier guards it.</li>
    <li>
      Confirm all facets read roles from the same storage location. Two facets using different
      ownership libraries is a real and recurring bug.
    </li>
    <li>Check that pause or emergency-stop logic actually covers the functions that matter.</li>
  </ul>

  <h2>8. Upgrade history</h2>

  <p>
    Every structural change emits a <code>DiamondCut</code> event. The log is a public audit trail:
  </p>

  <ul>
    <li>How often has this diamond been cut, and by whom?</li>
    <li>Were any cuts made from an EOA rather than the expected governance address?</li>
    <li>Do any cuts remove loupe or ownership selectors?</li>
    <li>Were facets verified before or only after being cut in?</li>
  </ul>

  <h2>9. External call surface</h2>

  <p>
    Because facets share the diamond's storage and identity, a reentrancy guard in one facet does
    not protect another unless they share guard state. Confirm that reentrancy protection is stored
    in shared storage rather than per-facet, and that <code>msg.sender</code> and
    <code>msg.value</code> are handled consistently across facets — under
    <code>delegatecall</code> they refer to the original caller and value, which surprises people who
    expect proxy-like isolation.
  </p>

  <h2>10. Monitoring after deployment</h2>

  <ul>
    <li>Alert on every <code>DiamondCut</code> event for diamonds you depend on.</li>
    <li>Alert on ownership transfers of the cut facet.</li>
    <li>
      Periodically re-run the loupe and diff the selector table against a known-good snapshot.
      Louper's
      <a href="/learn/inspect-a-diamond-with-louper">JSON export</a> makes this scriptable.
    </li>
  </ul>

  <h2>Quick triage</h2>

  <p>If you have five minutes and need a rough read on an unfamiliar diamond:</p>

  <ol>
    <li>Open it in Louper and check how many facets are unverified.</li>
    <li>Read <code>owner()</code> and check whether it is an EOA.</li>
    <li>Confirm <code>diamondCut</code> is still registered and note who can call it.</li>
    <li>Skim the facet names for anything that sounds like an escape hatch.</li>
  </ol>

  <p>
    That will not find subtle bugs, but it reliably surfaces the two failure modes that account for
    most real-world losses: an unverified facet, and a single key controlling upgrades.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
