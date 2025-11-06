<!--
Sync Impact Report:
Version Change: 2.0.0 → 2.0.1
Modified Principles: None (documentation refinement only)
Added Sections: None
Removed Sections: None
Templates requiring updates:
  ✅ Constitution updated and validated
  ✅ .specify/templates/plan-template.md - reviewed, contains "Performance Goals" as optional placeholder field (acceptable)
  ✅ .specify/templates/spec-template.md - reviewed, no constitutional conflicts
  ✅ .specify/templates/tasks-template.md - reviewed, contains "Performance optimization" as optional polish task (acceptable)
Follow-up TODOs:
  - Ratification date remains TODO pending maintainer confirmation of original adoption date
  - Consider establishing formal maintainer roster for governance transparency
-->

# Louper Constitution

## Metadata

**Project Name**: Louper (louper-v3)
**Version**: 2.0.1
**Ratified**: TODO(RATIFICATION_DATE): Awaiting confirmation from maintainers of original adoption date
**Last Amended**: 2025-11-06
**Maintainers**: Mark3 Labs team (see AUTHORS section in README.md)

## Core Principles

### I. Diamond Standard Compliance

Every feature and component MUST adhere to the EIP-2535 Diamond Standard specification. All facet operations (add, replace, remove) MUST maintain diamond proxy integrity. Contract interactions MUST respect the diamond's upgrade patterns and storage layout requirements to prevent storage collisions and ensure seamless upgradability.

**Rationale**: Louper exists specifically to inspect and manage EIP-2535 Diamond contracts. Deviation from the standard would compromise the tool's primary value proposition and could lead to incorrect contract introspection or unsafe upgrade operations.

**Verification**: All contract interaction code must be reviewed against the EIP-2535 specification. Integration tests must validate correct facet detection and upgrade pattern handling.

### II. Blockchain Agnostic Design

The codebase MUST support multiple EVM-compatible blockchains without requiring chain-specific modifications to core logic. Chain configurations SHALL be externalized and easily extensible. New chain support MUST be achievable through configuration alone, not code changes to the core inspection engine.

**Rationale**: The Diamond Standard is chain-agnostic. Hard-coding chain-specific logic fragments the codebase and creates maintenance burden as new EVM chains emerge. Configuration-driven design ensures scalability and reduces coupling.

**Verification**: Adding a new chain should require only configuration file updates. Core inspection logic must operate identically across all supported chains.

### III. Security-First Inspection

All contract interactions MUST be read-only by default. Write operations MUST require explicit user consent with clear warnings about state changes. Private keys and sensitive data MUST never be logged, stored, or transmitted without encryption. The tool MUST validate contract addresses and function selectors before any blockchain interaction.

**Rationale**: Louper handles user wallet interactions and contract state modifications. A single security flaw could lead to fund loss or unauthorized contract upgrades. Defense-in-depth and explicit consent protect users from both malicious contracts and user error.

**Verification**: Security audits must validate read-only defaults, consent flows for writes, and absence of key/sensitive data leakage. Penetration testing should cover address validation and injection attacks.

### IV. Developer Experience Excellence

The UI MUST provide clear, actionable feedback for all operations. Error messages SHALL include context and suggested remediation steps. Complex diamond structures MUST be visualized in an intuitive, navigable format. API responses MUST be consistent, well-documented, and versioned to prevent breaking changes for integrators.

**Rationale**: Diamond contracts are inherently complex. Poor UX creates adoption barriers and increases support burden. Clear feedback reduces user errors; consistent APIs enable ecosystem integration.

**Verification**: User testing should validate task completion rates. API changes require version bumps per semantic versioning. Documentation must include examples for all public APIs.

## Technical Standards

### Web Stack Requirements

- **Frontend**: SvelteKit with TypeScript for type safety and reactive UI
- **Runtime**: Bun for fast JavaScript execution and development experience
- **Blockchain**: Wagmi/Viem for reliable, type-safe Web3 interactions
- **Database**: Drizzle ORM with proper migration versioning for data persistence
- **Styling**: Component-based UI library (bits-ui) with consistent design system (Tailwind CSS)

**Stack Rationale**: This stack balances developer productivity (SvelteKit reactivity, Bun speed), type safety (TypeScript strict mode, Viem), and maintainability (Drizzle migrations, component library).

### Code Quality Standards

- TypeScript strict mode enabled across the codebase
- Comprehensive error handling with proper error boundaries
- Unit tests for utility functions and business logic
- Integration tests for critical user flows
- End-to-end tests for diamond interaction scenarios

**Quality Gates**: All PRs must pass linting, type checking, and existing tests. New features require corresponding test coverage. Breaking changes require major version bump.

## Development Workflow

### Contribution Process

1. All changes MUST originate from the `dev` branch
2. Feature branches SHALL follow naming convention: `feature/descriptive-name`
3. Pull requests MUST include:
   - Clear description of changes and motivation
   - Test coverage for new functionality
   - Documentation updates where applicable
   - Screenshots for UI changes

**Branch Strategy**: The `dev` branch serves as integration point; `main` reflects production-ready state. Feature branches isolate work-in-progress.

### Code Review Requirements

- Minimum one approval required before merge
- Automated CI checks MUST pass (linting, tests, build)
- Security vulnerabilities MUST be addressed before approval
- Constitutional compliance MUST be verified (reviewer responsibility)

**Review Focus**: Reviewers must check for principle violations (especially Security-First and Diamond Standard Compliance), code quality, and test adequacy.

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. Any deviation from these principles MUST be explicitly justified and documented in the relevant PR or issue. Amendments require consensus from maintainers with clear migration plans for existing code that violates new principles.

### Amendment Process

1. Proposed changes MUST be discussed in a GitHub issue first with `constitution` label
2. Constitutional changes require 2/3 maintainer approval (minimum 2 maintainers)
3. Version bumps follow semantic versioning:
   - **MAJOR**: Removing or fundamentally changing core principles (backward incompatible)
   - **MINOR**: Adding new principles or expanding governance sections
   - **PATCH**: Clarifications, wording improvements, non-semantic refinements
4. Amendment PRs must update the Sync Impact Report and propagate changes to dependent templates

### Compliance Verification

- All pull requests MUST be reviewed for constitutional compliance
- Quarterly audits SHALL assess adherence to principles across the codebase
- Violations MUST be tracked in GitHub issues with `constitution-violation` label
- Critical violations (security, diamond standard) MUST be remediated before next release
- Non-critical violations MUST be remediated within one release cycle

### Enforcement

Non-compliance does not invalidate merged code but triggers remediation process. Repeated violations by contributors may result in increased review scrutiny. Security principle violations may trigger emergency patches outside normal release cycle.

---

**Document Status**: ACTIVE | **Next Review**: 2026-02-06 (quarterly)
