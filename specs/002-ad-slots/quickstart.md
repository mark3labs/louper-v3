# Quickstart: Updating Sponsor Content

**Feature**: 002-ad-slots  
**Audience**: Developers and administrators updating sponsor information  
**Time**: 5-10 minutes

## Overview

This guide shows you how to update sponsor/advertisement slot content on the Louper main page. Sponsor slots are managed via static data in the `SponsorSlots.svelte` component.

## Prerequisites

- Code editor (VS Code, Cursor, etc.)
- Access to the louper-v3 repository
- Basic understanding of TypeScript/JavaScript syntax
- Sponsor logo image (PNG, JPG, or SVG format)

## Quick Reference

**File to edit**: `src/routes/SponsorSlots.svelte`  
**Location in file**: Lines 6-35 (approximate, depends on implementation)  
**Number of slots**: Exactly 5 (do not add or remove items)

---

## Step 1: Prepare Sponsor Logo

### Image Requirements

- **Format**: PNG (with transparency), JPG, or SVG
- **Aspect ratio**: Square (1:1) or rectangular (will be center-cropped)
- **Size**: 200x200px minimum, 500x500px maximum recommended
- **File size**: < 50KB recommended
- **Naming**: Use lowercase with hyphens (e.g., `quicknode-logo.svg`)

### Add Logo to Project

1. Place logo file in `/static/img/` directory
2. Example path: `/static/img/quicknode-logo.svg`
3. Verify file is accessible: `http://localhost:5173/img/quicknode-logo.svg` (when dev server running)

---

## Step 2: Edit Sponsor Data

### Locate the Sponsors Array

Open `src/routes/SponsorSlots.svelte` and find the `sponsors` array (around line 6):

```typescript
const sponsors: Sponsor[] = [
  {
    name: 'Sponsor Slot 1',
    description: 'This is a placeholder...',
    logo: '/img/sponsor-placeholder.png',
    tier: 'platinum'
  },
  // ... 4 more slots
];
```

### Update a Sponsor Slot

Replace placeholder content with actual sponsor information:

```typescript
{
  name: 'QuickNode',
  description: 'A blockchain infrastructure provider offering global node access, APIs, and developer tools for Ethereum and 20+ chains with 99.9% uptime.',
  logo: '/img/quicknode-logo.svg',
  tier: 'platinum'
}
```

### Field Guidelines

| Field | Rules | Example |
|-------|-------|---------|
| `name` | 1-50 characters, sponsor organization name | "QuickNode" |
| `description` | 150-200 characters recommended (will truncate to 3 lines) | "A blockchain infrastructure provider..." |
| `logo` | Path relative to `/static/`, starts with `/img/` | "/img/quicknode-logo.svg" |
| `tier` | One of: `'platinum'`, `'gold'`, `'silver'` | "platinum" |

---

## Step 3: Verify Changes Locally

### Start Development Server

```bash
bun run dev
# or
npm run dev
```

### Check the Main Page

1. Open browser to `http://localhost:5173/`
2. Scroll to sponsor section (above Featured Diamonds)
3. Verify your changes:
   - ✅ Logo displays correctly (square shape)
   - ✅ Name and description appear
   - ✅ Text truncates properly (3 lines max)
   - ✅ No JavaScript errors in console (F12)

### Test Responsive Layout

- **Desktop** (≥1024px): Should show 3 columns
- **Tablet** (768-1023px): Should show 2 columns
- **Mobile** (<768px): Should show 1 column (stacked)

Use browser DevTools (F12) → Device Toolbar (Ctrl+Shift+M) to test different screen sizes.

---

## Step 4: Type Check

Run TypeScript type checking to catch errors:

```bash
bun run check
# or
npm run check
```

### Common Type Errors

**Error**: `Type 'string' is not assignable to type '"platinum" | "gold" | "silver"'`

**Fix**: Ensure `tier` is exactly one of the allowed values (check quotes):
```typescript
tier: 'platinum'  // ✅ Correct
tier: "platinum"  // ✅ Also correct
tier: 'Platinum'  // ❌ Wrong (case-sensitive)
tier: 'gold tier' // ❌ Wrong (invalid value)
```

---

## Complete Example

Here's a complete `sponsors` array with real data:

```typescript
const sponsors: Sponsor[] = [
  {
    name: 'QuickNode',
    description: 'A blockchain infrastructure provider offering global node access, APIs, and developer tools for Ethereum and 20+ chains with 99.9% uptime and enterprise-grade reliability.',
    logo: '/img/quicknode-logo.svg',
    tier: 'platinum'
  },
  {
    name: 'Mark3 Labs',
    description: 'Creators of Louper and diamond standard tooling, building infrastructure and developer tools for decentralized systems and smart contract inspection.',
    logo: '/img/mark3labslogo.png',
    tier: 'gold'
  },
  {
    name: 'Gelato Network',
    description: 'Automated smart contract executions on Avalanche, Arbitrum, BSC, Fantom, Ethereum, Optimism, Polygon, and more with reliable automation infrastructure.',
    logo: '/img/gelato-logo.png',
    tier: 'gold'
  },
  {
    name: 'LIFI',
    description: 'Developer solution providing advanced bridge aggregation with DEX connectivity for seamless cross-chain asset transfers and swaps across 20+ blockchains.',
    logo: '/img/lifi.png',
    tier: 'silver'
  },
  {
    name: 'Sponsor Slot 5',
    description: 'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
    logo: '/img/sponsor-placeholder.png',
    tier: 'silver'
  }
];
```

---

## Troubleshooting

### Logo Not Displaying

**Symptom**: Placeholder image shows instead of sponsor logo

**Causes & Solutions**:

1. **Wrong path**: Verify logo is in `/static/img/` and path starts with `/img/`
   ```typescript
   // ❌ Wrong
   logo: 'static/img/logo.png'
   logo: 'img/logo.png'
   
   // ✅ Correct
   logo: '/img/logo.png'
   ```

2. **File doesn't exist**: Check file exists in `/static/img/` directory

3. **Case sensitivity**: Linux/Unix systems are case-sensitive
   ```typescript
   // File: QuickNode-Logo.svg
   logo: '/img/quicknode-logo.svg'  // ❌ Won't work
   logo: '/img/QuickNode-Logo.svg'  // ✅ Correct
   ```

4. **Image format**: Ensure browser supports the format (PNG, JPG, SVG work; WEBP requires fallback)

### Description Too Long

**Symptom**: Description text cut off mid-sentence

**Solution**: Keep descriptions between 150-200 characters. Text automatically truncates at 3 lines with ellipsis.

**Check character count**:
```javascript
const desc = "Your description here";
console.log(desc.length); // Should be 150-200
```

### Layout Breaks on Mobile

**Symptom**: Cards overlap or don't stack properly

**Likely cause**: Tailwind classes modified incorrectly

**Solution**: Verify grid classes in template:
```svelte
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <!-- Must use this exact pattern -->
</div>
```

### TypeScript Errors

**Symptom**: Red underlines in editor or `bun run check` fails

**Common causes**:
1. Missing comma after object
2. Invalid `tier` value (not 'platinum', 'gold', or 'silver')
3. Missing closing brace `}`
4. Extra or missing quotes

**Fix**: Check syntax carefully, use editor's auto-format (Shift+Alt+F in VS Code)

---

## Testing Checklist

Before committing changes:

- [ ] All 5 sponsor slots have valid data
- [ ] Logo images exist in `/static/img/`
- [ ] Descriptions are 150-200 characters
- [ ] No TypeScript errors (`bun run check` passes)
- [ ] Logo displays correctly in browser (square aspect ratio)
- [ ] Description truncates properly (3 lines max)
- [ ] Layout responsive on mobile/tablet/desktop
- [ ] No console errors in browser DevTools
- [ ] Placeholder logo exists at `/img/sponsor-placeholder.png`

---

## Advanced: Creating Placeholder Logo

If you don't have a placeholder logo yet:

### Option 1: Use Louper Logo (Recommended)

```bash
cp static/img/louper-logo.png static/img/sponsor-placeholder.png
```

### Option 2: Create Generic Placeholder

Use an image editor or online tool to create a 200x200px square with:
- Light gray background (`#E5E7EB`)
- Centered text "Sponsor Logo"
- Save as PNG to `static/img/sponsor-placeholder.png`

### Option 3: Use Existing Project Logo

Reuse an existing logo from the project as placeholder:
```typescript
logo: '/img/louper-logo.png'  // Existing file
```

---

## FAQ

### Q: Can I add more than 5 sponsor slots?

**A**: No. The current design requires exactly 5 slots. To add more, you'll need to modify the layout grid and update the spec requirements.

### Q: Can I make sponsor logos clickable?

**A**: No. Per spec requirements (FR-017, FR-018), sponsor slots must be display-only with no interactivity. To add click functionality, update the spec and implementation.

### Q: What if I only have 3 sponsors?

**A**: Keep all 5 slots. Fill remaining slots with placeholder content (as shown in the default data). Per spec FR-015, all 5 slots must always be visible.

### Q: How do I reorder sponsors?

**A**: Simply reorder the objects in the `sponsors` array. The first object displays first (top-left), last object displays last (bottom-right).

### Q: Can I use animated GIFs for logos?

**A**: Yes, browser will animate them. However, keep file size under 50KB and ensure animations are subtle (avoid distracting users from main content).

### Q: How do I remove the placeholder image?

**A**: Don't remove it. The fallback mechanism relies on `/img/sponsor-placeholder.png` existing. If a sponsor logo fails to load, this placeholder displays automatically.

---

## Next Steps

After updating sponsor content:

1. **Commit changes**: 
   ```bash
   git add src/routes/SponsorSlots.svelte static/img/
   git commit -m "Update sponsor slot content"
   ```

2. **Push to repository**:
   ```bash
   git push origin 002-ad-slots
   ```

3. **Create pull request** (if using feature branch workflow)

4. **Deploy to production** (follow project deployment process)

---

## Support

For questions or issues:

- **Feature spec**: See `specs/002-ad-slots/spec.md`
- **Data model**: See `specs/002-ad-slots/data-model.md`
- **Research notes**: See `specs/002-ad-slots/research.md`
- **Project repo**: https://github.com/mark3labs/louper-v3

---

**Last updated**: 2025-11-07  
**Maintainer**: Mark3 Labs team
