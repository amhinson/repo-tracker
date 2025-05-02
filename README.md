# Repository Release Tracker

A full-stack application that helps you track new releases for your favorite GitHub repositories.

## Features

- Track GitHub repositories and their releases
- Markdown rendering for release notes
- Responsive design for mobile and desktop
- GitHub authentication
- Per-user repository tracking

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Apollo Client
- TailwindCSS

### Backend

- Node.js
- TypeScript
- Apollo Server
- Prisma
- PostgreSQL

## Prerequisites

- Node.js 18+
- PostgreSQL
- GitHub OAuth application credentials
- npm

## Setup

### 1. Environment Variables

Create `.env` files in both client and server directories:

```env
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/repo_tracker"
GITHUB_TOKEN=your_github_personal_access_token

# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

### 2. Installation and Setup

```bash
# Install all dependencies
npm install

# Setup the database
npm run setup:db
```

### 3. Development

```bash
# Start both client and server in development mode
npm run dev

# Or start them individually
npm run dev:client
npm run dev:server
```

The application will be available at:

- Frontend: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql

## Implementation Details

### Key Features

- **Repository Management**: Add and remove repositories to track
- **Release Tracking**: Automatic detection of new releases
- **Responsive UI**:
  - Desktop: Split-panel view
  - Mobile: Modal-based interface
- **Release Notes**: Markdown rendering with typography

### Trade-offs and Decisions

1. **Authentication**:

   - GitHub OAuth for user authentication
   - Per-user repository tracking
   - Session-based auth with NextAuth.js

2. **Data Model**:

   - Repositories shared across users
   - User-specific release tracking

3. **UI/UX**:
   - Automatic release marking when viewed
   - Responsive layout with different mobile/desktop experiences
   - Real-time updates via Apollo Client

## Future Improvements

1. **Features**:

   - Filtering and sorting
   - In-app notifications for real-time updates
   - Release history view

2. **Technical**:
   - Add offline support
   - Add end-to-end tests
   - Add rate limiting
   - Implement webhooks for updates

## Project Structure

```
repo-tracker/
├── client/          # Next.js frontend
├── server/          # Apollo Server backend
└── README.md        # This file
```

See individual README files in client and server directories for component-specific details.
