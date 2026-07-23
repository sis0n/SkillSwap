# SkillSwap AI Context

> Version: 1.0.0

---

# Project Overview

SkillSwap is a peer-to-peer learning platform where users exchange skills instead of paying money.

Example exchanges:

- Programming ↔ Guitar
- Photoshop ↔ English
- Cooking ↔ Mathematics

The objective is to create a platform where people can teach what they know while learning new skills from others.

The current development goal is to build a Minimum Viable Product (MVP).

---

# Vision

Build a platform where anyone can learn by teaching.

---

# Mission

Make skill sharing accessible to everyone through a fair exchange system instead of traditional paid courses.

---

# Target Users

The primary users of SkillSwap include:

- College students
- Self-learners
- Professionals
- Freelancers
- Hobbyists

---

# MVP Features

The MVP focuses only on the following modules:

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
- Reviews

Future features are intentionally excluded unless explicitly requested.

---

# Technology Stack

## Backend

- Laravel 12
- PHP 8+
- REST API
- Laravel Sanctum

## Database

- PostgreSQL
- Supabase

## Frontend

- React
- TypeScript
- Vite

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

# Project Architecture

The application consists of three major parts:

- React frontend
- Laravel REST API
- PostgreSQL database hosted on Supabase

The frontend must never communicate directly with the database.

All requests should go through the Laravel API.

---

# Documentation

The following documents define the project.

Always use them as the primary source of truth.

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/ROADMAP.md

Never generate code that contradicts these documents.

---

# Database Philosophy

Authentication data and public profile data are separated.

Authentication belongs to:

- users

Public profile information belongs to:

- profiles

User skills belong to the authenticated user.

Master skills belong to the platform.

Always follow the relationships defined in `DATABASE.md`.

---

# API Philosophy

The backend follows REST principles.

Rules:

- Use `/api/v1`
- Return JSON responses
- Use Laravel Sanctum for authentication
- Follow the endpoint definitions in `API.md`
- Use proper HTTP status codes

Do not invent undocumented endpoints unless explicitly instructed.

---

# Development Philosophy

The project should prioritize:

- Simplicity
- Readability
- Maintainability
- Scalability

Avoid unnecessary abstractions.

Avoid overengineering.

Build only what is needed for the MVP.

---

# Current Project Status

Completed documentation:

- PLANNING.md
- FEATURES.md
- DATABASE.md
- API.md
- ROADMAP.md

The next step is implementing the Laravel backend according to these documents.

---

# AI Role

When working on this project, act as:

- Senior Laravel Developer
- Backend Architect
- Database Designer
- API Designer
- Code Reviewer

Generate production-ready code that follows the project's architecture and documentation.

---

# Project Goal

The objective is not only to build a working application.

The objective is to build a clean, scalable, maintainable, and production-ready platform that can continue growing after the MVP.