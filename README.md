# Tripwise — Project Status (Temporary README)

> **Current milestone:** Production MVP deployed and smoke-tested  
> **Next milestone:** Resume development with Redis caching  
> **Status:** Active project

Tripwise is a full-stack travel-planning application for discovering destinations, creating trips, managing itineraries and budgets, saving destinations, and accessing destination weather information.

This document is a temporary record of the work completed so far and the planned next steps. Update it as the project evolves.

## 1. Current Production Architecture

```text
Traveler
   |
   v
React + Vite frontend
Hosted on Vercel
   |
   | HTTPS / REST API
   v
Django + Django REST Framework
Served by Gunicorn on Render
   |
   +--------------------+
   |                    |
   v                    v
PostgreSQL          External weather API
Hosted on Render
```

### Technologies

- **Frontend:** React, Vite, React Router, JavaScript
- **Backend:** Python, Django, Django REST Framework
- **Authentication:** JWT access and refresh tokens
- **Database:** PostgreSQL
- **Production server:** Gunicorn
- **Frontend hosting:** Vercel
- **Backend and database hosting:** Render
- **Quality checks:** Django tests, frontend lint/build, GitHub Actions CI
- **Version control:** Git and GitHub

## 2. Features Implemented

### Authentication and authorization

- User registration and login
- JWT access and refresh token flow
- Protected API endpoints
- User-scoped data access
- Backend enforcement of resource ownership

### Trips

- Create and retrieve trips
- View individual trip details
- Update and delete trips
- Associate trips with destinations
- Validate trip dates
- Restrict trip access to the owning user

### Itineraries and budgets

- Create, retrieve, update, and delete itinerary items
- Create, retrieve, update, and delete budget items
- Associate itinerary and budget records with trips
- Validate budget data and enforce database constraints
- Apply ownership checks to related resources

### Destinations and weather

- Destination discovery
- Saved destinations and removal of saved destinations
- Destination weather integration
- Destination coordinates used for weather requests
- Initial destination data stored in PostgreSQL

### Frontend

- React application built with Vite
- React Router navigation
- Login and registration flows
- Dashboard and trip details
- Destination selection when creating a trip
- Integration with the Django REST API
- API base URL configurable through `VITE_API_BASE_URL`

## 3. Testing and Production Work Completed

- Backend automated test suite passed: **32 tests**
- Frontend linting passed
- Frontend production build passed
- GitHub Actions CI configured for backend and frontend checks
- Backend deployed to Render
- Frontend deployed to Vercel
- Production PostgreSQL database configured
- Environment-based settings configured for production
- Gunicorn configured as the production application server
- Database migrations applied during deployment
- CORS and CSRF configuration corrected for the deployed frontend
- Production registration and login verified
- Protected trips endpoint verified using a fresh access token
- Production smoke test completed across the major workflows

### Production issue resolved: empty destination list

The newly provisioned production database did not contain destination records. As a result, users could not select a destination when creating a trip.

**Resolution:** Added a Django data migration at `backend/destinations/migrations/0003_seed_destinations.py` to seed ten destinations in Uganda. The migration was applied successfully in the local environment and deployed to production.

The ten seeded destinations are:

1. Kampala
2. Entebbe
3. Jinja
4. Murchison Falls National Park
5. Queen Elizabeth National Park
6. Bwindi Impenetrable National Park
7. Kidepo Valley National Park
8. Lake Bunyonyi
9. Fort Portal
10. Kasese

This made destination setup reproducible through migrations rather than relying on manual database changes.

## 4. Production Smoke Test

The following workflows were manually tested in the live application and reported as working:

- Authentication
- Dashboard
- Trip creation
- Viewing, editing, and deleting trips
- Itinerary management
- Budget management
- Destination discovery
- Weather
- Saving and removing destinations
- Protected access and authentication behavior
- Refresh and navigation
- Browser console/network checks

This reflects the last reported smoke-test result. Recheck production after significant future changes.

## 5. Deployment and Configuration

The frontend and backend are deployed separately:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL

The frontend API URL is configured with:

```text
VITE_API_BASE_URL
```

The backend uses environment variables for settings such as:

```text
SECRET_KEY
DEBUG
ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_PORT
```

Use local environment files for development and configure production variables through the hosting provider. **Never commit real secrets, passwords, access tokens, or populated `.env` files.**

## 6. Local Development

Repository:

```text
https://github.com/tendocalvin1/tripwise
```

Expected project structure:

```text
tripwise/
├── backend/
│   ├── destinations/
│   ├── trips/
│   ├── users/
│   ├── tripwise/
│   └── manage.py
├── frontend/
├── .github/
└── README.md
```

### Backend commands

Run from the repository root:

```bash
cd backend
python manage.py check
python manage.py test
python manage.py migrate
python manage.py runserver
```

### Frontend commands

In another terminal:

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

Use the project's existing environment configuration and local database setup. Do not copy production secrets into the repository or share them in logs or chat.

## 7. Next Engineering Milestones

These are planned, not yet confirmed as implemented.

### Phase 1 — Redis caching

- Introduce Redis in the local development environment
- Identify appropriate data to cache
- Implement the cache-aside pattern
- Configure cache keys and time-to-live (TTL)
- Handle cache invalidation when data changes
- Test cache hits, misses, expiry, and stale-data behavior
- Measure whether caching improves response time
- Plan and deploy Redis in production

### Phase 2 — Background processing

- Introduce Celery workers
- Use Redis as a broker where appropriate
- Move suitable slow or scheduled tasks into background jobs
- Add retry behavior and failure handling
- Test asynchronous task execution

### Phase 3 — AI capabilities

- Personalized traveller recommendations
- AI-assisted itinerary generation
- Input validation and structured output handling
- Evaluation of recommendation quality and reliability

### Phase 4 — Production engineering

- Query optimization and database indexes
- Structured logging, monitoring, and error tracking
- Health checks
- API rate limiting and additional security hardening
- Performance and reliability testing
- Real-time collaboration and geospatial features, where appropriate

## 8. Working Principles

For each significant change:

1. Understand the problem and design the solution.
2. Implement the smallest useful change.
3. Run automated tests and quality checks locally.
4. Review the diff and commit to the working branch.
5. Run CI and merge through the established workflow.
6. Deploy and smoke-test production.
7. Update this document to reflect what is actually implemented.

**Engineering principle:** Never sacrifice understanding for the appearance of productivity.

## 9. Current Resume Point

The production MVP is complete according to the last reported smoke test. The next planned implementation task is **Redis caching**, beginning with checking the current repository and branch state before making changes.

Before resuming, inspect the local working tree and recent commits:

```bash
cd ~/tripwise
git status
git branch --show-current
git log -5 --oneline
```

Do not reset, overwrite, or switch branches until any local changes have been reviewed.


