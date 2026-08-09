/**
 * Registry of /learn guides.
 *
 * This is the single source of truth for the guide index page, the sitemap and
 * cross-linking between articles. Each entry MUST have a matching route at
 * `src/routes/learn/<slug>/+page.svelte` — `scripts/check-content.js` enforces
 * this so the registry and routes cannot drift apart.
 */

export type LearnArticle = {
  slug: string
  title: string
  /** Used as the meta description and the index-page summary. Keep under 160 chars. */
  description: string
  publishedAt: string
  updatedAt?: string
  readingMinutes: number
  /** Grouping shown on the index page. */
  category: 'Fundamentals' | 'Development' | 'Security' | 'Using Louper'
}

export const learnArticles: LearnArticle[] = [
  {
    slug: 'what-is-a-diamond',
    title: 'What Is a Diamond? EIP-2535 Explained',
    description:
      'A plain-English introduction to the EIP-2535 Diamond standard: what problem it solves, how facets work, and when you should (and should not) use one.',
    publishedAt: '2026-08-09',
    readingMinutes: 9,
    category: 'Fundamentals',
  },
  {
    slug: 'function-selectors-explained',
    title: 'Function Selectors Explained',
    description:
      'How Solidity turns a function signature into a 4-byte selector, why selectors matter for diamonds, and how selector collisions actually happen.',
    publishedAt: '2026-08-09',
    readingMinutes: 8,
    category: 'Fundamentals',
  },
  {
    slug: 'the-diamond-loupe',
    title: 'The Diamond Loupe: Introspecting a Diamond',
    description:
      'The four loupe functions defined by EIP-2535, what each one returns, and how tools like Louper use them to reconstruct a diamond ABI.',
    publishedAt: '2026-08-09',
    readingMinutes: 7,
    category: 'Fundamentals',
  },
  {
    slug: 'diamond-storage-patterns',
    title: 'Diamond Storage Patterns: AppStorage vs Diamond Storage',
    description:
      'Why facets cannot use ordinary state variables, and how Diamond Storage and AppStorage keep upgradeable contracts from corrupting their own state.',
    publishedAt: '2026-08-09',
    readingMinutes: 11,
    category: 'Development',
  },
  {
    slug: 'upgrading-with-diamondcut',
    title: 'Upgrading a Diamond with diamondCut',
    description:
      'A walkthrough of the diamondCut function: Add, Replace and Remove actions, initialization calls, and the mistakes that brick an upgrade.',
    publishedAt: '2026-08-09',
    readingMinutes: 10,
    category: 'Development',
  },
  {
    slug: 'diamonds-vs-proxies',
    title: 'Diamonds vs Transparent and UUPS Proxies',
    description:
      'An honest comparison of EIP-2535 against the more common proxy patterns, including the real trade-offs in gas, tooling and audit burden.',
    publishedAt: '2026-08-09',
    readingMinutes: 9,
    category: 'Fundamentals',
  },
  {
    slug: 'diamond-security-checklist',
    title: 'Diamond Security Checklist',
    description:
      'Practical review checklist for EIP-2535 contracts: ownership of diamondCut, selector clashes, initializer safety, and storage collision risks.',
    publishedAt: '2026-08-09',
    readingMinutes: 12,
    category: 'Security',
  },
  {
    slug: 'inspect-a-diamond-with-louper',
    title: 'How to Inspect a Diamond with Louper',
    description:
      'Step-by-step guide to auditing any deployed diamond with Louper: reading facets, calling view functions, and exporting the combined ABI.',
    publishedAt: '2026-08-09',
    readingMinutes: 8,
    category: 'Using Louper',
  },
]

export const learnCategories = [
  'Fundamentals',
  'Development',
  'Security',
  'Using Louper',
] as const satisfies readonly LearnArticle['category'][]

export const getArticle = (slug: string): LearnArticle | undefined =>
  learnArticles.find((a) => a.slug === slug)

/** Returns up to `limit` other articles, preferring the same category. */
export const relatedArticles = (slug: string, limit = 3): LearnArticle[] => {
  const current = getArticle(slug)
  const others = learnArticles.filter((a) => a.slug !== slug)
  if (!current) return others.slice(0, limit)
  const sameCategory = others.filter((a) => a.category === current.category)
  const rest = others.filter((a) => a.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}
