# Quickstart Guide: Framework and Dependency Upgrade

**Feature**: 001-upgrade-dependencies  
**Estimated Time**: 30-45 minutes  
**Risk Level**: Medium (reversible with backup)

## Prerequisites

Before starting the migration, ensure you have:

- ✅ **Bun installed** (version 1.0+)
- ✅ **Git repository** with clean working directory
- ✅ **Current project running** successfully with `bun --bun run dev`
- ✅ **All tests passing** (if applicable)
- ✅ **At least 2GB free disk space** for backups

## Quick Migration (Automated)

For developers who want to upgrade quickly with all defaults:

```bash
# 1. Create a new branch
git checkout -b 001-upgrade-dependencies

# 2. Run the complete migration
bun run migrate

# 3. Test the result
bun --bun run dev
```

If everything works, you're done! If not, continue to the step-by-step guide.

## Step-by-Step Migration

### Step 1: Preparation (5 minutes)

```bash
# Ensure clean git status
git status

# Create migration branch
git checkout -b 001-upgrade-dependencies

# Create backup
cp -r . ../.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
```

### Step 2: Core Framework Upgrade (5 minutes)

```bash
# Update core packages to latest versions
bun install svelte@^5.43.3 @sveltejs/kit@^2.48.4 @sveltejs/vite-plugin-svelte@^6.2.1 vite@^5.4.21 -D

# Verify installation
bun pm ls | grep -E "svelte|kit|vite"
```

**Expected Output:**
- svelte@5.43.3
- @sveltejs/kit@2.48.4
- vite@5.4.21

### Step 3: Svelte 5 Migration (10 minutes)

```bash
# Run the Svelte 5 migration tool
bun x sv migrate svelte-5

# Review changes
git diff --stat

# Fix any TypeScript errors
bun run check
```

**Common Issues:**
- If you see errors about `$state` or `$derived`, the migration tool will handle most cases
- Manual review needed for complex reactive statements

### Step 4: Update Dependencies (5 minutes)

```bash
# Update UI dependencies for Svelte 5 compatibility
bun install bits-ui@^2.14.2 @lucide/svelte@latest tailwindcss-animate -D

# Remove deprecated packages
bun remove cmdk-sv lucide-svelte radix-icons-svelte

# Update imports in your code
find src -name "*.svelte" -o -name "*.ts" | xargs sed -i 's/lucide-svelte/@lucide\/svelte/g'
```

### Step 5: Update Configuration Files (5 minutes)

#### Update components.json:
```json
{
  "$schema": "https://shadcn-svelte.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "css": "src/app.postcss",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "$lib/components",
    "utils": "$lib/utils",
    "ui": "$lib/components/ui",
    "hooks": "$lib/hooks",
    "lib": "$lib"
  },
  "registry": "https://shadcn-svelte.com/registry"
}
```

#### Update tailwind.config.js:
```javascript
// Add to plugins array
plugins: [
  require('tailwindcss-animate'),
  // ... other plugins
]
```

### Step 6: Regenerate shadcn Components (10 minutes)

```bash
# List current UI components
ls src/lib/components/ui/

# Regenerate all components for Svelte 5
bun x shadcn-svelte@latest add --all --overwrite

# Or regenerate specific components one by one
bun x shadcn-svelte@latest add button --overwrite
bun x shadcn-svelte@latest add card --overwrite
bun x shadcn-svelte@latest add dialog --overwrite
# ... repeat for each component you use
```

### Step 7: Testing (5 minutes)

```bash
# Run type checking
bun run check

# Build the project
bun --bun run build

# Start dev server
bun --bun run dev
```

**Success Criteria:**
- ✅ No TypeScript errors
- ✅ Build completes without errors
- ✅ Dev server starts successfully
- ✅ Application loads in browser
- ✅ No console errors

### Step 8: Commit Changes

```bash
# Review all changes
git diff --stat

# Add and commit
git add .
git commit -m "feat: upgrade to Svelte 5, SvelteKit 2.48.4, and latest dependencies

- Upgraded Svelte from 4.2.7 to 5.43.3
- Upgraded SvelteKit from 2.0.0 to 2.48.4
- Upgraded Vite from 5.0.0 to 5.4.21
- Updated bits-ui from 0.9.9 to 2.14.2
- Migrated all components to Svelte 5 syntax
- Regenerated shadcn-svelte components
- Replaced deprecated icon packages"
```

## Troubleshooting

### Issue: Build fails with "Cannot find module"

**Solution:**
```bash
# Clear Bun cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Issue: Components not rendering correctly

**Solution:**
```bash
# Regenerate specific component
bun x shadcn-svelte@latest add [component-name] --overwrite
```

### Issue: TypeScript errors about `$state` or `$derived`

**Solution:**
```bash
# Re-run migration on specific file
bun x sv migrate svelte-5 src/path/to/file.svelte
```

### Issue: Import errors for icons

**Solution:**
```bash
# Update all icon imports
find src -type f -name "*.svelte" -o -name "*.ts" | xargs sed -i 's/from "lucide-svelte"/from "@lucide\/svelte"/g'
```

## Rollback Procedure

If you encounter critical issues:

```bash
# Option 1: Git reset (if not committed)
git reset --hard
git clean -fd

# Option 2: Restore from backup
rm -rf ./*
cp -r ../.backup-*/* .
bun install

# Option 3: Checkout previous branch
git checkout main
git branch -D 001-upgrade-dependencies
```

## Validation Checklist

After migration, verify:

- [ ] **Dev Server**: `bun --bun run dev` starts without errors
- [ ] **Production Build**: `bun --bun run build` completes successfully
- [ ] **Type Check**: `bun run check` passes
- [ ] **UI Components**: All components render correctly
- [ ] **Forms**: Form submissions work
- [ ] **Routing**: All routes load properly
- [ ] **Diamond Inspection**: Core functionality intact
- [ ] **No Console Errors**: Check browser developer console

## Next Steps

After successful migration:

1. **Test thoroughly** in development environment
2. **Run existing test suite** if available
3. **Deploy to staging** for further testing
4. **Monitor for issues** after deployment
5. **Update documentation** to reflect Svelte 5 patterns

## Quick Reference

### New Svelte 5 Patterns

```svelte
<!-- Old (Svelte 4) -->
<script>
  export let count = 0;
  $: doubled = count * 2;
</script>

<!-- New (Svelte 5) -->
<script>
  let { count = 0 } = $props();
  const doubled = $derived(count * 2);
</script>
```

### Updated Import Paths

```javascript
// Old
import { Search } from 'lucide-svelte';

// New
import { Search } from '@lucide/svelte';
```

### Package Versions Reference

| Package | Old Version | New Version |
|---------|-------------|-------------|
| svelte | 4.2.7 | 5.43.3 |
| @sveltejs/kit | 2.0.0 | 2.48.4 |
| vite | 5.0.0 | 5.4.21 |
| bits-ui | 0.9.9 | 2.14.2 |
| lucide icons | lucide-svelte | @lucide/svelte |

## Support

If you encounter issues not covered in this guide:

1. Check the [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
2. Review [shadcn-svelte Migration Docs](https://www.shadcn-svelte.com/docs/migration/svelte-5)
3. Search for issues in the project repository
4. Create a new issue with migration logs

## Summary

This upgrade brings significant improvements:
- ⚡ Better performance with Svelte 5's reactivity
- 🛠️ Improved developer experience
- 🔒 Latest security patches
- 📦 Smaller bundle sizes
- 🚀 Faster build times with Vite 5.4

The migration process is largely automated, with most complexity handled by the migration tools. The main manual work involves regenerating shadcn-svelte components and fixing any custom business logic that doesn't auto-migrate.