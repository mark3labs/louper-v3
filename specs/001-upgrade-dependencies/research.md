# Research Document: Framework and Dependency Upgrade

**Generated**: 2025-11-06  
**Feature**: 001-upgrade-dependencies  
**Purpose**: Research findings for upgrading to latest versions of SvelteKit, Svelte, shadcn-svelte, and Vite using Bun

## Executive Summary

The upgrade from current versions to latest stable releases involves significant changes, particularly the Svelte 4 → 5 migration which introduces a new reactivity model. All target frameworks support Bun as the runtime. The shadcn-svelte components require complete regeneration due to the underlying bits-ui library jumping from v0.9.9 to v2.14.2.

## Version Analysis

### Current State
```json
{
  "@sveltejs/kit": "^2.0.0",
  "svelte": "^4.2.7",
  "vite": "^5.0.0",
  "bits-ui": "^0.9.9",
  "svelte-adapter-bun": "^0.5.2"
}
```

### Target State
```json
{
  "@sveltejs/kit": "^2.48.4",
  "svelte": "^5.43.3",
  "vite": "^5.4.21",
  "bits-ui": "^2.14.2",
  "svelte-adapter-bun": "^0.5.2"
}
```

## Key Decisions

### Decision: Svelte 5 Adoption
**Chosen**: Upgrade to Svelte 5.43.3  
**Rationale**: 
- Svelte 5 is stable and production-ready
- Backward compatible with Svelte 4 syntax (can migrate incrementally)
- Performance improvements with fine-grained reactivity
- Better TypeScript support
- Official migration tool available (`bun x sv migrate svelte-5`)

**Alternatives Considered**:
- Stay on Svelte 4.2.19 (latest v4): Rejected - missing new features and performance improvements
- Wait for Svelte 6: Rejected - no timeline, v5 is stable now

### Decision: Vite Version Selection
**Chosen**: Vite 5.4.21 (latest in 5.x series)  
**Rationale**:
- Stable and well-tested with SvelteKit 2.x
- Full Bun compatibility
- No breaking changes from current 5.0.0
- Vite 7 available but requires additional testing

**Alternatives Considered**:
- Vite 7.2.1: Rejected - requires plugin updates, minimal benefits for this project
- Vite 6.x: Rejected - 5.x is LTS and more stable

### Decision: SvelteKit Version
**Chosen**: SvelteKit 2.48.4  
**Rationale**:
- Latest stable in 2.x series (48 minor versions of improvements)
- No breaking changes from 2.0.0
- Official Bun support added in 2.48.1
- Supports both Svelte 4 and 5

**Alternatives Considered**:
- None - this is a straightforward minor version upgrade

### Decision: shadcn-svelte Migration Strategy
**Chosen**: Complete component regeneration with `--overwrite` flag  
**Rationale**:
- bits-ui v0.9.9 → v2.14.2 has fundamental API changes
- Manual migration would be error-prone
- CLI tool handles Svelte 5 syntax automatically
- Can preserve customizations through git diff review

**Alternatives Considered**:
- Manual migration: Rejected - too many breaking changes in bits-ui
- Gradual component update: Rejected - incompatible versions would coexist

### Decision: Package Manager
**Chosen**: Bun (already in use)  
**Rationale**:
- Already configured in project
- Full support from all target frameworks
- Faster than alternatives
- Native TypeScript support

**Alternatives Considered**:
- None - requirement specified Bun usage

## Breaking Changes Analysis

### Svelte 4 → 5 Breaking Changes

#### Reactivity Model
- **Old**: `let` declarations, `$:` reactive statements
- **New**: Runes API (`$state`, `$derived`, `$effect`)
- **Migration**: Automated via `bun x sv migrate svelte-5`

#### Component Instantiation
- **Old**: `new Component({ target, props })`
- **New**: `mount(Component, { target, props })`
- **Impact**: Affects dynamic component creation

#### Event Handling
- **Old**: `on:click`, `createEventDispatcher`
- **New**: `onclick`, callback props
- **Migration**: Partially automated, manual review needed

#### Slots → Snippets
- **Old**: `<slot name="header" />`
- **New**: `{#snippet header()}...{/snippet}`
- **Impact**: All slotted components need updating

### bits-ui 0.9.9 → 2.14.2 Breaking Changes

#### API Changes
| Component | v0.x | v2.x |
|-----------|------|------|
| Element refs | `el` prop | `ref` prop |
| Child delegation | `asChild` | `child` snippet |
| Data binding | `let:` directives | snippet props |
| Multiple selection | `multiple` prop | `type` prop |

#### Component-Specific Changes
- **Accordion**: Requires explicit `type="single"` or `type="multiple"`
- **Select/Combobox**: `selected` → `value`, requires `type` prop
- **Checkbox**: Boolean `checked` only (no tri-state in single prop)
- **Portal**: No longer automatic, explicit component required

### Package Replacements
- `lucide-svelte` → `@lucide/svelte`
- `cmdk-sv` → bits-ui Command component
- `radix-icons-svelte` → `@lucide/svelte`

## Migration Sequence

### Phase 1: Core Framework Updates
```bash
# Update core packages
bun install svelte@^5.43.3 @sveltejs/kit@^2.48.4 @sveltejs/vite-plugin-svelte@^6.2.1 vite@^5.4.21 -D
```

### Phase 2: Svelte 5 Migration
```bash
# Run migration script
bun x sv migrate svelte-5

# Fix any manual migration issues
bun run check
```

### Phase 3: Dependency Updates
```bash
# Update bits-ui and related packages
bun install bits-ui@^2.14.2 @lucide/svelte@latest tailwindcss-animate -D

# Remove deprecated packages
bun remove cmdk-sv lucide-svelte radix-icons-svelte
```

### Phase 4: shadcn-svelte Component Regeneration
```bash
# Update components.json configuration
# Then regenerate all components
bun x shadcn-svelte@latest add --all --overwrite
```

### Phase 5: Testing and Validation
```bash
# Type checking
bun run check

# Development server
bun --bun run dev

# Production build
bun --bun run build
```

## Risk Assessment

### Low Risk
- SvelteKit 2.0.0 → 2.48.4 (same major version)
- Vite 5.0.0 → 5.4.21 (same major version)
- Bun compatibility (already using Bun)

### Medium Risk
- Svelte 4 → 5 migration (automated tools available)
- Icon library changes (simple find/replace)

### High Risk
- bits-ui major version jump (mitigated by regeneration)
- Custom shadcn component modifications (require manual preservation)

## Performance Considerations

### Expected Improvements
- **Build time**: Vite 5.4.21 has optimized build pipeline
- **Runtime performance**: Svelte 5's fine-grained reactivity
- **Bundle size**: Better tree-shaking in Svelte 5
- **Development experience**: Faster HMR with latest versions

### Potential Degradations
- **Initial migration**: Temporary issues during transition
- **Learning curve**: New Svelte 5 runes API for team

## Compatibility Matrix

| Component | Version | SvelteKit 2.48 | Svelte 5.43 | Vite 5.4 | Bun |
|-----------|---------|----------------|-------------|----------|-----|
| @sveltejs/kit | 2.48.4 | ✅ | ✅ | ✅ | ✅ |
| svelte | 5.43.3 | ✅ | ✅ | ✅ | ✅ |
| vite | 5.4.21 | ✅ | ✅ | ✅ | ✅ |
| @sveltejs/vite-plugin-svelte | 6.2.1 | ✅ | ✅ | ✅ | ✅ |
| bits-ui | 2.14.2 | ✅ | ✅ | ✅ | ✅ |
| svelte-adapter-bun | 0.5.2 | ✅ | ✅ | ✅ | ✅ |

## Best Practices

### During Migration
1. **Commit before each phase** - enables rollback if issues arise
2. **Run type checking frequently** - catches issues early
3. **Test incrementally** - verify each component after migration
4. **Document customizations** - preserve business logic during regeneration

### Post-Migration
1. **Use new Svelte 5 features gradually** - team needs time to learn
2. **Update documentation** - reflect new component APIs
3. **Monitor performance** - ensure no regressions
4. **Update CI/CD** - may need Bun-specific configurations

## Tooling Requirements

### Required CLI Tools
- `bun` (already installed)
- `bun x sv` - Svelte CLI for migrations
- `bun x shadcn-svelte` - Component management

### Development Environment
- VS Code with Svelte extension (update to v5-compatible version)
- TypeScript 5.6.2+ (already in project)
- Tailwind CSS IntelliSense

## Validation Criteria

### Success Metrics
1. All existing features continue to work
2. Development server starts with `bun --bun run dev`
3. Production build succeeds with `bun --bun run build`
4. All tests pass after updates
5. No runtime errors in browser console
6. Hot module replacement works correctly

### Testing Checklist
- [ ] Diamond contract inspection works
- [ ] Multi-chain support maintained
- [ ] All UI components render correctly
- [ ] Forms and interactions functional
- [ ] Database operations unchanged
- [ ] Build output compatible with deployment

## References

- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [SvelteKit Releases](https://github.com/sveltejs/kit/releases)
- [bits-ui Migration Guide](https://bits-ui.com/docs/migration-guide)
- [shadcn-svelte Svelte 5 Migration](https://www.shadcn-svelte.com/docs/migration/svelte-5)
- [Vite 5 Documentation](https://v5.vite.dev)
- [Bun SvelteKit Guide](https://bun.sh/guides/ecosystem/sveltekit)

## Conclusion

The upgrade path is well-defined with official migration tools available. The primary complexity lies in the Svelte 4 → 5 transition and shadcn-svelte component regeneration. With proper testing and phased approach, the migration risk is manageable. The benefits include improved performance, better developer experience, and access to latest framework features while maintaining full Bun compatibility.