# SkillSwap Coding Rules

> Version: 1.0.0

---

# Purpose

This document defines the coding standards and development rules for the SkillSwap project.

All generated code should follow these rules unless explicitly instructed otherwise.

---

# General Principles

- Write clean, readable, and maintainable code.
- Follow Laravel best practices.
- Follow PSR-12 coding standards.
- Prioritize simplicity over cleverness.
- Avoid premature optimization.
- Never duplicate business logic.
- Keep functions and classes focused on a single responsibility.

---

# Laravel Standards

Always follow Laravel conventions.

Prefer built-in Laravel features over custom implementations.

Use:

- Eloquent ORM
- Route Model Binding
- Form Requests
- API Resources
- Policies
- Events (when appropriate)
- Queues (when appropriate)

Avoid reinventing existing Laravel features.

---

# Folder Structure

Follow the standard Laravel directory structure.

Example:

app/

- Http/
- Models/
- Policies/
- Providers/
- Services/

database/

- migrations/
- seeders/
- factories/

routes/

- api.php
- web.php

docs/

- PLANNING.md
- FEATURES.md
- DATABASE.md
- API.md
- ROADMAP.md

.ai/

- SKILL.md
- CODING_RULES.md
- WORKFLOW.md

---

# Controllers

Controllers should remain thin.

Controllers should only:

- Receive requests
- Validate input (via Form Requests)
- Call business logic
- Return API Resources

Do not place business logic inside controllers.

---

# Business Logic

Business logic belongs in Service classes.

Services should contain reusable application logic.

Avoid duplicating logic across controllers.

---

# Models

Models should:

- Define relationships
- Define casts
- Define scopes
- Define accessors and mutators when necessary

Avoid placing complex business logic inside models.

---

# Validation

Always validate incoming requests using Form Request classes.

Never validate directly inside controllers unless explicitly requested.

Return meaningful validation errors.

---

# Database

Always follow:

docs/DATABASE.md

Do not:

- Rename columns
- Rename tables
- Invent relationships
- Skip foreign keys

Use migrations for all schema changes.

Never modify the database manually.

---

# API

Always follow:

docs/API.md

Rules:

- RESTful endpoints
- JSON responses
- Proper HTTP status codes
- Consistent response structure

Do not create undocumented endpoints.

---

# Authentication

Use Laravel Sanctum.

Never create custom authentication unless requested.

Protect authenticated routes using middleware.

---

# Authorization

Use Laravel Policies when authorization is required.

Do not hardcode authorization checks.

---

# Eloquent

Prefer Eloquent over raw SQL.

Use relationships whenever possible.

Avoid N+1 query problems by eager loading relationships.

Use transactions when multiple database operations must succeed together.

---

# Naming Conventions

Classes

- PascalCase

Example:

- UserService
- ExchangeRequestController

Methods

- camelCase

Example:

- createExchangeRequest()
- updateProfile()

Variables

- camelCase

Example:

- $currentUser
- $exchangeRequest

Database Tables

- snake_case
- plural

Example:

- users
- learning_sessions

Database Columns

- snake_case

Example:

- first_name
- created_at

API Endpoints

- kebab-case

Example:

- /exchange-requests
- /learning-sessions

---

# Error Handling

Return meaningful error messages.

Do not expose stack traces.

Use appropriate HTTP status codes.

Handle exceptions gracefully.

---

# Responses

Every API response should follow the standard response format defined in:

docs/API.md

Keep response structures consistent across all endpoints.

---

# Security

Always:

- Hash passwords
- Validate user input
- Authorize protected actions
- Prevent mass assignment
- Use CSRF protection where applicable
- Never expose sensitive information

---

# Performance

Optimize database queries.

Use eager loading when appropriate.

Avoid unnecessary database calls.

Paginate large collections.

---

# Code Quality

Write self-explanatory code.

Avoid unnecessary comments.

Use descriptive names for variables, methods, and classes.

Refactor duplicated logic.

---

# Testing

When generating features, also generate:

- Feature Tests
- Unit Tests (when appropriate)

Tests should cover both successful and failed scenarios.

---

# Documentation

If new endpoints, tables, or features are added, update the appropriate documentation:

- DATABASE.md
- API.md
- FEATURES.md
- ROADMAP.md

Keep documentation synchronized with the codebase.

---

# AI Expectations

Before generating code:

- Read the project documentation.
- Reuse existing code whenever possible.
- Follow existing project patterns.
- Do not introduce unnecessary dependencies.
- Generate complete production-ready implementations.
- Explain important architectural decisions when necessary.

The goal is to produce code that is clean, maintainable, and consistent throughout the project.
