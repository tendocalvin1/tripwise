# Tripwise

Tripwise is a travel planning platform for discovering destinations, creating
trips, building itineraries, managing budgets, and eventually receiving
personalized AI-powered travel recommendations.

Tripwise is being built as a production-oriented full-stack engineering
project, with a focus on backend architecture, API design, data modeling,
authentication, asynchronous processing, caching, testing, and deployment.

## Project Status

Tripwise is currently in active development.

### Completed

- User authentication with JWT
- Protected API endpoints
- User-specific data access
- Destination management
- Saved destinations
- Trip creation and retrieval
- Trip ownership and authorization
- Trip date validation
- Itinerary API
- Budget API
- Budget validation and database constraints
- PostgreSQL database
- React frontend with Vite
- React Router navigation
- React ↔ Django API integration
- Login flow
- JWT access/refresh token handling
- Trip dashboard
- Destination selector when creating trips
- Trip details page
- End-to-end trip creation flow

### Currently Building

- Trip itinerary UI
- Add/edit/delete itinerary activities
- Budget management UI
- Destination discovery UI
- Weather integration
- Maps integration

### Planned

- Redis caching
- Celery background processing
- Asynchronous weather/data processing
- Collaborative trip planning
- AI-powered traveller recommendations
- Automated backend and frontend testing
- Production deployment
- Logging and monitoring
- Health checks
- CI/CD improvements
- Production documentation

---

## Core Features

### Authentication

Tripwise uses JWT-based authentication.

Current authentication flow:

```text
React
  ↓
POST /api/auth/login/
  ↓
Django REST Framework
  ↓
JWT access + refresh tokens
  ↓
Authenticated API requests