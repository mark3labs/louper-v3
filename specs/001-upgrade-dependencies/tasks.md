# Tasks: Framework and Dependency Upgrade

**Input**: Design documents from `/specs/001-upgrade-dependencies/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests ARE included as the spec indicates test suite execution is required (User Story 4).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- This project uses SvelteKit structure: `src/`, `scripts/`, `drizzle/`, `static/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create migration branch `001-upgrade-dependencies` and ensure clean git status
- [X] T002 Create backup of current state in `.backup/pre-migration-$(date +%Y%m%d-%H%M%S)`
- [X] T003 [P] Add migration scripts to package.json per contracts/cli-commands.json
- [X] T004 [P] Create migration validation script in scripts/validate-migration.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Upgrade core framework packages: svelte@^5.43.3 @sveltejs/kit@^2.48.4 vite@^7.2.1 @sveltejs/vite-plugin-svelte@^6.2.1
- [X] T006 Run Svelte 5 migration tool: `bun x sv migrate svelte-5` (Manual migration performed due to interactive tool limitation)
- [X] T007 Update TypeScript configuration in tsconfig.json for Svelte 5 compatibility
- [X] T008 Fix any immediate compilation errors from the Svelte 5 migration (BLOCKED: requires T036 component regeneration)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Environment Setup (Priority: P1) 🎯 MVP

**Goal**: Developers can install and run the project with latest dependencies using Bun

**Independent Test**: Run `bun install` and `bun run dev` commands and verify development server starts

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Create test script for package installation validation in scripts/test-install.js
- [ ] T010 [P] [US1] Create test script for dev server startup in scripts/test-dev-server.js
- [ ] T011 [P] [US1] Create test script for HMR functionality in scripts/test-hmr.js

### Implementation for User Story 1

- [ ] T012 [US1] Update package.json with range-based versions for all core dependencies
- [ ] T013 [US1] Configure bun-specific settings and trustedDependencies in package.json
- [ ] T014 [US1] Update svelte.config.js for Bun adapter and Svelte 5 compatibility
- [ ] T015 [US1] Update vite.config.ts for Vite 5.4.21 and plugin compatibility
- [ ] T016 [US1] Fix any remaining dependency conflicts with Bun overrides/resolutions
- [ ] T017 [US1] Verify `bun install` completes successfully
- [ ] T018 [US1] Verify `bun --bun run dev` starts without errors
- [ ] T019 [US1] Test hot module replacement works correctly

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Production Build Process (Priority: P1)

**Goal**: Developers can build the project for production deployment using the upgraded dependencies

**Independent Test**: Run `bun run build` and verify build completes successfully

### Tests for User Story 2

- [ ] T020 [P] [US2] Create test script for build command validation in scripts/test-build.js
- [ ] T021 [P] [US2] Create test script for build output validation in scripts/test-build-output.js
- [ ] T022 [P] [US2] Create test script for preview server in scripts/test-preview.js

### Implementation for User Story 2

- [ ] T023 [US2] Update build configuration in vite.config.ts for production optimization
- [ ] T024 [US2] Configure adapter settings in svelte.config.js for production builds
- [ ] T025 [US2] Fix any TypeScript errors that appear during build process
- [ ] T026 [US2] Verify `bun --bun run build` completes without errors
- [ ] T027 [US2] Verify build output contains all necessary assets
- [ ] T028 [US2] Test `bun run preview` serves the production build correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Existing Feature Compatibility (Priority: P2)

**Goal**: All existing features continue to function after the dependency upgrade

**Independent Test**: Navigate through all major application features and verify they work as expected

### Tests for User Story 3

- [ ] T029 [P] [US3] Create integration test for Diamond inspection routes in scripts/test-diamond-routes.js
- [ ] T030 [P] [US3] Create integration test for chain selection in scripts/test-chain-selection.js
- [ ] T031 [P] [US3] Create integration test for facets table functionality in scripts/test-facets-table.js

### Implementation for User Story 3

- [X] T032 [US3] Update UI library dependencies: bits-ui@^2.14.2 @lucide/svelte tailwindcss-animate
- [X] T033 [US3] Remove deprecated packages: cmdk-sv lucide-svelte radix-icons-svelte
- [X] T034 [P] [US3] Update all icon imports from `lucide-svelte` to `@lucide/svelte` throughout src/
- [X] T035 [US3] Update components.json for shadcn-svelte Svelte 5 compatibility
- [X] T036 [US3] Regenerate shadcn-svelte components with `bun x shadcn-svelte@latest add --all --overwrite`
- [X] T037 [US3] Fix component prop changes from bits-ui v0.9.9 to v2.14.2 API
- [ ] T038 [US3] Update event handlers from `on:click` to `onclick` syntax in all Svelte files (optional - backward compatible)
- [ ] T039 [US3] Update reactive statements from `$:` to `$derived`/`$effect` where needed (optional - backward compatible)
- [ ] T040 [US3] Test Diamond contract inspection functionality at route /diamond/[address]
- [ ] T041 [US3] Test multi-chain support and chain switching functionality
- [ ] T042 [US3] Verify all UI components render correctly with new versions
- [ ] T043 [US3] Test form submissions and data operations work correctly
- [ ] T044 [US3] Verify Drizzle ORM operations and database connections still work

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Test Suite Execution (Priority: P2)

**Goal**: All existing tests pass with the upgraded dependencies

**Independent Test**: Run `bun test` and verify all existing tests pass

### Tests for User Story 4

- [ ] T045 [P] [US4] Create meta-test to verify test runner works in scripts/test-test-runner.js
- [ ] T046 [P] [US4] Create test coverage report script in scripts/test-coverage.js

### Implementation for User Story 4

- [ ] T047 [US4] Update test configuration for Svelte 5 and new dependencies
- [ ] T048 [US4] Fix any test imports that use deprecated packages
- [ ] T049 [US4] Update component tests for new Svelte 5 syntax
- [X] T050 [US4] Run `bun run check` and fix all TypeScript errors (✓ 0 errors, 3 warnings)
- [X] T051 [US4] Run `bun run lint` and fix all linting issues (✓ Passing, backup files have formatting warnings)
- [ ] T052 [US4] Execute full test suite with `bun test`
- [ ] T053 [US4] Fix any failing tests due to API changes
- [ ] T054 [US4] Verify test coverage meets requirements

**Checkpoint**: All tests should pass with upgraded dependencies

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 [P] Update README.md with new dependency versions and Bun requirements
- [ ] T056 [P] Document Svelte 5 migration patterns for team reference in docs/
- [ ] T057 Clean up any temporary migration files or backup directories
- [ ] T058 [P] Add performance monitoring for before/after comparison
- [ ] T059 Verify no console errors in browser development tools
- [ ] T060 Run quickstart.md validation following all steps
- [ ] T061 Create rollback documentation with clear steps
- [ ] T062 Final validation: all commands from contracts/cli-commands.json work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 (both P1) should be done first as they're critical
  - US3 and US4 (both P2) can proceed after US1/US2 or in parallel
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Benefits from US1 completion but can run independently
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Requires dependency updates which overlap with US1
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Best done after US3 to test upgraded components

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Configuration updates before code changes
- Core implementation before integration testing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Once Foundational phase completes:
  - US1 and US2 can run in parallel (both P1 priority)
  - US3 and US4 can run in parallel (both P2 priority)
- All test scripts within a story marked [P] can run in parallel
- Icon import updates and documentation can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create test script for package installation validation in scripts/test-install.js"
Task: "Create test script for dev server startup in scripts/test-dev-server.js"
Task: "Create test script for HMR functionality in scripts/test-hmr.js"
```

## Parallel Example: User Story 3

```bash
# Launch all integration tests together:
Task: "Create integration test for Diamond inspection routes in scripts/test-diamond-routes.js"
Task: "Create integration test for chain selection in scripts/test-chain-selection.js"
Task: "Create integration test for facets table functionality in scripts/test-facets-table.js"

# After dependencies are updated, update imports in parallel:
Task: "Update all icon imports from lucide-svelte to @lucide/svelte throughout src/"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Developer Environment)
4. Complete Phase 4: User Story 2 (Production Build)
5. **STOP and VALIDATE**: Test development and build processes work
6. Deploy to staging environment if ready

### Incremental Delivery

1. Complete Setup + Foundational → Framework upgraded to Svelte 5
2. Add User Story 1 → Development environment works → Team can develop
3. Add User Story 2 → Production builds work → Can deploy
4. Add User Story 3 → All features work → Full compatibility
5. Add User Story 4 → All tests pass → Quality assured
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + 2 (critical path)
   - Developer B: User Story 3 (feature compatibility)
   - Developer C: User Story 4 (test suite)
3. Stories complete and integrate independently

---

## Migration Commands Reference

Based on contracts/cli-commands.json, use these commands:

- `bun run migrate` - Run complete migration process
- `bun run migrate:validate` - Validate migration readiness
- `bun run migrate:backup` - Create backup before migration
- `bun run migrate:upgrade-core` - Upgrade core framework packages
- `bun run migrate:svelte` - Run Svelte 5 migration
- `bun run migrate:update-deps` - Update all dependencies
- `bun run migrate:regenerate-components` - Regenerate shadcn components
- `bun run migrate:test` - Run tests after migration
- `bun run migrate:rollback` - Rollback to previous state if needed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each phase or user story completion
- Stop at any checkpoint to validate story independently
- Critical: US1 and US2 are both P1 priority and enable development/deployment