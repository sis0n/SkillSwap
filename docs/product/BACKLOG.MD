# SkillSwap Product Backlog — Skills Module

> Version: 1.0.0
> Status: Future Enhancements (Outside MVP)
> Last Updated: 2026-07-27

---

# Purpose

This document captures validated product ideas for the Skills module that are intentionally outside the MVP scope.

The purpose is to preserve architectural direction for future development without expanding the current roadmap or modifying the existing implementation.

Do not implement any feature listed here unless explicitly assigned to a future development phase.

---

# Prioritization Framework

## High Priority

Important after MVP. These features directly improve user experience, trust, or marketplace quality.

## Medium Priority

Useful enhancements that improve engagement or convenience. Not critical for post-MVP launch.

## Long-Term Vision

Large strategic features that require significant architecture, algorithm design, or ecosystem investment.

---

# 1. Skill Endorsements

**Priority:** High

**Description:** Users can endorse another user's skills, similar to LinkedIn endorsements. An endorsement is a lightweight social signal that a skill has been verified by another community member.

**Problem it solves:**
- Trust is hard to establish in a peer-to-peer marketplace
- Users cannot verify skill claims without evidence
- Marketplace search lacks ranking signals beyond self-reported data

**User value:**
- Endorsed skills stand out on profiles and in marketplace search
- Users can quickly identify trusted teachers for a skill
- Endorsements provide social proof without requiring a full review

**Technical considerations:**
- Endorsements require abuse prevention (one endorsement per skill per user, rate limiting)
- Endorsement count should be a queryable metric for marketplace ranking
- Endorsements must be removable by the endorser
- A user should not be able to endorse their own skills
- Removing a user skill should cascade-delete its endorsements

**Recommended architecture:**

```
skill_endorsements
├── id              bigint PK
├── endorser_id     bigint FK → users.id, cascade delete
├── user_skill_id   bigint FK → user_skills.id, cascade delete
├── created_at      timestamp
└── updated_at      timestamp

Constraints:
- Unique (endorser_id, user_skill_id) — one endorsement per user per skill
- CHECK endorser_id != user_skill.user_id (via application layer or trigger)

Indexes:
- (user_skill_id) — count endorsements per skill
- (endorser_id) — list endorsements given by a user
```

- Endorsement count exposed on the `UserSkillResource` as `endorsements_count`
- No separate endpoint for listing endorsements (MVP-light can skip)
- Endorsement creation/deletion via `POST /me/endorsements` and `DELETE /me/endorsements/{id}`
- Rate limit: max 20 endorsements per user per day

**Dependencies:**
- Phase 6 (Marketplace) — endorsements used as a ranking signal
- Phase 7 (Exchange Requests) — endorsements visible on request sender profile

**Estimated complexity:** Medium (1 new table, 1 model, 1 controller, validation, tests)

**Recommended roadmap phase:** Phase 6.1 — Marketplace Trust Signals

**Why NOT in MVP:** Endorsements are a trust layer on top of the core skill exchange flow. The MVP must first prove that the exchange workflow works before adding social verification signals. Users can still discover and request exchanges based on self-reported skills alone.

---

# 2. Portfolio Integration

**Priority:** High

**Description:** Allow users to attach proof of experience to their skills. Users can link portfolio entries (GitHub repos, Behance projects, Dribbble shots, certificates, websites) directly to a specific user skill rather than only to their general profile.

**Problem it solves:**
- A user may have 10 portfolio links but no way to say "this GitHub repo proves my React skill"
- Skill claims lack supporting evidence, reducing trust
- Portfolio links on the profile are disconnected from skills, making verification harder

**User value:**
- Teachers can prove proficiency with real work samples per skill
- Learners can evaluate a teacher's actual experience before requesting an exchange
- Increases trust and reduces friction in the matching process

**Technical considerations:**
- Portfolio links already exist in the `portfolio_links` table (Phase 4.6)
- The recommended approach is to link existing portfolio_links to user_skills, not duplicate data
- A portfolio link should be attachable to multiple skills (e.g., a full-stack project demonstrates both React and Node.js)
- Attachments should be optional — a skill does not require proof

**Recommended architecture:**

Option A (recommended) — Link existing portfolio_links to user_skills:

```
skill_portfolio_attachments
├── id              bigint PK
├── user_skill_id   bigint FK → user_skills.id, cascade delete
├── portfolio_link_id bigint FK → portfolio_links.id, cascade delete
├── created_at      timestamp
└── updated_at      timestamp

Constraints:
- Unique (user_skill_id, portfolio_link_id) — one attachment per link per skill

Indexes:
- (user_skill_id) — list attachments for a skill
```

This approach reuses the existing `portfolio_links` table, avoids data duplication, and keeps the portfolio system normalized. A single portfolio link (e.g., a GitHub repo) can be attached to multiple skills.

Option B (not recommended) — Embed URLs directly in the pivot:
Duplicates the `portfolio_links` table structure and creates two parallel portfolio systems. Strongly discouraged.

**Dependencies:**
- Phase 4.6 (Portfolio Links) — the portfolio_links table must exist (already completed)
- Phase 5 (Skills) — user_skills must exist (already completed)

**Estimated complexity:** Low (1 new pivot table, 1 model, minor API changes, tests)

**Recommended roadmap phase:** Phase 6.5 — Skill Portfolio Integration

**Why NOT in MVP:** Portfolio links exist at the profile level, which is sufficient for MVP launch. Skill-level portfolio attachment is a refinement that improves trust but is not required for the core exchange flow. Users can still browse a teacher's full portfolio from their profile.

---

# 3. Learning Progress

**Priority:** Medium

**Description:** Allow users to track progress on skills they are learning. Users can mark milestones, update completion percentage, or change status as they progress through a skill.

**Problem it solves:**
- Learners have no way to track their progress within the platform
- Teachers cannot see if their students are making progress
- The platform lacks engagement hooks that keep users returning

**User value:**
- Learners can set goals and track improvement over time
- Teachers can adjust their approach based on student progress
- Progress data can inform completion certificates and reviews

**Technical considerations:**
- Progress belongs on the `user_skill` record, not on learning sessions
- A learning session may cover multiple skills or partial skills
- Progress should be user-reported, not algorithmically determined
- Avoid coupling progress tracking to exchange requests (a user may learn a skill independently)

**Recommended architecture:**

Add progress columns to `user_skills`:

```
user_skills (extended)
├── ... existing columns ...
├── progress_status    string  nullable   — not_started, in_progress, completed
├── progress_percentage smallint nullable — 0–100, validated in app layer
└── progress_updated_at timestamp nullable — last progress update
```

Alternatively, a separate `skill_progress` table if milestone tracking is desired:

```
skill_progress
├── id              bigint PK
├── user_skill_id   bigint FK → user_skills.id, cascade delete
├── milestone       string(200)       — e.g. "Built first REST API"
├── completed_at    timestamp nullable
├── created_at      timestamp
└── updated_at      timestamp
```

The simplest MVP-viable approach is adding columns directly to `user_skills` (Option A). A separate milestones table (Option B) should only be added if milestone tracking is explicitly required.

**Architecture decision:** Progress belongs inside My Skills, not inside Learning Sessions. Learning Sessions track scheduled events; My Skills tracks the skill itself. Progress is a property of the skill relationship, not of any single session.

**Dependencies:**
- Phase 5 (Skills) — user_skills must exist (already completed)
- Phase 9 (Learning Sessions) — if session-based progress automation is desired later

**Estimated complexity:** Low to Medium (migration + model changes + API updates + UI)

**Recommended roadmap phase:** Phase 9.5 — Learning Progress Tracking

**Why NOT in MVP:** The MVP focuses on the exchange workflow (discover, match, communicate, session, review). Progress tracking is a retention feature that adds value after the core loop is proven. Users can track progress externally (notebooks, apps) until this feature is built.

---

# 4. Skill Matching Engine

**Priority:** High

**Description:** A recommendation engine that computes compatibility between users based on complementary skills. Given User A teaches X and User B wants to learn X, the engine suggests a match.

**Problem it solves:**
- Users must manually browse the marketplace to find complementary skill pairs
- The marketplace requires active searching rather than passive discovery
- Matching efficiency directly impacts exchange request volume

**User value:**
- Users receive proactive match suggestions without manual searching
- Higher-quality matches based on skill complementarity, not just keyword search
- Reduces time-to-first-exchange, improving activation and retention

**Technical considerations:**
- Do NOT implement complex ML algorithms in the MVP phase
- A SQL-based compatibility query is sufficient for initial matching
- Matching should consider: skill complementarity, experience level alignment, availability overlap, location/timezone
- Results should be cacheable (compatibility scores change infrequently)
- Privacy: users must opt into being discoverable for matching

**Recommended architecture:**

```
SkillMatchingService
├── findMatches(User $user, array $filters): Collection
│   ├── 1. Get user's teaching skills
│   ├── 2. Find users who want to learn those skills (learning complement)
│   ├── 3. Get user's learning skills
│   ├── 4. Find users who teach those skills (teaching complement)
│   ├── 5. Score by: skill overlap count, experience alignment, availability
│   └── 6. Return sorted, paginated results

Scoring factors (configurable weights):
├── Skill complementarity (direct match = highest weight)
├── Experience level alignment (beginner matches with teacher who prefers beginners)
├── Location/timezone overlap (same timezone preferred)
└── Profile completeness (higher trust for complete profiles)
```

No new tables required for the initial version. The existing `skills`, `user_skills`, `users`, `profiles`, and `user_availability` tables contain all necessary data.

**Dependencies:**
- Phase 5 (Skills) — user_skills with type (teaching/learning) already exist
- Phase 6 (Marketplace) — the matching engine powers marketplace recommendations
- Phase 7 (Exchange Requests) — matches are the entry point for requests

**Estimated complexity:** Medium (1 service class, 1 optional API endpoint, scoring logic, tests)

**Recommended roadmap phase:** Phase 6.2 — Marketplace Recommendations

**Why NOT in MVP:** The marketplace browse + search functionality is sufficient for MVP launch. A matching engine is an optimization that improves discovery but is not required for the first exchange to happen. Users can find each other through search and category filtering.

---

# 5. Bulk Skill Operations

**Priority:** Low (Medium if user research confirms demand)

**Description:** Allow users to add, update, or delete multiple skills in a single API request instead of one-at-a-time.

**Problem it solves:**
- Adding 10 skills requires 10 separate API calls
- Users who import skills from other platforms have a poor experience
- Power users find the current flow tedious

**User value:**
- Faster skill setup for new users
- Better onboarding experience
- Reduced API calls and network overhead

**Technical considerations:**
- Bulk create: accept array of skill objects, validate each independently, return per-item errors
- Bulk update: accept array of { id, fields }, validate each independently
- Bulk delete: accept array of IDs, check active exchange request guard per item
- Per-item validation with partial success is more complex than all-or-nothing
- All-or-nothing (transactional) is simpler but may reject the entire batch for one invalid item

**Recommended architecture:**

```
POST /api/v1/me/skills/bulk
Body: { "skills": [{ "skill_id": 1, "type": "teaching", ... }, ...] }
Response: { "success": true, "data": { "created": [...], "errors": [...] } }

DELETE /api/v1/me/skills/bulk
Body: { "ids": [1, 2, 3] }
Response: { "success": true, "data": { "deleted": [1, 2], "errors": { "3": "Active exchange request exists." } } }
```

- Use a new `BulkUserSkillController` or extend `UserSkillController`
- Validate each item individually for partial success pattern
- Check skill limit (30) against the batch size
- Wrap in a DB transaction per item (not across the batch) to isolate failures

**Estimated complexity:** Medium (controller + request + service updates + tests)

**Recommended roadmap phase:** Phase 11 (Pre-Release QA) or deferred to Phase 13 (Post-MVP Polish)

**Why NOT in MVP:** The current single-item flow is functional and adequate for the target user base. Bulk operations are a convenience feature that can be added post-launch based on user feedback. Adding 5-10 skills one-at-a-time is acceptable during onboarding.

---

# 6. Skill History

**Priority:** Medium

**Description:** Track historical changes to user skills — title changes, experience level updates, description edits, featured status toggles.

**Problem it solves:**
- Users cannot see how a skill has evolved over time
- No audit trail for moderation or dispute resolution
- Users cannot undo accidental changes

**User value:**
- Transparency — learners can see when a teacher last updated their skill
- Trust — users know skill information is current and maintained
- Safety — moderation team can review historical changes for policy violations

**Technical considerations:**
- Activity logging (Spatie\Activitylog) is the recommended approach
- Version history (separate table per model) is overengineered for this use case
- Activitylog supports: causer, subject, event, properties (old/new values), description
- Logs should be retained for a configurable period (e.g., 90 days)
- History should not be exposed via the public API by default

**Recommended architecture:**

Use `spatie/laravel-activitylog` (already common in Laravel ecosystems):

```php
// In UserSkill model
protected static function booted(): void
{
    static::created(fn ($model) => activity()->performedOn($model)
        ->withProperties(['skill_id' => $model->skill_id, 'type' => $model->type])
        ->log('created'));

    static::updated(fn ($model) => activity()->performedOn($model)
        ->withProperties(['old' => $model->getOriginal(), 'new' => $model->getChanges()])
        ->log('updated'));

    static::deleted(fn ($model) => activity()->performedOn($model)
        ->withProperties(['skill_id' => $model->skill_id])
        ->log('deleted'));
}
```

- Store activity in the `activity_log` table (provided by the package)
- Index on `subject_type` + `subject_id` for efficient querying
- Expose history only to admin endpoints, not public API
- Admin UI can display history in a timeline view

**Dependencies:**
- `spatie/laravel-activitylog` package (not currently installed)
- Phase 12 (Admin Dashboard) — history is primarily useful for admin/moderator workflows

**Estimated complexity:** Low (install package, add trait, configure logging)

**Recommended roadmap phase:** Phase 12 (Deployment — pre-launch admin tooling)

**Why NOT in MVP:** History tracking is an operational tool, not a user-facing feature. The MVP should prioritize user-facing value over internal tooling. If data loss is a concern, database backups and slugs provide sufficient safety net.

---

# 7. Skill Aliases

**Priority:** High

**Description:** A synonym system that maps common variations of skill names to a canonical skill. Example: "JS", "JavaScript", "ECMAScript" → "JavaScript".

**Problem it solves:**
- Users may search for "JS" but the catalog only has "JavaScript" — no results found
- Duplicate skills are created for variations of the same concept (e.g., "NodeJS" vs "Node.js")
- The current strict name normalization handles whitespace and case but not synonyms

**User value:**
- Search always returns relevant results regardless of naming variation
- Users find what they're looking for without guessing the canonical name
- Reduced duplicate skills in the catalog

**Technical considerations:**
- Aliases should be system-managed (admin-created, not user-generated)
- The current `whereRaw('LOWER(name) = ?')` lookup should also check aliases
- Aliases should be stored in a separate table for normalized management
- On custom skill creation, check aliases before creating a new skill

**Recommended architecture:**

```
skill_aliases
├── id              bigint PK
├── skill_id        bigint FK → skills.id, cascade delete
├── alias           string(255) — normalized (lowercase, trimmed)
├── created_at      timestamp
└── updated_at      timestamp

Indexes:
- (alias) — fast lookup
- (skill_id) — list aliases for a skill
```

Update `UserSkillService::createUserSkill()`:

```php
// Before creating a new skill, check aliases
$alias = SkillAlias::whereRaw('LOWER(alias) = ?', [mb_strtolower($skillName)])->first();
if ($alias) {
    $skill = $alias->skill;
}
```

**Dependencies:**
- Phase 5 (Skills) — skill catalog must exist (already completed)
- Admin tooling for alias management

**Estimated complexity:** Low (1 new table, 1 model, minor service update, seeder, tests)

**Recommended roadmap phase:** Phase 5.3 — Skill Alias System

**Why NOT in MVP:** The current case-insensitive, whitespace-normalized lookup handles the most common name variations. Synonym resolution is an improvement that becomes more valuable as the catalog grows. A small seed set of ~60 system skills has limited collision risk.

---

# 8. Skill Merge

**Priority:** Medium

**Description:** Allow administrators to merge duplicate skills into a single canonical entry. When two skills represent the same concept (e.g., "ReactJS" and "React"), an admin can merge them, automatically migrating all relationships.

**Problem it solves:**
- Despite normalization, users may create skills that duplicate existing entries under different names
- Cleaning up duplicates manually is error-prone and time-consuming
- Orphaned user_skills reference the wrong skill record

**User value:**
- Clean, non-duplicative skill catalog
- Users always reference the correct skill regardless of which variant they originally chose
- No broken references after cleanup

**Technical considerations:**
- Merge operation: (1) create alias for the source skill → target skill, (2) move all user_skills from source to target, (3) handle category pivot conflicts, (4) soft-delete or hard-delete source
- Category pivot conflicts: if both source and target belong to category X, the duplicate pivot entry is dropped (unique constraint on pivot prevents duplicates)
- UserSkill unique constraint `(user_id, skill_id, type)`: if a user has both "ReactJS" (teaching) and "React" (teaching), the merge would fail. This should be surfaced to the admin for manual resolution.
- Merge should be transactional (all or nothing)

**Recommended architecture:**

```
AdminSkillMergeController
├── POST /admin/skills/merge
│   Body: { "source_skill_id": 123, "target_skill_id": 456 }
│   ├── 1. Validate both skills exist and are different
│   ├── 2. Create alias (source → target) for future lookups
│   ├── 3. Migrate skill_category_skill pivot rows (handle conflicts)
│   ├── 4. Migrate user_skills rows (report conflicts that need manual resolution)
│   └── 5. Soft-delete source skill
```

- Step 4 emits a report of conflicts rather than failing the transaction
- Conflicts are rare and can be resolved manually by the admin or user

**Dependencies:**
- Phase 5 (Skills) — all skill tables exist (already completed)
- Phase 12 (Admin Dashboard) — admin endpoints and UI for merge operations
- Skill Aliases (backlog item #7) — merge should create an alias automatically

**Estimated complexity:** Medium (controller + service + merge logic + tests)

**Recommended roadmap phase:** Phase 12 (Deployment — pre-launch data cleanup tooling)

**Why NOT in MVP:** The skill catalog is seeded with curated system skills, and user-created skills are normalized. Duplicates are unlikely in the early catalog size (~60 skills). Merge tooling becomes important as the catalog grows organically.

---

# 9. Skill Moderation

**Priority:** Medium

**Description:** A moderation workflow for community-created skills. When a user creates a custom skill, it enters a "pending" state until reviewed by an admin. Approved skills become part of the public catalog.

**Problem it solves:**
- Users may create inappropriate or offensive skill names
- The catalog could accumulate low-quality, duplicate, or nonsensical entries
- No quality control on community-contributed content

**User value:**
- Clean, high-quality skill catalog
- Protection against inappropriate content
- Users trust the catalog for accurate skill representation

**Technical considerations:**
- Add `status` column to `skills` table: `pending`, `approved`, `rejected`, `merged`
- Pending skills are visible to the creator but not searchable by other users
- Approved skills become fully public in the catalog
- Rejected skills remain visible only to the creator (or are soft-deleted)
- Merged status links to the canonical skill via the alias system
- Moderation queue endpoint for admin dashboard

**Recommended architecture:**

Add to `skills` table:

```
skills (extended)
├── ... existing columns ...
├── moderation_status  string  default 'approved'  — pending, approved, rejected, merged
├── moderated_by       bigint FK → users.id, nullable — admin who reviewed
├── moderated_at       timestamp nullable
├── rejection_reason   text nullable
```

- System-seeded skills always have `moderation_status = 'approved'`
- On custom skill creation, if moderation is enabled: `moderation_status = 'pending'`
- `SkillController::index()` filters: `where('moderation_status', 'approved')`
- Creator can still see their pending skill in their own skills list

**Dependencies:**
- Phase 5 (Skills) — skills table must exist (already completed)
- Phase 12 (Admin Dashboard) — moderation queue UI
- Skill Merge (backlog item #8) — merging a rejected/duplicate skill

**Estimated complexity:** High (migration + model + controller update + moderation queue + frontend + tests)

**Recommended roadmap phase:** Phase 12 (Deployment — pre-launch content moderation)

**Why NOT in MVP:** Pre-moderation of skills would block the core user flow — users cannot add skills without waiting for approval. Post-moderation (approve by default, review asynchronously) is acceptable for MVP but adds operational overhead. A simple abuse reporting mechanism is sufficient for early-stage moderation.

---

# 10. Popularity Metrics

**Priority:** Medium

**Description:** Track usage metrics for skills in the catalog — how many users teach each skill, how many want to learn it, how many exchange requests reference it.

**Problem it solves:**
- Marketplace ranking lacks objective popularity signals
- Users cannot see which skills are most in demand
- Analytics for platform growth and skill gap analysis

**User value:**
- Users can identify popular skills for their learning goals
- Marketplace search can rank by relevance + popularity
- Platform insights for content strategy and community growth

**Technical considerations:**
- Metrics can be computed from existing data (user_skills, exchange_requests)
- A dedicated `skill_metrics` table or cached counters for performance
- Counters should be updated via events/observers, not real-time queries
- Consider cache invalidation strategy (eager vs lazy refresh)

**Recommended architecture:**

Option A (recommended for initial implementation) — Computed counters:

```php
// In Skill model
public function teachCount(): int
{
    return $this->userSkills()->where('type', 'teaching')->count();
}

public function learnCount(): int
{
    return $this->userSkills()->where('type', 'learning')->count();
}

public function exchangeCount(): int
{
    return ExchangeRequest::whereHas('teachingSkill.skill', fn ($q) => $q->whereId($this->id))
        ->orWhereHas('learningSkill.skill', fn ($q) => $q->whereId($this->id))
        ->count();
}
```

Option B — Cached counters table (for higher traffic):

```
skill_metrics
├── skill_id         bigint PK/FK → skills.id, cascade delete
├── teach_count      integer default 0
├── learn_count      integer default 0
├── exchange_count   integer default 0
├── user_count       integer default 0  — distinct users
├── updated_at       timestamp
```

Update via model events or a queued job.

**Dependencies:**
- Phase 5 (Skills) — user_skills and exchange_requests exist
- Phase 6 (Marketplace) — metrics used for ranking
- Phase 7 (Exchange Requests) — exchange count requires exchange_requests

**Estimated complexity:** Low to Medium (model scopes or new table + observer + cache)

**Recommended roadmap phase:** Phase 6.3 — Marketplace Ranking Signals

**Why NOT in MVP:** Popularity metrics enhance marketplace ranking but are not required for basic search and filter functionality. The MVP can sort alphabetically and by featured status without needing popularity data.

---

# 11. Search Improvements

**Priority:** Medium

**Description:** Enhance the skill search with alias resolution, typo tolerance, fuzzy matching, and AI-assisted search.

**Problem it solves:**
- Current search uses simple `LIKE '%term%'` — no fuzzy matching
- Typos return zero results (e.g., "javascrit" instead of "javascript")
- Users must know exact or approximate names to find skills

**User value:**
- Search returns relevant results even with typos and partial names
- Users discover skills they didn't know existed
- Reduced friction during skill selection

**Technical considerations:**
- PostgreSQL supports full-text search (`tsvector`/`tsquery`) natively
- `pg_trgm` extension enables trigram-based fuzzy matching (`similarity()`, `word_similarity()`)
- For MVP-scale (~60–500 skills), `pg_trgm` with a GIN index is sufficient
- AI-assisted search (embedding-based) is premature at this stage
- Alias resolution (backlog item #7) should be implemented first

**Recommended architecture — Phase 1 (Post-MVP):**

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN index for trigram search
CREATE INDEX skills_name_trgm_idx ON skills USING GIN (name gin_trgm_ops);
```

```php
// SkillController scopeSearch enhancement
$query->where(function ($q) use ($term) {
    $q->where('name', 'ilike', "%{$term}%")
      ->orWhereRaw('similarity(name, ?) > 0.3', [$term])
      ->orWhereRaw('word_similarity(name, ?) > 0.4', [$term]);
})
->orderByRaw('similarity(name, ?) DESC', [$term]);
```

**Recommended architecture — Phase 2 (Long-term):**

- Laravel Scout with Meilisearch or Typesense for typo-tolerant, faceted search
- Realtime indexing via model observers
- AI embeddings for semantic search (future)

**Dependencies:**
- Skill Aliases (backlog item #7) — alias resolution should complement search
- PostgreSQL `pg_trgm` extension (requires Supabase enablement)
- Phase 11 (Pre-Release QA) — search quality testing

**Estimated complexity:** Low (PostgreSQL extension + index + query update)

**Recommended roadmap phase:** Phase 6 — Marketplace (integrated with marketplace search)

**Why NOT in MVP:** The current `LIKE '%term%'` search is functional for the MVP catalog size (~60 skills). Fuzzy search becomes important as the catalog grows through user-created skills. Alias resolution (#7) provides better ROI for the initial catalog.

---

# 12. Skill Badges & Achievements

**Priority:** Long-Term Vision

**Description:** Gamification system that awards badges for skill-related achievements. Examples: "First 5 skills added," "Completed 10 learning sessions," "Received 5 endorsements."

**Problem it solves:**
- The platform lacks engagement and retention mechanics
- Users have no goals beyond one-to-one exchanges
- No recognition for community contribution or learning milestones

**User value:**
- Motivation to stay engaged with the platform
- Recognition for contributions (teaching, endorsing, reviewing)
- Badges serve as trust signals on profiles

**Technical considerations:**
- Badges should be earned automatically, not requested
- Badge criteria should be data-driven (queryable from existing tables)
- Badges display on profiles as trust signals
- Avoid badge fatigue — limit active badge types to 10–15

**Recommended architecture:**

```
skill_badges
├── id              bigint PK
├── slug            string unique    — e.g., "first-skill", "endorser-10"
├── name            string           — e.g., "First Skill"
├── description     text             — e.g., "Added your first skill"
├── icon            string nullable  — icon identifier
├── criteria        json             — {"type": "skill_count", "threshold": 1}
└── created_at      timestamp

user_badges
├── id              bigint PK
├── user_id         bigint FK → users.id, cascade delete
├── badge_id        bigint FK → skill_badges.id, cascade delete
├── awarded_at      timestamp
└── metadata        json nullable    — context (e.g., which skill triggered it)
```

- Award badges via event listeners (UserSkillCreated, ExchangeRequestCompleted, etc.)
- BadgeService checks criteria and awards if not already earned
- Exposed on UserResource as `badges` array

**Dependencies:**
- Phase 5 (Skills) — skill-related badges require skills
- Phase 7 (Exchange Requests) — exchange-related badges
- Phase 10 (Reviews) — review-related badges
- Phase 12 (Admin Dashboard) — badge management

**Estimated complexity:** High (2 new tables, badge engine, event listeners, UI components, tests)

**Recommended roadmap phase:** Phase 13 — Gamification

**Why NOT in MVP:** Gamification is a retention and engagement layer that adds value after the core exchange loop is proven. The MVP must first demonstrate that users can successfully exchange skills before adding achievement systems.

---

# 13. Skill Recommendations (AI)

**Priority:** Long-Term Vision

**Description:** AI-powered skill recommendations that suggest skills a user might want to learn based on their existing skills, trending skills on the platform, and skills commonly paired together.

**Problem it solves:**
- Users may not know what skills to learn next
- The platform lacks personalized learning path suggestions
- Discovering complementary skills requires external research

**User value:**
- Personalized learning path suggestions
- Discovery of related skills the user may not have considered
- Guided progression from beginner to advanced skills

**Technical considerations:**
- Requires sufficient data (user_skills, exchange_requests) for meaningful recommendations
- Collaborative filtering (users with similar skills also learned X)
- Skill co-occurrence analysis (users who teach PHP often also teach Laravel)
- AI integration (OpenAI/Claude) for natural language skill relationship mapping
- Recommendations should be explainable ("Users who teach PHP also teach Laravel")

**Recommended architecture:**
- Phase 1: Rule-based co-occurrence recommendations (no ML)
- Phase 2: Collaborative filtering with matrix factorization
- Phase 3: AI-powered semantic recommendations

Data requirements:
- Minimum 1,000 users with skills before collaborative filtering is meaningful
- Minimum 100 skills in the catalog for co-occurrence patterns
- User feedback loop (accept/dismiss recommendations) for quality improvement

**Dependencies:**
- Skill Popularity Metrics (backlog item #10) — popularity data feeds recommendation models
- Phase 13 — significant post-MVP data and infrastructure investment

**Estimated complexity:** Very High (ML infrastructure, data pipeline, recommendation service, UI)

**Recommended roadmap phase:** Phase 15+ — AI Platform Features

**Why NOT in MVP:** AI recommendations require scale (users, skills, exchanges) to be meaningful. The MVP has 0 users at launch. Recommendations at MVP scale would be generic and low-value. Rule-based suggestions (skill aliases, skill pairing in seed data) provide adequate guidance until the platform grows.

---

# Summary — Prioritization

| # | Feature | Priority | Recommended Phase | Complexity |
|---|---------|----------|-------------------|------------|
| 1 | Skill Endorsements | High | 6.1 — Marketplace Trust Signals | Medium |
| 4 | Skill Matching Engine | High | 6.2 — Marketplace Recommendations | Medium |
| 7 | Skill Aliases | High | 5.3 — Skill Alias System | Low |
| 2 | Portfolio Integration | High | 6.5 — Skill Portfolio Integration | Low |
| 6 | Skill History | Medium | 12 — Deployment (Admin Tooling) | Low |
| 8 | Skill Merge | Medium | 12 — Deployment (Admin Tooling) | Medium |
| 9 | Skill Moderation | Medium | 12 — Deployment (Admin Tooling) | High |
| 10 | Popularity Metrics | Medium | 6.3 — Marketplace Ranking Signals | Low |
| 11 | Search Improvements | Medium | 6 — Marketplace | Low |
| 3 | Learning Progress | Medium | 9.5 — Learning Progress Tracking | Low-Med |
| 5 | Bulk Skill Operations | Low-Med | 13 — Post-MVP Polish | Medium |
| 12 | Skill Badges | Long-Term | 13 — Gamification | High |
| 13 | AI Recommendations | Long-Term | 15+ — AI Platform | Very High |
| 14 | Marketplace Location Filter | Medium | 6.4 — Marketplace Location & Timezone | Low-Med |

---

# Architectural Principles

When implementing any backlog item, follow these principles:

1. **Reuse before build** — Extend existing tables and services before creating new ones.
2. **Normalize data** — Avoid duplicating data across tables. Reuse the `portfolio_links` table rather than creating a parallel portfolio system.
3. **Prefer simplicity** — SQL-based solutions before ML. Computed counters before cached counters. Activity logging before version history.
4. **Backward compatibility** — New features must not break existing API responses. Add fields, do not remove them.
5. **Progressive enhancement** — Build features that work well at small scale and scale to large scale without rewrites.
6. **No premature optimization** — Do not add infrastructure (queues, caches, ML) until data proves it is necessary.
7. **Consistency with MVP** — All new features must follow the same patterns as the MVP: Laravel controllers + services + resources, with eager loading, validation, and tests.

---

# When to Re-evaluate

This backlog should be reviewed when:

- Phase 6 (Marketplace) is being designed — matching engine and popularity metrics directly impact marketplace architecture
- User feedback indicates a specific pain point (e.g., "I can't find the skill I want" → search improvements)
- Platform scale reaches a threshold (e.g., 1,000+ skills → moderation becomes necessary)
- A new phase is being planned and needs scope definition
- Community contribution grows (e.g., user-created skills become significant → moderation and merge tools)

---

# 14. Marketplace Location Filter

**Priority:** Medium

**Description:** Allow filtering marketplace search results by user location, enabling users to find learning partners in their city, region, or timezone.

**Problem it solves:**
- Users in different timezones may have incompatible schedules
- Some users prefer in-person or local exchanges
- Location is already visible on user profiles but not filterable

**User value:**
- Users can find partners in compatible timezones
- Local meetups or in-person exchanges become discoverable
- Reduces scheduling friction for timezone-sensitive users

**Technical considerations:**
- `profiles.location` is a free-text VARCHAR(100) field (e.g., "Manila, Philippines") — no normalized city/region/country structure
- Free-text partial matching is unreliable (e.g., "NY" won't match "New York")
- Proper location filtering requires either: (a) structured location fields (city, region, country), (b) geocoding for radius search, or (c) timezone-based filtering as a proxy
- Timezone is already stored on profiles (`profiles.timezone`, IANA identifier) and could be used for timezone-aware filtering without new fields
- A future normalized location schema would be preferable over string matching on free text

**Recommended approach (when prioritized):**
- Option A (simplest): Add timezone-based grouping/filtering using existing `profiles.timezone` field — users can find partners in nearby timezones without location parsing
- Option B (preferred): Add structured location fields (country, region, city) to profiles and enable geo-filtering
- Option C (not recommended): Pattern matching on free-text `profiles.location` — too unreliable

**Dependencies:**
- Phase 6 (Marketplace) — the marketplace search infrastructure must exist first
- Profile location schema — if Option B is chosen, a migration to add structured location fields

**Estimated complexity:** Low (Option A) to Medium (Option B)

**Recommended roadmap phase:** Phase 6.4 — Marketplace Location & Timezone Filtering

**Why NOT in MVP:** The MVP focuses on skill-based matching, which is the core value proposition. Location filtering adds secondary value and can be deferred without blocking the exchange workflow. Users can view location on profile pages before sending a request. Timezone filtering using the existing `profiles.timezone` field is a simpler interim solution than free-text location matching.

---

# Relationship to Other Documents

- **ROADMAP.MD** — This backlog does not change the current roadmap. Features listed here are explicitly outside the MVP scope.
- **FEATURES.MD** — This backlog is the future evolution of the Skills feature described in FEATURES.MD.
- **DATABASE.MD** — Future tables described here (skill_endorsements, skill_aliases, skill_metrics, etc.) should be added to DATABASE.MD when implemented.
- **API.MD** — Future endpoints described here should be added to API.MD when implemented.
