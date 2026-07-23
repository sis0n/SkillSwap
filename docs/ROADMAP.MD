# SkillSwap Roadmap

> Version: 1.0.0
> Current Phase: MVP
> Status: In Development

---

# Project Goal

Build a Minimum Viable Product (MVP) that allows users to exchange skills with each other through a structured learning platform.

The MVP focuses on validating the core idea before introducing advanced features such as AI matching, skill credits, and video calls.

---

# Development Principles

- Build one feature at a time.
- Complete backend before polishing the frontend.
- Ship working software frequently.
- Prioritize simplicity over complexity.
- Keep the codebase maintainable.

---

# MVP Milestones

## Phase 1 — Project Foundation

### Goal

Prepare the development environment and project architecture.

### Tasks

- [x] Setup Laravel project
- [x] Configure PostgreSQL (Docker)
- [x] Configure Docker
- [x] Setup environment variables
- [ ] Configure authentication
- [x] Create project structure
- [x] Create documentation

### Deliverables

- Working Laravel project
- Database connection
- Docker environment
- Initial Git repository

---

## Phase 2 — Database

### Goal

Build the complete database structure.

### Tasks

- [x] Create users table
- [x] Create profiles table
- [x] Create user_availability table
- [x] Create skill_categories table
- [x] Create skills table
- [x] Create user_skills table
- [x] Create exchange_requests table
- [x] Create conversations table
- [x] Create messages table
- [x] Create learning_sessions table
- [x] Create session_resources table
- [x] Create reviews table

### Deliverables

- ✅ Complete migrations
- ✅ Foreign keys
- ✅ Indexes
- [ ] Seeders

---

## Phase 3 — Authentication

### Goal

Allow users to securely create and access accounts.

### Features

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Email Verification
- [ ] Current User Endpoint

### Deliverables

- Laravel Sanctum
- Authentication middleware
- Protected routes

---

## Phase 4 — User Profiles

### Goal

Allow users to manage their public profiles.

### Features

- [ ] View profile
- [ ] Edit profile
- [ ] Upload avatar
- [ ] Availability
- [ ] Experience level
- [ ] Bio
- [ ] Location

### Deliverables

- Public profiles
- Profile editing
- Avatar upload

---

## Phase 5 — Skills

### Goal

Allow users to showcase what they can teach and what they want to learn.

### Features

- [ ] Browse categories
- [ ] Browse skills
- [ ] Add teaching skill
- [ ] Add learning skill
- [ ] Update skill
- [ ] Delete skill

### Deliverables

- Skill management
- User skill portfolio

---

## Phase 6 — Marketplace

### Goal

Allow users to discover potential learning partners.

### Features

- [ ] Browse users
- [ ] Search users
- [ ] Filter by category
- [ ] Filter by skill
- [ ] Filter by experience

### Deliverables

- Marketplace page
- Search functionality

---

## Phase 7 — Exchange Requests

### Goal

Allow users to request skill exchanges.

### Features

- [ ] Send request
- [ ] Accept request
- [ ] Decline request
- [ ] Cancel request

### Deliverables

- Request workflow
- Request history

---

## Phase 8 — Messaging

### Goal

Enable communication between matched users.

### Features

- [ ] Conversations
- [ ] Send messages
- [ ] View message history

### Deliverables

- Private messaging

---

## Phase 9 — Learning Sessions

### Goal

Schedule and manage learning sessions.

### Features

- [ ] Schedule session
- [ ] Edit session
- [ ] Cancel session
- [ ] Complete session

### Deliverables

- Session management

---

## Phase 10 — Reviews

### Goal

Allow users to rate each other after completing sessions.

### Features

- [ ] Leave rating
- [ ] Write review
- [ ] View reviews

### Deliverables

- Rating system
- User reputation

---

## Phase 11 — Testing

### Goal

Ensure the application is stable.

### Tasks

- [ ] Unit Tests
- [ ] Feature Tests
- [ ] API Testing
- [ ] Manual Testing
- [ ] Bug Fixes

---

## Phase 12 — Deployment

### Goal

Deploy the MVP for public access.

### Backend

- [ ] Production environment
- [ ] Environment variables
- [ ] Database migration
- [ ] Storage configuration

### Frontend

- [ ] Deploy to Vercel

### Database

- [ ] Configure Supabase
- [ ] Backup strategy

---

# MVP Success Criteria

The MVP is considered complete when users can:

- [ ] Register an account
- [ ] Login
- [ ] Create a profile
- [ ] Add teaching skills
- [ ] Add learning skills
- [ ] Browse other users
- [ ] Search for skills
- [ ] Send exchange requests
- [ ] Accept exchange requests
- [ ] Chat with matched users
- [ ] Schedule learning sessions
- [ ] Complete learning sessions
- [ ] Leave reviews

---

# Future Roadmap

The following features are intentionally excluded from the MVP.

## Phase 2

- AI Matching
- Skill Recommendations
- Smart Search
- Notifications

---

## Phase 3

- Skill Credits
- Learning Roadmaps
- Certificates
- Skill Verification

---

## Phase 4

- Video Calling
- Group Learning
- Mobile Application
- Admin Dashboard
- Analytics

---

# Current Status

| Module               | Status         |
| -------------------- | -------------- |
| Planning             | ✅ Complete    |
| Features             | ✅ Complete    |
| Database Design      | ✅ Complete    |
| API Design           | ✅ Complete    |
| Project Setup        | ✅ Complete    |
| Backend Development  | ⏳ Phase 2 Done |
| Frontend Development | ⏳ Pending     |
| Testing              | ⏳ Pending     |
| Deployment           | ⏳ Pending     |

---

# Notes

This roadmap focuses only on the MVP.

Additional features will be planned after validating the product with real users.
