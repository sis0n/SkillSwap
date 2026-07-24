# SkillSwap AI Context

> Version: 2.0.0

---

# Purpose

This document provides the overall context for the SkillSwap project.

It defines the project's vision, architecture, technology stack, documentation, and development philosophy.

This document should be read before generating any code.

---

# Project Overview

SkillSwap is a peer-to-peer learning platform where users exchange knowledge instead of paying for courses.

Users can teach the skills they already know while learning new skills from other members of the community.

Example:

- User A teaches Programming.
- User B teaches Guitar.
- They exchange learning sessions.

The initial goal is to build a production-ready Minimum Viable Product (MVP).

---

# Vision

Build a modern platform where anyone can learn by teaching others.

---

# Mission

Create an accessible platform that allows people to exchange knowledge through collaboration instead of traditional paid learning.

---

# Target Users

Primary users include:

- College students
- Self-learners
- Professionals
- Freelancers
- Hobbyists
- Lifelong learners

---

# Project Goals

The project should be:

- Production-ready
- Scalable
- Maintainable
- Secure
- Well documented
- Easy to extend

The MVP should provide a complete experience for discovering users, exchanging skills, communicating, scheduling sessions, and reviewing completed exchanges.

---

# MVP Modules

The MVP consists of the following modules:

- Authentication
- User Profiles
- Skill Categories
- Skills
- User Skills
- Marketplace
- Exchange Requests
- Conversations
- Messaging
- Learning Sessions
- Reviews and Ratings
- Dashboard
- Settings

Future features are intentionally excluded unless explicitly requested.

---

# Technology Stack

## Backend

- Laravel 12
- PHP 8+
- Laravel Sanctum
- REST API

## Database

- PostgreSQL
- Supabase

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Development

- Docker

## Deployment

Frontend

- Vercel

Backend

- To be decided

Database

- Supabase PostgreSQL

---

# Application Architecture

The application consists of three layers.

Presentation Layer

- React
- TypeScript
- Tailwind CSS

Application Layer

- Laravel REST API

Data Layer

- PostgreSQL (Supabase)

All communication must go through the Laravel API.

The frontend must never communicate directly with the database.

Business logic belongs in the backend.

---

# Documentation

The following documents define the project and are considered the source of truth.

## Project Documentation

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/UI.md
- docs/DESIGN_SYSTEM.md
- docs/ROADMAP.md

## AI Documentation

- .ai/SKILL.md
- .ai/CODING_RULES.md
- .ai/WORKFLOW.md
- .ai/PROMPT.md

Always consult the appropriate documentation before implementing a feature.

Never generate code that contradicts the documentation.

---

# Development Philosophy

Always prioritize:

- Simplicity
- Readability
- Maintainability
- Scalability
- Reusability
- Security

Avoid:

- Duplicate logic
- Overengineering
- Premature optimization
- Unnecessary dependencies

Only build features that belong to the current development phase.

---

# Database Philosophy

The database is normalized and designed for scalability.

Guidelines:

- Authentication data belongs in the users table.
- Public profile information belongs in the profiles table.
- Skills belong to the platform.
- User skills belong to individual users.
- Relationships must always follow DATABASE.md.
- Never invent tables or relationships.

---

# API Philosophy

The backend follows RESTful API principles.

Requirements:

- Use `/api/v1`.
- Return JSON responses.
- Use appropriate HTTP status codes.
- Authenticate using Laravel Sanctum.
- Follow API.md.

Do not create undocumented endpoints unless explicitly instructed.

---

# User Interface Philosophy

The interface should be:

- Clean
- Modern
- Responsive
- Accessible
- Component-driven
- Easy to navigate

Always follow:

- docs/UI.md
- docs/DESIGN_SYSTEM.md

Do not invent pages, layouts, or components outside the documented scope.

---

# Design Philosophy

The application should maintain a consistent visual language.

Principles:

- Mobile-first responsive design
- Reusable components
- Consistent spacing
- Consistent typography
- Light and Dark mode support
- Accessibility
- Minimal visual clutter

Always follow the design system.

---

# Security Philosophy

Always consider security.

Requirements include:

- Password hashing
- Authentication
- Authorization
- Request validation
- Protection against mass assignment
- Secure API responses
- Sensitive data protection

Never sacrifice security for convenience.

---

# AI Responsibilities

When working on this project, act as:

- Senior Laravel Developer
- Backend Architect
- Frontend Architect
- Database Designer
- API Designer
- UI Engineer
- Code Reviewer

Generate production-ready implementations that follow the project's documentation and architecture.

---

# Current Project Status

Completed documentation:

- PLANNING.md
- FEATURES.md
- DATABASE.md
- API.md
- UI.md
- DESIGN_SYSTEM.md
- ROADMAP.md

Completed AI documentation:

- SKILL.md
- CODING_RULES.md
- WORKFLOW.md
- PROMPT.md

Current focus:

- Backend development
- Database implementation
- Laravel API development

Always follow the current phase defined in `.ai/PROMPT.md`.

---

# Source of Truth

When multiple sources exist, use the following priority:

1. User instructions
2. .ai/PROMPT.md
3. .ai/CODING_RULES.md
4. .ai/WORKFLOW.md
5. Project documentation in the docs folder
6. Existing project code

If documentation conflicts with the implementation, stop and explain the inconsistency instead of making assumptions.

---

# Project Goal

The objective is not only to build a working application.

The objective is to build a professional, scalable, secure, maintainable, and production-ready platform that can continue evolving well beyond the MVP.