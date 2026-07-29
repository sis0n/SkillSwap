# SkillSwap

> Version: 1.0.0
> Status: Planning

---

# Overview

SkillSwap is a peer-to-peer learning platform where users exchange skills instead of paying for courses.

Instead of spending money on expensive online learning platforms, users can teach skills they already know in exchange for learning skills they want.

Every user can become both a teacher and a learner.

Example:

- Teach Photoshop → Learn Programming
- Teach Guitar → Learn English
- Teach Cooking → Learn Graphic Design

SkillSwap aims to make education more accessible through community-driven knowledge sharing.

---

# Vision

To become the leading platform for peer-to-peer skill exchange, making learning accessible to everyone regardless of financial status.

---

# Mission

Create a platform where knowledge becomes a valuable resource that anyone can exchange, allowing people to continuously learn, teach, and grow together.

---

# Problem Statement

Many people want to learn new skills but face common challenges:

- Online courses are expensive.
- Professional mentors are difficult to find.
- Existing communities are unorganized.
- Social media groups have no structured matching system.
- Many talented individuals have knowledge to share but no platform dedicated to exchanging skills.

Current platforms focus on selling education rather than enabling people to exchange knowledge.

---

# Proposed Solution

SkillSwap provides a platform where users can:

- Create a personal profile.
- List skills they can teach.
- List skills they want to learn.
- Discover compatible learning partners.
- Schedule learning sessions.
- Communicate through direct messaging.
- Review completed learning sessions.

The platform connects people with complementary skills and helps them build long-term learning relationships.

---

# Target Audience

## Primary Users

- College students
- Senior High School students
- Fresh graduates
- Freelancers

## Secondary Users

- Professionals
- Career shifters
- Hobbyists
- Lifelong learners

---

# Value Proposition

SkillSwap allows people to learn without purchasing expensive courses by exchanging knowledge with others.

Instead of being only a student or only a teacher, every user can become both.

---

# Project Goals

## Primary Goal

Build a scalable platform that enables people to exchange skills through structured learning sessions.

## Secondary Goals

- Build a reliable matching system.
- Encourage community-driven learning.
- Create a trustworthy reputation system.
- Support long-term user engagement.

---

# MVP Scope

The first version of SkillSwap will focus on the following features.

## Authentication

- User registration
- User login
- User logout
- Email verification
- Password reset

---

## User Profiles

Users can:

- Edit profile
- Upload profile picture
- Write a short biography
- Add skills they can teach
- Add skills they want to learn
- Set their availability

---

## Discover

Users can:

- Browse available skills
- Search skills
- Discover users
- Filter by skill category

---

## Matching

Users can:

- Find compatible learning partners
- Send match requests
- Accept match requests
- Reject match requests

---

## Messaging

Matched users can:

- Send messages
- Receive messages
- View conversation history

---

## Learning Sessions

Matched users can:

- Schedule sessions
- Accept schedules
- Complete sessions
- Cancel sessions

---

## Reviews

After every completed learning session, users can:

- Rate each other
- Leave written feedback

---

## Dashboard

Each user has a dashboard displaying:

- Active matches
- Upcoming sessions
- Recent messages
- Learning activity

---

# Out of Scope (Version 1)

The following features are intentionally excluded from the MVP.

- AI Matching
- Skill Credits
- Video Calling
- Certificates
- Mobile Application
- Group Learning
- Notifications
- Calendar Integration
- AI Learning Roadmaps
- Skill Verification
- Public Community Forums

These features may be introduced in future releases.

---

# Tech Stack

## Backend

- Laravel 12
- PHP 8.4+
- REST API
- Laravel Sanctum

---

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Axios

---

## Database

- PostgreSQL
- Supabase

---

## Local Development

- Docker

---

## Deployment

### Frontend

- Vercel

### Backend

- Railway

### Database

- Supabase

---

# Project Architecture

The project follows a decoupled architecture.

```
Next.js Frontend
        │
        ▼
Laravel REST API
        │
        ▼
PostgreSQL (Supabase)
```

The frontend and backend are developed independently and communicate through RESTful APIs.

---

# Design Principles

The project should follow these principles:

- Simple and intuitive user experience.
- Mobile-first responsive design.
- RESTful API architecture.
- Secure authentication.
- Scalable project structure.
- Clean and maintainable code.
- Separation of concerns.
- Consistent UI components.
- Performance-oriented development.

---

# Success Criteria

The MVP will be considered successful if users can:

- Create an account.
- Build a complete profile.
- Add teaching and learning skills.
- Find compatible users.
- Exchange messages.
- Schedule learning sessions.
- Complete sessions.
- Leave reviews.

---

# Future Vision

Future versions of SkillSwap may include:

- AI-powered user matching.
- Skill Credit economy.
- Built-in video calls.
- Learning certificates.
- AI-generated learning roadmaps.
- Mentor verification.
- Team learning spaces.
- Mobile applications.
- University partnerships.
- Corporate learning communities.

---

# Development Philosophy

The project should prioritize:

1. Simplicity over complexity.
2. A stable MVP before adding advanced features.
3. Clean architecture.
4. Maintainable code.
5. Excellent user experience.
6. Scalability for future growth.

The goal is to validate the core idea first before expanding into more advanced functionality.
