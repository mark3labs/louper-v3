#!/usr/bin/env node
/**
 * Content consistency checks.
 *
 * Dependency-free guard rails that run in CI alongside lint:
 *   1. Every article in the learn registry has a matching route file.
 *   2. Every /learn route directory is present in the registry (no orphans).
 *   3. Meta descriptions stay within the length search engines display.
 *   4. Required legal/company pages exist — AdSense review checks for these.
 *   5. No route renders ad slots directly, bypassing the layout's policy gate.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const routes = join(root, 'src', 'routes')

const errors = []
const warnings = []

// --- 1 & 2: registry <-> routes parity -------------------------------------
const registrySrc = readFileSync(join(root, 'src', 'lib', 'content', 'learn.ts'), 'utf-8')
const slugs = [...registrySrc.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1])

if (slugs.length === 0) {
  errors.push('learn.ts: no article slugs found — did the registry format change?')
}

for (const slug of slugs) {
  const page = join(routes, 'learn', slug, '+page.svelte')
  if (!existsSync(page)) {
    errors.push(`learn.ts lists "${slug}" but src/routes/learn/${slug}/+page.svelte is missing`)
  }
}

const learnDir = join(routes, 'learn')
if (existsSync(learnDir)) {
  for (const entry of readdirSync(learnDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (!slugs.includes(entry.name)) {
      errors.push(`src/routes/learn/${entry.name} exists but is not listed in learn.ts`)
    }
  }
}

// --- 3: description lengths -------------------------------------------------
for (const m of registrySrc.matchAll(/description:\s*\n?\s*'((?:[^'\\]|\\.)*)'/g)) {
  const text = m[1].replace(/\\'/g, "'")
  if (text.length > 160) {
    warnings.push(`Description is ${text.length} chars (>160): "${text.slice(0, 60)}..."`)
  }
}

// --- 4: required pages ------------------------------------------------------
for (const required of ['about', 'privacy', 'terms', 'contact', 'learn']) {
  if (!existsSync(join(routes, required, '+page.svelte'))) {
    errors.push(`Required page /${required} is missing`)
  }
}

for (const required of ['sitemap.xml', 'robots.txt']) {
  if (!existsSync(join(routes, required, '+server.ts'))) {
    errors.push(`Required endpoint /${required} is missing`)
  }
}

// --- 5: ad slots only via the gated layout ----------------------------------
const walk = (dir) => {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name.endsWith('.svelte')) out.push(full)
  }
  return out
}

const ALLOWED_AD_HOSTS = [
  join(routes, '+layout.svelte'), // performs the shouldRenderAds() gate
  join(routes, 'SponsorSlots.svelte'), // renders units, gated by the layout
]

for (const file of walk(routes)) {
  if (ALLOWED_AD_HOSTS.includes(file)) continue
  const src = readFileSync(file, 'utf-8')
  if (/\bAdSlot\b|\bSponsorSlots\b/.test(src)) {
    errors.push(
      `${file.replace(root + '/', '')} references ad components directly — ` +
        'ads must only be rendered by +layout.svelte so the policy gate applies',
    )
  }
}

// --- 6: AdSense publisher ID matches ads.txt --------------------------------
// A mismatch between data-ad-client and ads.txt makes Google refuse to serve
// ads, with no error anywhere in the page. Cheap to assert, painful to debug.
try {
  const adsSrc = readFileSync(join(root, 'src', 'lib', 'ads.ts'), 'utf-8')
  const adsTxt = readFileSync(join(root, 'static', 'ads.txt'), 'utf-8')

  const clientMatch = adsSrc.match(/ADSENSE_CLIENT\s*=\s*'(ca-pub-\d+)'/)
  const txtMatch = adsTxt.match(/pub-(\d+)/)

  if (!clientMatch) {
    errors.push('ads.ts: could not find ADSENSE_CLIENT constant')
  } else if (!txtMatch) {
    errors.push('static/ads.txt: could not find a pub-<digits> entry')
  } else if (clientMatch[1] !== `ca-pub-${txtMatch[1]}`) {
    errors.push(
      `AdSense publisher ID mismatch: ads.ts has ${clientMatch[1]} but ` +
        `static/ads.txt has pub-${txtMatch[1]}`,
    )
  }

  // Warn (not error) while the placeholder slot is still in place, so the
  // build stays green but nobody forgets ads are switched off.
  if (/AD_SLOTS[^=]*=\s*\[\s*'0000000000'\s*\]/.test(adsSrc)) {
    warnings.push(
      "AD_SLOTS still contains the placeholder '0000000000' — no ads will render " +
        'until it is replaced with a real AdSense unit ID',
    )
  }
} catch (e) {
  errors.push(`Could not verify AdSense configuration: ${e.message}`)
}

// --- report -----------------------------------------------------------------
for (const w of warnings) console.warn(`warning  ${w}`)
for (const e of errors) console.error(`error    ${e}`)

if (errors.length) {
  console.error(`\n${errors.length} content check(s) failed.`)
  process.exit(1)
}

console.log(`Content checks passed: ${slugs.length} guides, ${warnings.length} warning(s).`)
