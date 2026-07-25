# SkillSwap Features

> Version: 1.0.0

---

# Feature List

## MVP Features

- Authentication
- User Profiles
- Skill Management
- Skill Marketplace
- Matching System
- Messaging
- Learning Sessions
- Reviews & Ratings
- Dashboard
- Settings

---

# Authentication

## Description

Provides secure user authentication and account management.

### Features

- Register
- Login
- Logout
- Email Verification (6-digit code)

### User Story

As a new user,

I want to create an account,

So that I can use SkillSwap.

---

### Email Verification Flow

#### After Registration

1. User registers successfully. A 6-digit verification code is sent to their email.
2. User verifies their email using the code.
3. User can now log in with their credentials.

#### Verification Code

- 6 numeric digits.
- Randomly generated.
- Single use only.
- Expires after 10 minutes.
- New code invalidates any previous code.

#### Resend

- Available after 60-second cooldown.
- Generates a new code.
- Invalidates the previous code.
- Restarts the 10-minute timer.

#### Login Before Verification

- Unverified users are blocked from logging in (403 Forbidden).
- Verification must be completed before the first login.
- This ensures email ownership and prevents account squatting.

---

# User Profiles

## Description

Every user has a public profile containing personal information and learning preferences.

### Features

- Upload profile picture
- Edit profile
- Update bio
- Set availability
- Set experience level
- View public profiles

### Profile Information

- Name
- Username
- Email
- Bio
- Avatar
- Experience Level
- Availability
- Joined Date

### User Story

As a learner,

I want people to know what skills I have,

So they can decide whether to learn from me.

---

# Skill Management

## Description

Users can manage the skills they can teach and the skills they want to learn.

### Features

- Add teaching skills
- Add learning skills
- Remove skills
- Search skills
- Browse skill categories

### Skill Categories

- Programming
- Design
- Music
- Languages
- Photography
- Business
- Marketing
- Writing
- Video Editing
- Cooking
- Other

### User Story

As a user,

I want to add my skills,

So others can discover me.

---

# Skill Marketplace

## Description

The marketplace allows users to browse available teachers and learners.

### Features

- Browse users
- Search by skill
- Filter by category
- View user profile
- View skill information

### Search Filters

- Skill
- Category
- Experience Level

### User Story

As a learner,

I want to find people who can teach me,

So I can request a skill exchange.

---

# Matching System

## Description

Users can connect with compatible learning partners.

### Features

- Send match request
- Accept request
- Reject request
- Cancel request
- View active matches

### Match Status

- Pending
- Accepted
- Rejected
- Cancelled
- Completed

### User Story

As a user,

I want to connect with another learner,

So we can exchange knowledge.

---

# Messaging

## Description

Matched users can communicate through private conversations.

### Features

- One-to-one messaging
- View conversation history
- Send text messages

### User Story

As a matched user,

I want to discuss schedules and learning goals,

So we can prepare for our sessions.

---

# Learning Sessions

## Description

Matched users can organize their learning sessions.

### Features

- Schedule session
- Accept invitation
- Reject invitation
- Cancel session
- Complete session

### Session Information

- Title
- Description
- Date
- Time
- Duration
- Status

### Session Status

- Scheduled
- Ongoing
- Completed
- Cancelled

### User Story

As a learner,

I want to schedule learning sessions,

So both participants know when to meet.

---

# Reviews & Ratings

## Description

Users can review each other after completing a learning session.

### Features

- Leave rating
- Write review
- View reviews
- View average rating

### Rating Scale

1 Star

2 Stars

3 Stars

4 Stars

5 Stars

### User Story

As a learner,

I want to rate my learning partner,

So other users know who is trustworthy.

---

# Dashboard

## Description

The dashboard provides an overview of the user's activity.

### Widgets

- Active Matches
- Upcoming Sessions
- Recent Messages
- Recent Reviews

### User Story

As a user,

I want one place to manage everything,

So I can quickly continue learning.

---

# Settings

## Description

Allows users to manage account preferences.

### Features

- Change password
- Update profile
- Delete account
- Logout

---

# Future Features

These are intentionally excluded from the MVP.

## Skill Credits

Teach users.

↓

Earn credits.

↓

Spend credits on learning.

---

## AI Matching

Recommend users based on:

- Skills
- Experience
- Schedule
- Interests
- Ratings

---

## AI Learning Roadmap

Generate personalized learning plans.

Example

Laravel Developer

↓

HTML

↓

CSS

↓

JavaScript

↓

PHP

↓

Laravel

---

## Certificates

Issue digital certificates after completing learning paths.

---

## Skill Verification

Verify skills using:

- Portfolio
- Quiz
- Community approval

---

## Video Calling

Built-in online learning sessions.

---

## Notifications

Notify users about:

- New match requests
- Messages
- Upcoming sessions

---

## Mobile Application

Native Android and iOS application.

---

## Group Learning

Support:

- One teacher
- Multiple students

---

# MVP Completion Checklist

## Authentication

- [x] Register
- [x] Login
- [x] Logout
- [ ] Password Reset _(deferred)_
- [x] Email Verification (6-digit code)

---

## Profiles

- [ ] View Profile
- [ ] Edit Profile
- [ ] Upload Avatar
- [ ] Availability

---

## Skills

- [ ] Add Skill
- [ ] Remove Skill
- [ ] Search Skills
- [ ] Categories

---

## Marketplace

- [ ] Browse Users
- [ ] Search Users
- [ ] Filter Users

---

## Matching

- [ ] Send Request
- [ ] Accept Request
- [ ] Reject Request

---

## Messaging

- [ ] Send Message
- [ ] Receive Message
- [ ] Conversation History

---

## Sessions

- [ ] Schedule
- [ ] Accept
- [ ] Complete

---

## Reviews

- [ ] Rating
- [ ] Comment

---

## Dashboard

- [ ] Active Matches
- [ ] Upcoming Sessions
- [ ] Recent Messages

---

## Settings

- [ ] Update Profile
- [ ] Change Password
- [ ] Delete Account
