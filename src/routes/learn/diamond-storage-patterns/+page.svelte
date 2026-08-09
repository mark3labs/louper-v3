<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('diamond-storage-patterns')!

  const brokenCode = `// BROKEN — do not do this in a facet
contract StakingFacet {
    uint256 public totalStaked;              // slot 0
    mapping(address => uint256) public stakes; // slot 1
}

contract RewardsFacet {
    address public rewardToken;              // slot 0  <-- same slot!
    uint256 public rate;                     // slot 1  <-- same slot!
}`

  const diamondStorageCode = `library LibStaking {
    // A namespaced, effectively-random slot. Nothing else lands here.
    bytes32 constant STORAGE_POSITION = keccak256("com.myprotocol.staking.storage");

    struct StakingStorage {
        uint256 totalStaked;
        mapping(address => uint256) stakes;
    }

    function s() internal pure returns (StakingStorage storage ss) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ss.slot := position
        }
    }
}

contract StakingFacet {
    function stake(uint256 amount) external {
        LibStaking.s().stakes[msg.sender] += amount;
        LibStaking.s().totalStaked += amount;
    }
}`

  const appStorageCode = `// AppStorage.sol — one shared struct for the whole protocol
struct AppStorage {
    uint256 totalStaked;
    mapping(address => uint256) stakes;
    address rewardToken;
    uint256 rate;
}

// Every facet declares it FIRST and declares nothing else.
contract StakingFacet {
    AppStorage internal s;   // occupies slot 0 onwards

    function stake(uint256 amount) external {
        s.stakes[msg.sender] += amount;
        s.totalStaked += amount;
    }
}

contract RewardsFacet {
    AppStorage internal s;   // same layout, same slots — intentionally

    function setRate(uint256 r) external {
        s.rate = r;
    }
}`

  const appendCode = `// Version 1
struct AppStorage {
    uint256 totalStaked;
    mapping(address => uint256) stakes;
}

// Version 2 — SAFE: new field appended at the end
struct AppStorage {
    uint256 totalStaked;
    mapping(address => uint256) stakes;
    uint256 lastUpdated;   // new slot, previously unused
}

// Version 2 — UNSAFE: field inserted in the middle
struct AppStorage {
    uint256 totalStaked;
    uint256 lastUpdated;   // shifts every later field by one slot
    mapping(address => uint256) stakes;
}`

  const structGapCode = `struct StakingStorage {
    uint256 totalStaked;
    mapping(address => uint256) stakes;
    // Nested structs cannot be safely extended later unless
    // you leave room, so reserve slots up front:
    uint256[45] __gap;
}`
</script>

<Article {article}>
  <p>
    Storage is where diamonds get genuinely subtle. If you take one thing from this guide, make it
    this: <strong
      >a facet's state variables do not belong to the facet — they belong to the diamond</strong
    >, and every facet shares the same storage space.
  </p>

  <h2>Why ordinary state variables break</h2>

  <p>
    Solidity assigns storage slots by declaration order: the first variable goes in slot 0, the next
    in slot 1, and so on. Each contract is compiled independently, with no knowledge of the others.
    Now consider two facets on the same diamond:
  </p>

  <pre><code>{brokenCode}</code></pre>

  <p>
    Because both facets execute via <code>delegatecall</code> against the diamond's storage,
    <code>totalStaked</code>
    and <code>rewardToken</code> are the same 32 bytes. Staking would overwrite the reward token address
    with a number; setting the reward token would corrupt the staked total. The compiler cannot warn you,
    because from its point of view these are two unrelated contracts.
  </p>

  <p>
    The fix is to stop letting the compiler choose slots and instead place state at addresses you
    control. There are two established ways to do that.
  </p>

  <h2>Pattern 1: Diamond Storage</h2>

  <p>
    Each module picks a unique, human-readable namespace, hashes it to get a storage slot far away
    from slot 0, and anchors a struct there using inline assembly:
  </p>

  <pre><code>{diamondStorageCode}</code></pre>

  <p>
    Because the slot is a keccak-256 hash, the chance of two namespaces colliding is negligible, and
    the chance of colliding with the compiler's sequentially-allocated slots is effectively zero.
  </p>

  <p><strong>Strengths</strong></p>
  <ul>
    <li>Modules are fully independent — a facet only touches storage it explicitly opts into.</li>
    <li>You can add a new module later without thinking about existing layout at all.</li>
    <li>Facets are genuinely reusable across different diamonds.</li>
  </ul>

  <p><strong>Costs</strong></p>
  <ul>
    <li>More boilerplate: every module needs a library and an accessor.</li>
    <li>
      Sharing data between modules means importing several libraries, which gets verbose quickly.
    </li>
  </ul>

  <h2>Pattern 2: AppStorage</h2>

  <p>
    AppStorage takes the opposite approach: one struct for the entire protocol, declared as the
    first and only state variable in every facet.
  </p>

  <pre><code>{appStorageCode}</code></pre>

  <p>
    Every facet now agrees on the layout because they all include the same struct definition. The
    variable name <code>s</code> is a convention that makes it obvious at a glance that you are touching
    shared state.
  </p>

  <p><strong>Strengths</strong></p>
  <ul>
    <li>Much less boilerplate; reads like ordinary Solidity.</li>
    <li>Any facet can reach any field without importing a library per module.</li>
  </ul>

  <p><strong>Costs</strong></p>
  <ul>
    <li>
      Every facet must declare <code>AppStorage</code> first and declare no other state variables. One
      slip corrupts everything.
    </li>
    <li>The struct becomes a large shared surface with no module boundaries.</li>
    <li>All facets must be recompiled against the same struct version.</li>
  </ul>

  <h2>The upgrade rule that actually bites</h2>

  <p>
    Whichever pattern you choose, the rule for changing a storage struct is the same: <strong
      >you may append, but you may never insert, reorder, or remove</strong
    >.
  </p>

  <pre><code>{appendCode}</code></pre>

  <p>
    The unsafe version does not fail loudly. It silently reinterprets whatever was in the old slot
    as the new field, so every existing user's stake becomes garbage. There is no automatic
    migration and no way to detect it after the fact except by noticing that the numbers are wrong.
  </p>

  <p>
    Changing a field's <em>type</em> is equally dangerous even when the slot count stays the same,
    and so is anything that alters struct packing — narrowing a <code>uint256</code> to
    <code>uint128</code> lets the next field share the slot and shifts everything after it.
  </p>

  <h2>Nested structs and storage gaps</h2>

  <p>
    A struct nested inside another struct cannot be extended, because its fields are laid out inline
    and growing it would shift everything after it. If you expect a nested struct to grow, reserve
    space up front:
  </p>

  <pre><code>{structGapCode}</code></pre>

  <p>
    A gap costs nothing until used — unwritten slots consume no gas and no storage — so it is cheap
    insurance.
  </p>

  <h2>Which pattern should you use?</h2>

  <p>
    For a protocol built and upgraded by one team, AppStorage is usually the pragmatic choice: less
    ceremony, faster to write, easier to read in review. For facets shared across diamonds, for
    modules owned by separate teams, or for anything where a third party might add a facet later,
    Diamond Storage's isolation is worth the boilerplate.
  </p>

  <p>
    Mixing them is common and perfectly legitimate: AppStorage for core protocol state, Diamond
    Storage for self-contained utilities like ownership, pausing or access control. That is exactly
    how the reference implementations structure things.
  </p>

  <h2>Verifying storage safety before you ship</h2>

  <ul>
    <li>
      Run <code>forge inspect &lt;Facet&gt; storage-layout</code> (or the solc
      <code>--storage-layout</code> output) for every facet and diff it against the previous release.
    </li>
    <li>
      Assert in review that no facet declares a state variable other than the shared struct, if you
      use AppStorage.
    </li>
    <li>
      Fork-test the upgrade against real mainnet state and read back known values afterwards. This
      catches layout mistakes that unit tests on a fresh deployment never will.
    </li>
  </ul>

  <p>
    Storage bugs are the most expensive class of diamond bug because they are silent and often
    irreversible. The <a href="/learn/diamond-security-checklist">security checklist</a> covers the
    review steps in more depth, and
    <a href="/learn/upgrading-with-diamondcut">upgrading with diamondCut</a> explains how to run migrations
    atomically with the upgrade itself.
  </p>

  <RelatedGuides slug={article.slug} />
</Article>
