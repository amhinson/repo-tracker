# Repository Tracker - Backend

Apollo Server backend for the Repository Release Tracker. See the [root README](../README.md) for full project documentation.

## Quick Start

```bash
npm install
npm prisma migrate dev
npm dev
```

## Structure

```
server/
├── prisma/        # Database schema and migrations
├── services/      # External service integrations
└── index.ts       # Server entry point
```

## Development

- Built with Apollo Server
- Uses Prisma for database access
- PostgreSQL database
- GitHub API integration

For full setup instructions and documentation, see the [root README](../README.md).
