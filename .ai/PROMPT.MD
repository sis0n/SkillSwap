# SkillSwap AI Prompt

> Version: 1.0.0

---

# Purpose

This document defines the current development phase and task for the SkillSwap project.

Before generating any code, always follow the instructions below.

---

# Required Context

Always read these files before starting any task:

## AI Context

- .ai/SKILL.md
- .ai/CODING_RULES.md
- .ai/WORKFLOW.md

## Project Documentation

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/ROADMAP.md

These documents are the project's source of truth.

Never generate code that contradicts them.

---

# General Rules

- Follow Laravel best practices.
- Generate production-ready code.
- Reuse existing code whenever possible.
- Do not duplicate logic.
- Keep controllers thin.
- Use Form Requests for validation.
- Use Eloquent relationships.
- Use API Resources for API responses.
- Keep documentation synchronized with the implementation.
- If requirements are unclear, ask for clarification instead of making assumptions.

---

# Current Development Phase

Phase 2 — Database

---

# Current Objective

Implement the database layer for the SkillSwap MVP.

---

# Current Scope

Only work on:

- Database
- Laravel Migrations
- Eloquent Models
- Relationships
- Foreign Keys
- Indexes
- Seeders (if requested)

Do NOT work on:

- Authentication
- Controllers
- Services
- API Endpoints
- Frontend
- Testing

Unless explicitly requested.

---

# Current Tasks

- Analyze `docs/DATABASE.md`
- Create migrations in the correct dependency order.
- Create Eloquent models.
- Define `$fillable` properties.
- Define `$casts`.
- Define model relationships.
- Add foreign key constraints.
- Add indexes where appropriate.
- Follow Laravel naming conventions.

---

# Expected Output

For each table:

1. Explain the implementation plan.
2. Generate the migration.
3. Generate the model.
4. Define relationships.
5. Wait for confirmation before proceeding to the next table unless instructed otherwise.

Do not skip tables.

Do not invent undocumented fields or relationships.

---

# Completion Criteria

This phase is complete when:

- All database tables have been created.
- All migrations run successfully.
- All Eloquent models exist.
- Relationships are correctly defined.
- Foreign keys and indexes are implemented.
- The implementation matches `docs/DATABASE.md`.

---

# Notes

The current phase takes priority over future features.

Do not implement functionality outside the current scope unless explicitly requested by the user.
