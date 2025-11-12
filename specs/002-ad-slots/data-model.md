# Data Model: Advertisement Slots

**Feature**: 002-ad-slots  
**Date**: 2025-11-07  
**Phase**: Phase 1 - Data Model Design

## Overview

This document defines the data structures for the sponsor/advertisement slots feature. Since this is a UI-only feature with static data (no database integration), the data model consists of TypeScript interfaces and static data arrays.

## Entities

### Sponsor

Represents a single sponsor/advertisement slot with display information.

**Type**: Interface (TypeScript)  
**Location**: `src/routes/SponsorSlots.svelte` (inline) or `src/lib/types.ts` (if reused)  
**Persistence**: None (static in-memory data)

#### Schema

```typescript
interface Sponsor {
  name: string;          // Sponsor organization name
  description: string;   // Brief description (150-200 chars recommended)
  logo: string;          // Path to logo image (relative to /static/)
  tier: 'platinum' | 'gold' | 'silver';  // Sponsor tier (for future use)
}
```

#### Field Specifications

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-------------|---------|
| `name` | string | Yes | Non-empty, 1-50 chars recommended | Display name for sponsor organization |
| `description` | string | Yes | Non-empty, 150-200 chars recommended | Brief description (truncated to 3 lines with ellipsis if longer) |
| `logo` | string | Yes | Valid path to image in `/static/img/` | Path to logo image (PNG, JPG, SVG) |
| `tier` | string | Yes | One of: 'platinum', 'gold', 'silver' | Sponsor tier classification (reserved for future tier-based styling) |

#### Validation Rules

1. **name**: 
   - Must not be empty string
   - Recommended max length: 50 characters (for display consistency)
   - Example: "QuickNode", "Mark3 Labs", "Louper"

2. **description**:
   - Must not be empty string
   - Recommended length: 150-200 characters (matches 3 lines at `text-sm`)
   - Longer descriptions will be truncated with CSS `line-clamp-3`
   - Example: "A blockchain infrastructure provider offering global node access, APIs, and developer tools for Ethereum and 20+ chains."

3. **logo**:
   - Must be valid path relative to `/static/` directory
   - Recommended format: PNG (with transparency) or SVG
   - Recommended size: Square or rectangular (will be center-cropped to 1:1)
   - Recommended dimensions: 200x200px minimum, 500x500px maximum
   - File size: < 50KB recommended per image
   - Example: "/img/quicknode-logo.svg"

4. **tier**:
   - Must be one of the literal values: 'platinum', 'gold', or 'silver'
   - Currently informational only (no styling differences)
   - Reserved for future tier-based visual treatments
   - Example: "platinum"

#### Example Instances

**Placeholder sponsor**:
```typescript
{
  name: 'Sponsor Slot 1',
  description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
  logo: '/img/sponsor-placeholder.png',
  tier: 'platinum'
}
```

**Real sponsor example**:
```typescript
{
  name: 'QuickNode',
  description: 'A blockchain infrastructure provider offering global node access, APIs, and developer tools for Ethereum and 20+ chains with 99.9% uptime.',
  logo: '/img/quicknode-logo.svg',
  tier: 'platinum'
}
```

---

## Data Structures

### Sponsors Array

**Type**: Array of Sponsor objects  
**Location**: `src/routes/SponsorSlots.svelte` (component-scoped constant)  
**Cardinality**: Exactly 5 elements (fixed requirement)

#### Schema

```typescript
const sponsors: Sponsor[] = [
  // Exactly 5 Sponsor objects
];
```

#### Constraints

1. **Fixed length**: Array MUST contain exactly 5 elements (per FR-001, FR-015)
2. **Order matters**: Array order determines display order (top to bottom, left to right)
3. **No duplicates**: Each sponsor should have unique `name` (not enforced in code, but recommended)
4. **Immutable**: Declared as `const` (no runtime modifications)

#### Initialization Pattern

```typescript
const sponsors: Sponsor[] = [
  {
    name: 'Sponsor Slot 1',
    description: 'Placeholder description for sponsor slot 1. This will be replaced with actual sponsor content.',
    logo: '/img/sponsor-placeholder.png',
    tier: 'platinum'
  },
  {
    name: 'Sponsor Slot 2',
    description: 'Placeholder description for sponsor slot 2. This will be replaced with actual sponsor content.',
    logo: '/img/sponsor-placeholder.png',
    tier: 'gold'
  },
  {
    name: 'Sponsor Slot 3',
    description: 'Placeholder description for sponsor slot 3. This will be replaced with actual sponsor content.',
    logo: '/img/sponsor-placeholder.png',
    tier: 'silver'
  },
  {
    name: 'Sponsor Slot 4',
    description: 'Placeholder description for sponsor slot 4. This will be replaced with actual sponsor content.',
    logo: '/img/sponsor-placeholder.png',
    tier: 'silver'
  },
  {
    name: 'Sponsor Slot 5',
    description: 'Placeholder description for sponsor slot 5. This will be replaced with actual sponsor content.',
    logo: '/img/sponsor-placeholder.png',
    tier: 'silver'
  }
];
```

---

## State Management

### Component State (Svelte 5 Runes)

**imgSrc state** (per sponsor card, internal to rendering):

```typescript
let imgSrc = $state(sponsor.logo);
```

**Purpose**: Track current image source (original or fallback) for each sponsor logo

**State Transitions**:
1. Initial state: `imgSrc = sponsor.logo` (from data array)
2. On image load error: `imgSrc = '/img/sponsor-placeholder.png'` (fallback)
3. Prevent infinite loop: Check `imgSrc !== fallbackSrc` before updating

**Lifecycle**:
- Created: When component mounts and renders each sponsor card
- Updated: Only when image fails to load (`onerror` event)
- Destroyed: When component unmounts

---

## Data Flow

```
┌─────────────────────────────────────┐
│  Static Data Array (compile-time)  │
│  const sponsors: Sponsor[] = [...]  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Component Mount (runtime)         │
│   {#each sponsors as sponsor}       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Render Sponsor Card               │
│   - Display name (text)             │
│   - Display description (text)      │
│   - Load logo image                 │
│   - Initialize imgSrc = sponsor.logo│
└─────────────┬───────────────────────┘
              │
              ├───► Image Load Success ───► Display logo
              │
              └───► Image Load Failure ───┐
                                          ▼
                    ┌─────────────────────────────────────┐
                    │   Error Handler (onerror)           │
                    │   - Log error to console            │
                    │   - Update imgSrc to fallback       │
                    │   - Re-render with placeholder      │
                    └─────────────────────────────────────┘
```

---

## Relationships

**No relationships**: This is an isolated feature with no dependencies on other data models.

- ❌ No database entities
- ❌ No API responses
- ❌ No user data
- ❌ No authentication/authorization
- ❌ No cross-references to Diamond or Contract entities

**Future considerations** (out of current scope):
- If sponsors become dynamic, consider creating `Sponsor` table in database
- If click tracking added, consider relationship to analytics events
- If sponsors link to projects, consider optional relationship to featured diamonds

---

## Type Definitions Location

### Option 1: Inline (Recommended for MVP)

```typescript
// src/routes/SponsorSlots.svelte
<script>
  interface Sponsor {
    name: string;
    description: string;
    logo: string;
    tier: 'platinum' | 'gold' | 'silver';
  }

  const sponsors: Sponsor[] = [
    // ...
  ];
</script>
```

**Pros**: 
- Self-contained component
- No external dependencies
- Easier to understand for simple use case

**Cons**:
- Type not reusable in other components
- Must duplicate if used elsewhere

### Option 2: Shared Types (If Reused)

```typescript
// src/lib/types.ts
export interface Sponsor {
  name: string;
  description: string;
  logo: string;
  tier: 'platinum' | 'gold' | 'silver';
}
```

```typescript
// src/routes/SponsorSlots.svelte
<script>
  import type { Sponsor } from '$lib/types';

  const sponsors: Sponsor[] = [
    // ...
  ];
</script>
```

**Pros**:
- Reusable across components
- Consistent with project pattern (see existing types in `src/lib/types.ts`)

**Cons**:
- Adds indirection
- Overkill if only used in one component

**Recommendation**: Start with Option 1 (inline). Move to Option 2 if sponsor type is needed in admin interface or other components.

---

## Compliance with Requirements

### Functional Requirements Mapping

| Requirement | Data Model Support |
|-------------|-------------------|
| FR-001: Display 5 sponsor slots | Array with exactly 5 elements |
| FR-002: Display logo (1:1 aspect) | `logo` field with image path |
| FR-003: Display title | `name` field |
| FR-004: Display description | `description` field |
| FR-007: Provide placeholder content | Default array with placeholder values |
| FR-011: Fallback image on load failure | `imgSrc` state + error handler |
| FR-013: Truncate descriptions | Handled by CSS, not data model |

### Success Criteria Mapping

| Criterion | Data Model Support |
|-----------|-------------------|
| SC-005: Update content in single location | All data in `sponsors` array in SponsorSlots.svelte |
| SC-008: Always display 5 slots | Fixed array length constraint |

---

## Migration Notes

**No database migrations required**: This feature uses static data only.

**Asset migration**:
1. Add placeholder logo: `/static/img/sponsor-placeholder.png`
2. Add actual sponsor logos to `/static/img/` as needed

**Type migration**:
- No breaking changes (new type, not modifying existing)
- If adding to `src/lib/types.ts`, export as new interface

---

## Future Enhancements (Out of Scope)

Potential data model expansions for future features:

1. **Dynamic sponsors** (database-backed):
   ```sql
   CREATE TABLE sponsors (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     description TEXT NOT NULL,
     logo_url VARCHAR(500) NOT NULL,
     tier VARCHAR(20) NOT NULL CHECK (tier IN ('platinum', 'gold', 'silver')),
     active BOOLEAN DEFAULT true,
     display_order INTEGER NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Click tracking**:
   ```typescript
   interface SponsorClick {
     sponsorId: number;
     timestamp: Date;
     userId?: string;
   }
   ```

3. **Rotation/scheduling**:
   ```typescript
   interface Sponsor {
     // ... existing fields
     startDate?: Date;
     endDate?: Date;
     impressions?: number;
     maxImpressions?: number;
   }
   ```

4. **Rich content**:
   ```typescript
   interface Sponsor {
     // ... existing fields
     website?: string;
     ctaText?: string;
     ctaUrl?: string;
     tags?: string[];
   }
   ```

---

## Summary

**Entity count**: 1 (Sponsor interface)  
**Persistence**: None (static data)  
**Relationships**: None (isolated feature)  
**State**: Minimal (image fallback only)  
**Type location**: Inline in component (can move to `src/lib/types.ts` if needed)  
**Validation**: TypeScript compile-time + CSS runtime (truncation)

This data model is intentionally simple to match the MVP requirements: static placeholder content that administrators can easily update by editing the `sponsors` array in `SponsorSlots.svelte`.
