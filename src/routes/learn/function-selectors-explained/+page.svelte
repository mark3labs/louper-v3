<script lang="ts">
  import Article from '$lib/components/Article.svelte'
  import RelatedGuides from '$lib/components/RelatedGuides.svelte'
  import { getArticle } from '$lib/content/learn'

  const article = getArticle('function-selectors-explained')!

  const sigCode = `// The canonical signature is the name plus parameter types.
// No spaces, no parameter names, no return types.
transfer(address,uint256)

// keccak256("transfer(address,uint256)")
// = 0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b
//    ^^^^^^^^
// The selector is the first 4 bytes: 0xa9059cbb`

  const canonicalCode = `// These all produce the SAME selector, because only types matter:
function transfer(address to, uint256 amount) external;
function transfer(address recipient, uint256 value) external;
function transfer(address, uint256) external returns (bool);

// These produce DIFFERENT selectors:
function transfer(address,uint256)   // 0xa9059cbb
function transfer(address,uint128)   // different type
function transfer(address[],uint256) // different type`

  const aliasCode = `// Aliases that must be expanded before hashing:
uint    -> uint256
int     -> int256
ufixed  -> ufixed128x18
byte    -> bytes1

// Structs become tuples:
struct Order { address maker; uint256 amount; }
function fill(Order calldata o) external;
// hashes as: fill((address,uint256))

// Enums become their underlying uint8:
function setAction(FacetCutAction a) external;
// hashes as: setAction(uint8)`

  const clashCode = `// Real, famous example — both hash to 0x42966c68:
function burn(uint256) external;

// And this contrived-but-valid signature:
function collate_propagate_storage(bytes16) external;
// also 0x42966c68`
</script>

<Article {article}>
  <p>
    Every external call to an Ethereum contract begins with four bytes that say which function you
    want. Those four bytes are the <strong>function selector</strong>. For most contracts this is an
    implementation detail you never think about. For diamonds it is the central organising concept —
    a diamond is essentially a routing table keyed by selector.
  </p>

  <h2>How a selector is computed</h2>

  <p>
    Take the function's <strong>canonical signature</strong>, hash it with keccak-256, and keep the
    first four bytes:
  </p>

  <pre><code>{sigCode}</code></pre>

  <p>
    When you call a contract, the EVM does not receive a function name. It receives calldata whose
    first four bytes are this selector, followed by ABI-encoded arguments. Solidity's dispatcher
    compares those bytes against the selectors it knows and jumps to the matching code. A diamond
    does the same thing, except the lookup table lives in storage and can be modified after
    deployment.
  </p>

  <h2>What "canonical" means</h2>

  <p>
    The canonical signature includes the function name and the parameter types only. Parameter
    names, the <code>calldata</code>/<code>memory</code> location, visibility, mutability and return types
    are all excluded:
  </p>

  <pre><code>{canonicalCode}</code></pre>

  <p>
    There are a few normalisation rules that trip people up when computing selectors by hand, mostly
    around type aliases and composite types:
  </p>

  <pre><code>{aliasCode}</code></pre>

  <p>
    This is why a hand-written selector list is a bad idea. Let the compiler tell you: in Solidity,
    <code>this.myFunction.selector</code> or <code>type(IFoo).interfaceId</code> produce the right
    values, and <code>forge inspect &lt;Contract&gt; methods</code> prints the whole table.
  </p>

  <h2>Why selectors matter so much in a diamond</h2>

  <p>
    In a conventional contract, the compiler guarantees you cannot register the same selector twice
    — it simply will not compile. A diamond has no such guarantee, because facets are combined at
    runtime by <code>diamondCut</code>. The standard therefore requires the diamond to enforce these
    rules itself:
  </p>

  <ul>
    <li>
      <strong>Add</strong> must revert if the selector is already registered to some facet. Two facets
      can never both own the same selector.
    </li>
    <li><strong>Replace</strong> must revert if it would point a selector at its current facet.</li>
    <li><strong>Remove</strong> must revert if the selector is not currently registered.</li>
  </ul>

  <p>
    The consequence is that adding an innocuous helper to a facet can make an upgrade revert,
    because a completely unrelated facet already claimed that selector. Louper shows you the full
    selector table for a deployed diamond, which is the fastest way to diagnose this class of
    failure.
  </p>

  <h2>Selector collisions are real</h2>

  <p>
    Four bytes gives roughly 4.3 billion possible values. That sounds like plenty, but by the
    birthday bound you only need on the order of 80,000 random signatures before a collision becomes
    likely — and an attacker searching deliberately can find one for a chosen target in seconds on a
    laptop.
  </p>

  <pre><code>{clashCode}</code></pre>

  <p>
    The <code>burn(uint256)</code> collision above is a well known curiosity. In practice,
    accidental collisions between two sensible-looking function names are rare, but they are not
    impossible, and deliberate collisions are trivially cheap to construct. In a diamond the risk is
    not that a collision goes unnoticed — the <code>diamondCut</code> checks catch it — but that an attacker
    who can influence which facets get added could route a legitimate-looking selector to hostile code.
  </p>

  <h2>Unknown selectors</h2>

  <p>
    When a facet's source is not verified, all that can be recovered from the chain is the selector
    list. The names are gone. Louper falls back to selector databases to reverse the mapping, and
    when no match exists it displays the raw selector as <code>unknown_0x12345678</code>.
  </p>

  <p>
    An unverified facet is worth pausing on. You can see <em>that</em> a function exists and that it
    can be called, but not what it does. For a protocol handling real value, unverified facets
    should be treated as an open question during review — see the
    <a href="/learn/diamond-security-checklist">security checklist</a>.
  </p>

  <h2>Practical tips</h2>

  <ul>
    <li>Never hard-code selector constants that you computed by hand; derive them in code.</li>
    <li>
      Before an upgrade, diff the deployed selector set against the set your new facets export.
      Louper's
      <a href="/learn/inspect-a-diamond-with-louper">ABI export</a> makes this a one-line comparison.
    </li>
    <li>
      Keep facets narrow and single-purpose. Small facets collide less often and are easier to
      reason about.
    </li>
    <li>
      Remember that <code>supportsInterface</code> from ERC-165 is itself a selector (<code
        >0x01ffc9a7</code
      >) that must be registered like any other.
    </li>
  </ul>

  <RelatedGuides slug={article.slug} />
</Article>
