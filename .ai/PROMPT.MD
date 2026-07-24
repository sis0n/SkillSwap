# SkillSwap AI Prompt

> Version: 2.0.0

---

# Purpose

This document defines the current development phase, implementation scope, and active tasks for the SkillSwap project.

Before generating any code, always read this document together with the project documentation.

---

# Required Context

Always read these files before starting any task.

## AI Context

- .ai/SKILL.md
- .ai/CODING_RULES.md
- .ai/WORKFLOW.md
- .ai/PROMPT.md

## Project Documentation

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/UI.md
- docs/DESIGN_SYSTEM.md
- docs/ROADMAP.md

These documents are the project's source of truth.

Never generate code that contradicts them.

---

# General Rules

Always:

- Follow the current roadmap phase.
- Follow Laravel best practices.
- Follow React and TypeScript best practices.
- Generate production-ready code.
- Reuse existing code whenever possible.
- Keep documentation synchronized with implementation.
- Ask for clarification if requirements are unclear.

Never:

- Skip roadmap tasks.
- Implement future phases.
- Invent undocumented features.
- Invent undocumented API endpoints.
- Invent undocumented database tables.
- Invent undocumented UI pages.

---

# Current Development Phase

Phase 4 — User Profiles

---

# Current Objective

Implement the complete User Profiles module for the MVP.

---

# Current Scope

## Backend

- Profile API
- Update profile
- Avatar upload
- Availability
- Experience level
- Location

## Frontend

- Profile page
- Edit profile page
- Avatar component
- Availability component
- Responsive layout
- Light mode
- Dark mode

## Documentation

Update when necessary:

- API.md
- FEATURES.md
- UI.md
- DESIGN_SYSTEM.md
- ROADMAP.md

## Excluded

Do not implement:

- Skills
- Marketplace
- Exchange Requests
- Messaging
- Learning Sessions
- Reviews

Unless explicitly requested.

---

# Current Tasks

Complete every unfinished task for the current roadmap phase.

Before implementing:

1. Read the relevant documentation.
2. Review existing code.
3. Identify affected files.
4. Explain the implementation plan.

During implementation:

- Generate complete backend code.
- Generate complete frontend code.
- Keep the implementation consistent with the documentation.

After implementation:

- Summarize the completed work.
- List modified files.
- Mention documentation updates.
- Wait for user approval before continuing.

---

# Completion Criteria

The current phase is complete when:

Backend

- All backend tasks are finished.

Frontend

- All frontend tasks are finished.

Documentation

- Documentation is synchronized.

Testing

- Required tests have been added when applicable.

The implementation must match:

- DATABASE.md
- API.md
- UI.md
- DESIGN_SYSTEM.md
- ROADMAP.md

---

# Notes

Only implement the current roadmap phase.

Do not move to the next phase until the user explicitly approves.

When the current phase changes, update only the following sections:

- Current Development Phase
- Current Objective
- Current Scope
- Current Tasks

The rest of this document should remain unchanged throughout the project.
