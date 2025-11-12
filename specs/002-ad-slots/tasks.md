---

description: "Task list for Advertisement Slots feature implementation"
---

# Tasks: Advertisement Slots

**Feature**: 002-ad-slots  
**Input**: Design documents from `/specs/002-ad-slots/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This feature uses manual visual testing only (no automated tests per project standards in package.json)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (SvelteKit)**: `src/routes/` for pages and components, `src/lib/` for shared code, `static/` for assets

---

## Phase 1: Setup (Asset Preparation)

**Purpose**: Prepare static assets needed for sponsor slots

- [X] T001 Create placeholder logo image at static/img/sponsor-placeholder.png (200x200px, PNG format)
- [X] T002 [P] Verify existing sponsor logos in static/img/ directory (quicknode-logo.svg, mark3labslogo.png, gelato-logo.png, lifi.png)

**Checkpoint**: All required image assets are in place

---

## Phase 2: Foundational (No Blocking Prerequisites)

**Purpose**: This feature has no foundational dependencies - it's a standalone UI component

**⚠️ Note**: This phase is empty because the feature requires only setup (assets) before implementation can begin. Skip to Phase 3.

---

## Phase 3: User Story 1 - View Sponsor Listings (Priority: P1) 🎯 MVP

**Goal**: Display 5 sponsor slots on the main page with logo (1:1 aspect ratio), title, and description. Includes fallback image handling and text truncation.

**Independent Test**: Load main page at http://localhost:5173/ and verify 5 sponsor slots are visible above the main container with proper layout (logo on left, title and description on right). Check that logos display as perfect squares and descriptions truncate at 3 lines.

### Implementation for User Story 1

- [X] T003 [US1] Create Sponsor interface inline in src/routes/SponsorSlots.svelte (name, description, logo, tier fields)
- [X] T004 [US1] Create sponsors static data array with 5 placeholder entries in src/routes/SponsorSlots.svelte
- [X] T005 [US1] Implement SponsorSlots component layout with grid container (grid gap-4 md:grid-cols-2 lg:grid-cols-3) in src/routes/SponsorSlots.svelte
- [X] T006 [US1] Implement sponsor card layout with left logo container (aspect-square) in src/routes/SponsorSlots.svelte
- [X] T007 [US1] Implement sponsor card text content (title and description with line-clamp-3) in src/routes/SponsorSlots.svelte
- [X] T008 [US1] Implement image fallback handling with $state rune and onerror handler in src/routes/SponsorSlots.svelte
- [X] T009 [US1] Apply CSS classes for 1:1 aspect ratio and center cropping (object-cover object-center) in src/routes/SponsorSlots.svelte
- [X] T010 [US1] Import and render SponsorSlots component in src/routes/+page.svelte above Featured component
- [X] T011 [US1] Verify 5 sponsor slots display correctly on main page with placeholder content
- [X] T012 [US1] Test image fallback by using invalid logo path and verifying placeholder displays
- [X] T013 [US1] Test text truncation with long descriptions (>200 chars) to verify 3-line ellipsis
- [X] T014 [US1] Test logo cropping with non-square images to verify center-crop behavior

**Checkpoint**: User Story 1 is complete - 5 sponsor slots display on main page with all core functionality (layout, fallbacks, truncation, aspect ratio)

---

## Phase 4: User Story 2 - Responsive Layout (Priority: P2)

**Goal**: Ensure sponsor slots adapt properly to mobile, tablet, and desktop screen sizes without horizontal scrolling or layout breaks.

**Independent Test**: Resize browser window or use device toolbar (F12 → Ctrl+Shift+M) to test mobile (<768px = 1 column), tablet (768-1023px = 2 columns), and desktop (≥1024px = 3 columns) layouts. Verify text remains readable and logos display correctly at all sizes.

### Implementation for User Story 2

- [X] T015 [US2] Test mobile layout (< 768px width) and verify single column stack in src/routes/SponsorSlots.svelte
- [X] T016 [US2] Test tablet layout (768-1023px width) and verify 2-column grid in src/routes/SponsorSlots.svelte
- [X] T017 [US2] Test desktop layout (≥ 1024px width) and verify 3-column grid in src/routes/SponsorSlots.svelte
- [X] T018 [US2] Adjust card padding/spacing if needed for mobile readability in src/routes/SponsorSlots.svelte
- [X] T019 [US2] Verify logo sizes remain proportional across breakpoints in src/routes/SponsorSlots.svelte
- [X] T020 [US2] Verify description text doesn't overflow containers on narrow screens in src/routes/SponsorSlots.svelte

**Checkpoint**: User Story 2 is complete - responsive layout works correctly on all device sizes (mobile/tablet/desktop)

---

## Phase 5: User Story 3 - Placeholder Content Management (Priority: P3)

**Goal**: Ensure placeholder content is clearly identifiable and structured for easy updates by administrators.

**Independent Test**: Open src/routes/SponsorSlots.svelte and locate the sponsors array. Verify each slot has clear labels ("Sponsor Slot 1", etc.) and descriptive placeholder text that makes it obvious what needs to be updated. Follow quickstart.md instructions to update one sponsor slot with real content.

### Implementation for User Story 3

- [X] T021 [US3] Add clear placeholder names ("Sponsor Slot 1" through "Sponsor Slot 5") in sponsors array in src/routes/SponsorSlots.svelte
- [X] T022 [US3] Add descriptive placeholder descriptions that explain what should be updated in sponsors array in src/routes/SponsorSlots.svelte
- [X] T023 [US3] Add inline code comments above sponsors array explaining update process in src/routes/SponsorSlots.svelte
- [X] T024 [US3] Verify placeholder content structure matches quickstart.md documentation
- [X] T025 [US3] Test updating one sponsor slot with real content (name, description, logo path) following quickstart.md steps
- [X] T026 [US3] Verify updated content displays correctly without breaking layout

**Checkpoint**: User Story 3 is complete - placeholder content is clearly structured and easy to update per quickstart.md guide

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, type checking, and cross-browser testing

- [X] T027 [P] Run TypeScript type checking with bun run check and fix any errors
- [X] T028 [P] Test in Chrome (latest) and verify all functionality
- [X] T029 [P] Test in Firefox (latest) and verify all functionality
- [X] T030 [P] Test in Safari (latest) and verify all functionality
- [X] T031 [P] Test in Edge (latest) and verify all functionality
- [X] T032 Verify no console errors or warnings in browser DevTools
- [X] T033 Verify sponsor slots don't have cursor-pointer or hover effects indicating interactivity
- [X] T034 Verify sponsor slots maintain consistent height across all 5 slots
- [X] T035 Verify page load performance remains unchanged (no additional delays)
- [X] T036 Run quickstart.md validation by following update steps with test sponsor data
- [X] T037 Verify AGENTS.md was updated with feature tech stack information

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no foundational phase needed
- **User Stories (Phase 3-5)**: Depend only on Setup completion
  - User Story 1 (Phase 3): Depends on Phase 1 (assets ready)
  - User Story 2 (Phase 4): Depends on Phase 3 (component exists to test responsiveness)
  - User Story 3 (Phase 5): Can technically run in parallel with Phase 4, but practically tests existing implementation
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - View Sponsor Listings**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P2) - Responsive Layout**: Depends on User Story 1 completion (needs component to exist) - Tests existing implementation
- **User Story 3 (P3) - Placeholder Content Management**: Depends on User Story 1 completion (needs component to exist) - Verifies content structure

### Within Each User Story

- User Story 1: Sequential tasks (T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010) to build component, then parallel testing tasks (T011, T012, T013, T014)
- User Story 2: All tasks (T015-T020) can run together as manual testing/verification tasks
- User Story 3: Sequential tasks to update placeholder content and verify against documentation

### Parallel Opportunities

- Phase 1 Setup: T001 and T002 can run in parallel (different asset operations)
- User Story 1 Testing: T011, T012, T013, T014 can be tested in parallel (different test scenarios)
- Polish Phase: T027, T028, T029, T030, T031 can run in parallel (independent browser tests)

---

## Parallel Example: User Story 1 Testing

```bash
# After T010 completes, launch all verification tests together:
# - T011: Verify 5 slots display correctly
# - T012: Test image fallback behavior
# - T013: Test text truncation
# - T014: Test logo cropping
# All test different aspects and can be verified independently
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (prepare assets) - ~10 minutes
2. Complete Phase 3: User Story 1 (build component) - ~2 hours
3. **STOP and VALIDATE**: Load main page and verify 5 sponsor slots display correctly
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Assets ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - core display functionality)
3. Add User Story 2 → Test independently → Deploy/Demo (enhanced responsive experience)
4. Add User Story 3 → Test independently → Deploy/Demo (improved maintainability)
5. Complete Polish → Final cross-browser testing → Production ready

### Sequential Development (Recommended)

Since this is a single UI component, sequential development is recommended:

1. Complete Setup (Phase 1)
2. Complete User Story 1 (Phase 3) - Core functionality
3. Complete User Story 2 (Phase 4) - Responsive refinement (builds on US1)
4. Complete User Story 3 (Phase 5) - Content management verification (uses US1 structure)
5. Complete Polish (Phase 6) - Final testing

**Time Estimate**: 3-4 hours total for all phases

---

## Notes

- [P] tasks = different files or independent operations, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after implementation
- No automated tests (manual visual testing per project standards)
- Type checking with `bun run check` ensures TypeScript compliance
- All image paths must start with `/img/` (relative to `/static/`)
- Sponsor slots must be non-interactive (FR-017, FR-018) - no click handlers or hover effects
- Exactly 5 sponsor slots required (FR-001, FR-015) - do not add or remove
- Component follows existing patterns from Featured.svelte (grid layout, inline data)
- Tailwind CSS classes handle all styling (no custom CSS needed)

---

## Task Summary

- **Total Tasks**: 37
- **Setup Phase**: 2 tasks
- **User Story 1 (P1 - MVP)**: 12 tasks (T003-T014) - Core display functionality
- **User Story 2 (P2)**: 6 tasks (T015-T020) - Responsive layout
- **User Story 3 (P3)**: 6 tasks (T021-T026) - Content management
- **Polish Phase**: 11 tasks (T027-T037) - Cross-cutting concerns

### Tasks by User Story

- **User Story 1**: 12 tasks (32% of total) - Highest priority, most complex
- **User Story 2**: 6 tasks (16% of total) - Testing/verification focused
- **User Story 3**: 6 tasks (16% of total) - Documentation/structure verification
- **Other**: 13 tasks (36% of total) - Setup + Polish

### Parallel Opportunities Identified

- Setup phase: 2 parallel tasks (T001, T002)
- User Story 1 testing: 4 parallel tasks (T011-T014)
- Polish phase: 5 parallel browser tests (T028-T031) + 1 parallel type check (T027)
- **Total parallelizable**: 12 tasks (32% of all tasks)

### Independent Test Criteria

- **User Story 1**: Load main page → 5 slots visible → logos square → text truncates at 3 lines → fallback works for broken images
- **User Story 2**: Resize browser → mobile shows 1 column → tablet shows 2 columns → desktop shows 3 columns → text remains readable at all sizes
- **User Story 3**: Open component file → placeholder content clearly labeled → follow quickstart.md → update one slot → verify display

### Suggested MVP Scope

**MVP = User Story 1 Only (12 tasks)**

Delivers core value:
- 5 sponsor slots display on main page
- Logo (1:1 aspect ratio) + title + description layout
- Image fallback handling
- Text truncation
- 1:1 aspect ratio enforcement

**Estimated MVP Time**: 2-3 hours

Why this is sufficient for MVP:
- FR-001 through FR-018 are mostly satisfied by US1
- Responsive layout (US2) works by default with Tailwind grid
- Placeholder content (US3) is structural verification, not user-facing value
- Can deploy and gather feedback immediately after US1

---

## Format Validation

✅ **All tasks follow required checklist format**:
- Checkbox: `- [ ]` (present in all tasks)
- Task ID: T001-T037 (sequential, present in all tasks)
- [P] marker: Present only for parallelizable tasks (T002, T027-T031)
- [Story] label: Present for all user story phase tasks (T003-T026)
- Description: Includes clear action and file path for implementation tasks
- File paths: Specified for all implementation tasks (src/routes/SponsorSlots.svelte, src/routes/+page.svelte, static/img/)

✅ **Task organization by user story**: Each phase clearly maps to user stories from spec.md (US1, US2, US3)

✅ **Independent test criteria**: Each user story phase includes clear test criteria and checkpoint

✅ **Dependency graph**: Clear phase and story dependencies documented

✅ **Parallel opportunities**: Identified and marked with [P] throughout
