# SkillSwap API

A skill exchange marketplace platform built with Laravel.

## Tech Stack

- **Backend:** Laravel 13, PHP 8.4
- **Database:** PostgreSQL (development via Docker, production via Supabase)
- **Cache/Queue:** Redis
- **Auth:** Laravel Sanctum (token-based)
- **API:** RESTful, versioned (`/api/v1`)

## Requirements

- Docker & Docker Compose

## Quick Start

```bash
# Clone and enter the project
git clone <repo-url> skillswap
cd skillswap

# Copy environment file
cp .env.example .env

# Start all services
docker compose up -d

# Install dependencies
docker compose exec app composer install

# Generate app key
docker compose exec app php artisan key:generate

# Run migrations
docker compose exec app php artisan migrate

# Storage link
docker compose exec app php artisan storage:link
```

The API will be available at `http://localhost:8080/api/v1`.

### Health Check

```bash
curl http://localhost:8080/api/v1/health
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | SkillSwap |
| `APP_ENV` | Environment | local |
| `APP_DEBUG` | Debug mode | true |
| `APP_URL` | Application URL | http://localhost:8080 |
| `DB_CONNECTION` | Database driver | pgsql |
| `DB_HOST` | Database host | pgsql |
| `DB_PORT` | Database port | 5432 |
| `DB_DATABASE` | Database name | skillswap |
| `DB_USERNAME` | Database user | skillswap |
| `DB_PASSWORD` | Database password | skillswap |
| `REDIS_HOST` | Redis host | redis |
| `MAIL_HOST` | Mail host | mailpit |
| `MAIL_PORT` | Mail port | 1025 |

### Supabase (Production)

For production, set the following in your `.env`:

```
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_SSLMODE=require
```

## Project Structure

```
app/
├── Actions/          # Single-action classes
├── DTOs/             # Data Transfer Objects
├── Enums/            # PHP Enums
├── Helpers/          // Helper functions
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/  # Versioned controllers
│   ├── Middleware/    // Custom middleware
│   ├── Requests/
│   │   └── Api/
│   │       └── V1/  # Versioned form requests
│   └── Resources/
│       └── Api/
│           └── V1/  # Versioned API resources
├── Models/           # Eloquent models
├── Policies/         # Authorization policies
├── Repositories/     # Data access layer
├── Services/         # Business logic
└── Traits/           # Reusable traits
```

## API Versioning

All endpoints are prefixed with `/api/v1/`.

- Current version: `v1`
- Content negotiation via `Accept: application/json`

## Coding Standards

- PSR-12
- SOLID principles
- RESTful API conventions
- Thin controllers, fat services
- Form Requests for validation
- API Resources for responses
- Strict typing (`declare(strict_types=1)`)

## Services

| Service | Port |
|---|---|
| Nginx | 8080 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Mailpit (SMTP) | 1025 |
| Mailpit (UI) | 8025 |

## Useful Commands

```bash
# Enter the app container
docker compose exec app bash

# Run tests
docker compose exec app php artisan test

# Clear cache
docker compose exec app php artisan optimize:clear

# View logs
docker compose logs -f app
```