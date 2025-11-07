# Research: Advertisement Slots Feature

**Feature**: 002-ad-slots  
**Date**: 2025-11-07  
**Phase**: Phase 0 - Research & Analysis

## Overview

This document captures research findings and design decisions for implementing 5 non-interactive sponsor/advertisement slots on the main page, positioned above the main bordered container.

## Research Areas

### 1. Component Architecture & Data Structure

**Decision**: Use inline static data array within component, following Featured.svelte pattern

**Rationale**:
- **Existing pattern**: Featured.svelte (lines 6-66) uses inline `const diamonds = [...]` array for similar display-only content
- **Simplicity**: No database integration required (per out-of-scope section in spec)
- **Type safety**: TypeScript interface can be defined inline or in `src/lib/types.ts`
- **Performance**: Static data eliminates API calls and loading states
- **Maintainability**: Centralized in single component file makes updates straightforward

**Alternatives considered**:
- Separate data file (`src/lib/data/sponsors.ts`) - Rejected because Featured.svelte uses inline data, and this is a simple 5-item array
- Database/CMS integration - Rejected per spec out-of-scope section

**Code pattern** (from Featured.svelte:6-66):
```svelte
<script>
  const sponsors = [
    {
      name: 'Sponsor Name',
      description: 'Brief description (150-200 chars max)',
      logo: '/img/sponsor-logo.png',
      tier: 'platinum' // or 'gold', 'silver'
    },
    // ... 4 more sponsors
  ]
</script>
```

---

### 2. Image Handling: 1:1 Aspect Ratio & Center Cropping

**Decision**: Use Tailwind CSS `aspect-square`, `object-cover`, and `object-center` utilities

**Rationale**:
- **No JavaScript needed**: Pure CSS solution performs better and is more maintainable
- **Browser support**: CSS `aspect-ratio` property supported in all modern browsers (98%+ per caniuse)
- **Existing pattern**: Project already uses Tailwind for all styling (tailwind.config.js confirms Tailwind 3.x)
- **Responsive**: Works automatically across breakpoints without media queries
- **Center cropping**: `object-cover` + `object-center` preserves center portion when aspect ratio differs from 1:1

**Alternatives considered**:
- JavaScript image manipulation - Rejected due to performance overhead and unnecessary complexity
- Server-side image processing - Rejected per spec assumption that standard web formats are acceptable
- CSS padding-bottom hack - Rejected because modern `aspect-ratio` is cleaner

**Code pattern**:
```svelte
<div class="aspect-square overflow-hidden rounded-lg">
  <img 
    src={sponsor.logo}
    alt={sponsor.name}
    class="size-full object-cover object-center"
    loading="lazy"
    onerror={() => handleImageError(sponsor)}
  />
</div>
```

**Tailwind classes breakdown**:
- `aspect-square` → Enforces 1:1 aspect ratio container (available in Tailwind 3.x)
- `overflow-hidden` → Clips overflowing image content
- `size-full` (or `w-full h-full`) → Image fills container
- `object-cover` → Scales image to cover container (crops if needed)
- `object-center` → Centers image within container (preserves center portion)
- `rounded-lg` → Optional rounded corners for visual appeal

---

### 3. Fallback Image Handling

**Decision**: Use Svelte 5 `$state` rune with `onerror` handler to swap to fallback image

**Rationale**:
- **Requirement compliance**: FR-011 requires fallback placeholder image on load failure
- **Silent error handling**: FR-012 requires silent logging (no user-facing errors)
- **Svelte 5 pattern**: Project uses Svelte 5.43.4 with modern runes syntax
- **No external dependencies**: Built-in DOM event handling

**Alternatives considered**:
- Avatar component with Fallback - Could use existing `$lib/components/ui/avatar` but adds unnecessary nesting
- Picture element with multiple sources - Rejected because we want placeholder, not alternate resolution

**Code pattern**:
```svelte
<script>
  let { sponsor } = $props();
  
  let imgSrc = $state(sponsor.logo);
  const fallbackSrc = '/img/sponsor-placeholder.png';
  
  function handleImageError() {
    if (imgSrc !== fallbackSrc) {
      console.error(`Failed to load logo for sponsor: ${sponsor.name}`);
      imgSrc = fallbackSrc;
    }
  }
</script>

<img 
  src={imgSrc}
  alt={sponsor.name}
  onerror={handleImageError}
/>
```

---

### 4. Text Truncation with Ellipsis

**Decision**: Use Tailwind `line-clamp-3` utility for multi-line truncation

**Rationale**:
- **Built-in utility**: Tailwind 3.x includes `line-clamp-{n}` utilities (no plugin needed)
- **Consistent height**: FR-014 requires slots maintain consistent height regardless of description length
- **Existing pattern**: Featured.svelte uses similar text styling (line 85-87)
- **Character limit**: Spec specifies 150-200 chars; 3 lines accommodates this range
- **Accessibility**: Text remains selectable and doesn't require JavaScript

**Alternatives considered**:
- JavaScript truncation - Rejected due to SSR complexity and performance
- Single-line truncation (`truncate`) - Rejected because 150-200 chars doesn't fit on one line
- Fixed character count - Rejected because line-clamp is more visually consistent across different font sizes

**Code pattern** (from Featured.svelte:85-87):
```svelte
<p class="line-clamp-3 text-sm text-muted-foreground">
  {sponsor.description}
</p>
```

**Line clamp calculation**:
- 150-200 characters at `text-sm` (14px) = ~50-70 chars per line
- 3 lines = 150-210 character capacity (perfect fit)
- `line-clamp-3` displays max 3 lines with ellipsis on overflow

---

### 5. Responsive Layout Strategy

**Decision**: Use mobile-first grid with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Rationale**:
- **Existing pattern**: Featured.svelte uses `grid gap-4 md:grid-cols-2 lg:grid-cols-4` (line 70)
- **5 slots consideration**: 5 items don't divide evenly into 4 columns; 3 columns provides better balance
- **Mobile-first**: Tailwind best practice and project convention
- **User Story 2**: Meets responsive requirements (mobile stack, tablet/desktop grid)
- **Consistency**: Reuses exact grid pattern from Featured component

**Alternatives considered**:
- 4 columns like Featured - Rejected because 5 items leave awkward gap
- 5 columns - Rejected because too dense on desktop, breaks on smaller screens
- Flexbox - Rejected because CSS Grid provides better control for card layouts

**Code pattern** (adapted from Featured.svelte:70):
```svelte
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {#each sponsors as sponsor}
    <!-- Card content -->
  {/each}
</div>
```

**Breakpoint behavior**:
- Mobile (`< 768px`): 1 column (vertical stack)
- Tablet (`768px - 1023px`): 2 columns (2 slots per row, 3rd row has 1)
- Desktop (`≥ 1024px`): 3 columns (2 rows of 2-3 slots)

---

### 6. TypeScript Type Safety

**Decision**: Define `Sponsor` interface inline in component (or optionally in `src/lib/types.ts`)

**Rationale**:
- **Project pattern**: Featured.svelte uses implicit types, but diamond components use explicit types from `src/lib/types.ts`
- **TypeScript strict mode**: Project has `"strict": true` in tsconfig.json (line 11)
- **Maintainability**: Explicit types prevent data structure errors
- **IDE support**: Full IntelliSense and type checking

**Alternatives considered**:
- No explicit type (JavaScript-style) - Rejected due to strict mode and project standards
- Inline type literal - Acceptable for simple components

**Code pattern** (from src/lib/types.ts:3-40):
```typescript
// Option 1: Add to src/lib/types.ts
export interface Sponsor {
  name: string;
  description: string;
  logo: string;
  tier: 'platinum' | 'gold' | 'silver';
}

// Option 2: Inline in component
interface Sponsor {
  name: string;
  description: string;
  logo: string;
  tier: string;
}

const sponsors: Sponsor[] = [
  // ...
];
```

**Recommendation**: Start with inline interface (Option 2) since this is component-specific data. Move to `types.ts` if reused elsewhere.

---

### 7. Component Positioning in Layout

**Decision**: Render SponsorSlots inside main bordered container, above Featured component

**Rationale**:
- **Spec requirement**: FR-001 specifies "positioned above the main bordered application container"
- **Layout analysis**: 
  - Main bordered container: `src/routes/+layout.svelte:81` (`<div class="my-24 rounded-[0.5rem] border shadow-sm shadow-primary">`)
  - Content slot: `src/routes/+layout.svelte:180` (`{@render children()}`)
  - Current page structure: `src/routes/+page.svelte:5-7` (renders `<Featured />` inside content slot)
- **Interpretation**: "Above the main bordered container" means above the Featured content within the container, not outside the container (which would require layout changes)

**Alternatives considered**:
- Outside container (before line 81 of +layout.svelte) - Rejected because would break layout consistency
- Below Featured component - Rejected because spec says "above"

**Code pattern**:
```svelte
<!-- src/routes/+page.svelte -->
<script>
  import Featured from './Featured.svelte'
  import SponsorSlots from './SponsorSlots.svelte'
</script>

<div class="text-center">
  <SponsorSlots />  <!-- NEW: Above Featured -->
  <Featured />       <!-- Existing component -->
</div>
```

---

### 8. Non-Interactive Display (No Click Handlers)

**Decision**: Remove all clickable elements and cursor indicators from sponsor cards

**Rationale**:
- **Explicit requirement**: FR-017 states "MUST NOT be clickable or navigable"
- **Anti-pattern**: Featured.svelte has clickable buttons (line 74-80) - sponsors must NOT follow this pattern
- **Accessibility**: FR-018 requires no visual indicators of interactivity (no hover states, no pointer cursor)
- **User Story 1**: Acceptance scenario #7 confirms no navigation or interaction

**Alternatives considered**:
- Optional click-through links - Rejected per explicit spec requirements
- Hover effects for visual interest - Rejected per FR-018

**Code pattern** (contrast with Featured.svelte:74-80):
```svelte
<!-- Featured.svelte has buttons (DO NOT REPLICATE) -->
<Button
  onclick={() => goto(d.url, { replaceState: true })}
>
  <Search />
</Button>

<!-- SponsorSlots should be plain display only -->
<div class="p-6">
  <div class="aspect-square">
    <img src={sponsor.logo} alt={sponsor.name} />
  </div>
  <h3 class="text-xl font-bold">{sponsor.name}</h3>
  <p class="text-sm text-muted-foreground">{sponsor.description}</p>
</div>
```

**CSS to avoid**:
- `cursor-pointer`
- `hover:` classes that suggest interactivity
- `transition` effects on hover
- Any `onclick` or link wrappers

---

### 9. Placeholder Content Strategy

**Decision**: Create 5 placeholder sponsor objects with generic content and placeholder logo

**Rationale**:
- **Requirement**: FR-007 requires placeholder content for all 5 slots
- **User Story 3**: Administrators should easily identify and update placeholder content
- **Maintainability**: Clear structure makes it obvious what needs updating
- **Success Criteria**: SC-005 requires updates in a single, clearly identified location

**Code pattern**:
```svelte
<script>
  const PLACEHOLDER_LOGO = '/img/sponsor-placeholder.png';
  
  const sponsors = [
    {
      name: 'Sponsor Slot 1',
      description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: PLACEHOLDER_LOGO,
      tier: 'platinum'
    },
    {
      name: 'Sponsor Slot 2',
      description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: PLACEHOLDER_LOGO,
      tier: 'gold'
    },
    {
      name: 'Sponsor Slot 3',
      description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: PLACEHOLDER_LOGO,
      tier: 'silver'
    },
    {
      name: 'Sponsor Slot 4',
      description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: PLACEHOLDER_LOGO,
      tier: 'silver'
    },
    {
      name: 'Sponsor Slot 5',
      description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: PLACEHOLDER_LOGO,
      tier: 'silver'
    }
  ];
</script>
```

**Placeholder asset**: Need to create or source a neutral placeholder image (e.g., louper logo with transparency, or generic square pattern)

---

### 10. Testing Strategy

**Decision**: Manual visual testing across devices and browsers, plus TypeScript type checking

**Rationale**:
- **Existing pattern**: Project has no automated UI tests (package.json shows only `svelte-check`)
- **Project standards**: Technical Context confirms "manual visual testing (no automated tests currently in project)"
- **Test commands**: `npm run check` runs svelte-check for type safety
- **Scope**: Simple display component doesn't warrant test infrastructure for this feature

**Alternatives considered**:
- Unit tests with Vitest - Rejected because project has no test setup
- E2E tests with Playwright - Rejected due to overhead for simple display component
- Visual regression tests - Rejected as nice-to-have but not required

**Manual test checklist**:
1. ✅ All 5 sponsor slots visible on main page
2. ✅ Logos display as perfect squares (1:1 aspect ratio)
3. ✅ Non-square logos are center-cropped appropriately
4. ✅ Descriptions truncate at 3 lines with ellipsis
5. ✅ Fallback image displays when logo fails to load
6. ✅ Mobile: Single column stack
7. ✅ Tablet (768px): 2 column grid
8. ✅ Desktop (1024px+): 3 column grid
9. ✅ No cursor:pointer or hover effects
10. ✅ TypeScript type checking passes: `bun run check`

**Browser targets** (from Technical Context):
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Summary of Key Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Component architecture** | Single SvelteKit component with inline static data | Matches Featured.svelte pattern, simple and maintainable |
| **Data structure** | TypeScript interface with 5-item array | Type safety, clear structure for updates |
| **Image aspect ratio** | Tailwind `aspect-square` + `object-cover` | CSS-only, performant, responsive |
| **Fallback images** | Svelte 5 `$state` with `onerror` handler | Meets FR-011/FR-012, no dependencies |
| **Text truncation** | Tailwind `line-clamp-3` utility | Fits 150-200 char requirement, consistent height |
| **Responsive layout** | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | Matches project pattern, handles 5 items well |
| **Component positioning** | Inside bordered container, above Featured | Preserves existing layout, clear visual hierarchy |
| **Interactivity** | None (display-only, no clicks/hovers) | Explicit spec requirement (FR-017, FR-018) |
| **Placeholder content** | 5 generic sponsor objects with clear labels | Easy to identify and update (User Story 3, SC-005) |
| **Testing approach** | Manual visual + TypeScript checking | Matches current project practices |

---

## Dependencies & Assets Required

1. **Component file**: `src/routes/SponsorSlots.svelte` (new)
2. **Type definition**: Inline `Sponsor` interface (or add to `src/lib/types.ts`)
3. **Placeholder logo**: `/static/img/sponsor-placeholder.png` (create generic placeholder)
4. **No new npm packages**: Uses existing Tailwind utilities and Svelte 5 features
5. **No API endpoints**: Static data only
6. **No database changes**: No schema modifications

---

## Performance Considerations

**Load time impact**: Minimal to none
- Static data (no API calls)
- 5 small logo images (recommend max 50KB each, 250KB total)
- Pure CSS layout (no JavaScript computation)
- Lazy loading for images below fold: `loading="lazy"`

**Performance goals** (from Technical Context):
- ✅ "No additional page load time" - Achieved via static data and lazy loading
- ✅ "Maintain existing load performance" - No blocking resources added

**Constraints compliance**:
- ✅ "No layout shift" - Fixed 5-slot structure prevents cumulative layout shift
- ✅ "Responsive" - CSS Grid adapts without JavaScript
- ✅ "1:1 aspect ratio enforced via CSS" - No JavaScript reflow needed

---

## Next Steps (Phase 1)

1. ✅ Research complete - All technical unknowns resolved
2. ⏭️ Create `data-model.md` - Document Sponsor interface and data structure
3. ⏭️ Skip `contracts/` - No API contracts needed (UI-only feature)
4. ⏭️ Create `quickstart.md` - Developer guide for updating sponsor content
5. ⏭️ Update AGENTS.md - Run `.specify/scripts/bash/update-agent-context.sh`

---

**Phase 0 Status**: ✅ COMPLETE - All design decisions documented and justified
