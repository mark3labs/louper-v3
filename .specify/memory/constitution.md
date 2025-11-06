<!-- 
Sync Impact Report:
Version Change: 1.0.0 → 2.0.0 (Removed Performance and Scalability principle)
Modified Principles: Removed Principle V (Performance and Scalability)
Added Sections: None
Removed Sections: Core Principle V, performance references in Code Review Requirements
Templates requiring updates: 
  ✅ Constitution updated
  ⚠ .specify/templates/plan-template.md (pending review - remove performance checks)
  ⚠ .specify/templates/spec-template.md (pending review - remove performance requirements)
  ⚠ .specify/templates/tasks-template.md (pending review - remove performance tasks)
Follow-up TODOs: 
  - Update all active specs to remove performance requirements
  - Review templates for performance-related content
-->

# Louper Constitution

## Core Principles

### I. Diamond Standard Compliance
Every feature and component MUST adhere to the EIP-2535 Diamond Standard 
specification. All facet operations (add, replace, remove) MUST maintain 
diamond proxy integrity. Contract interactions MUST respect the diamond's 
upgrade patterns and storage layout requirements to prevent storage 
collisions and ensure seamless upgradability.

### II. Blockchain Agnostic Design
The codebase MUST support multiple EVM-compatible blockchains without 
requiring chain-specific modifications to core logic. Chain configurations 
SHALL be externalized and easily extensible. New chain support MUST be 
achievable through configuration alone, not code changes to the core 
inspection engine.

### III. Security-First Inspection
All contract interactions MUST be read-only by default. Write operations 
MUST require explicit user consent with clear warnings about state changes. 
Private keys and sensitive data MUST never be logged, stored, or transmitted 
without encryption. The tool MUST validate contract addresses and function 
selectors before any blockchain interaction.

### IV. Developer Experience Excellence
The UI MUST provide clear, actionable feedback for all operations. Error 
messages SHALL include context and suggested remediation steps. Complex 
diamond structures MUST be visualized in an intuitive, navigable format. 
API responses MUST be consistent, well-documented, and versioned to prevent 
breaking changes for integrators.

## Technical Standards

### Web Stack Requirements
- Frontend: SvelteKit with TypeScript for type safety
- Runtime: Bun for JavaScript execution
- Blockchain: Wagmi/Viem for reliable Web3 interactions
- Database: Drizzle ORM with proper migrations
- Styling: Component-based UI with consistent design system

### Code Quality Standards
- TypeScript strict mode enabled across the codebase
- Comprehensive error handling with proper error boundaries
- Unit tests for utility functions and business logic
- Integration tests for critical user flows
- E2E tests for diamond interaction scenarios

## Development Workflow

### Contribution Process
1. All changes MUST originate from the `dev` branch
2. Feature branches SHALL follow naming convention: `feature/descriptive-name`
3. Pull requests MUST include:
   - Clear description of changes and motivation
   - Test coverage for new functionality
   - Documentation updates where applicable
   - Screenshots for UI changes

### Code Review Requirements
- Minimum one approval required before merge
- Automated CI checks MUST pass (linting, tests, build)
- Security vulnerabilities MUST be addressed before approval

## Governance

### Constitution Authority
This constitution supersedes all other development practices and guidelines. 
Any deviation from these principles MUST be explicitly justified and 
documented. Amendments require consensus from maintainers with clear 
migration plans for existing code.

### Amendment Process
1. Proposed changes MUST be discussed in a GitHub issue first
2. Constitutional changes require 2/3 maintainer approval
3. Version bumps follow semantic versioning:
   - MAJOR: Removing or fundamentally changing principles
   - MINOR: Adding new principles or sections
   - PATCH: Clarifications and non-semantic improvements

### Compliance Verification
- All pull requests MUST be reviewed for constitutional compliance
- Quarterly audits SHALL assess adherence to principles
- Violations MUST be tracked and remediated within one release cycle

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Awaiting confirmation from maintainers | **Last Amended**: 2025-11-06