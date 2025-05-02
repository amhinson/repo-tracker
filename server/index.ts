import { ApolloServer, gql } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { fetchRepoDetails, fetchLatestRelease } from './services/github';
import { IncomingMessage } from 'http';

interface Context {
  user: {
    id: string;
    email: string;
  };
}

interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string | null;
}

interface UserRepository {
  userId: string;
  repositoryId: string;
  repository: Repository;
}

const prisma = new PrismaClient();

const typeDefs = gql`
  type Repository {
    id: ID!
    fullName: String!
    description: String
    releases: [Release!]!
  }

  type Release {
    id: ID!
    version: String!
    publishedAt: String!
    notes: String
    seen: Boolean!
  }

  type Query {
    repositories: [Repository!]!
  }

  type Mutation {
    addRepository(fullName: String!): Repository!
    markReleaseSeen(releaseId: ID!): Boolean!
    refreshAllRepositories: [Repository!]!
    removeRepository(fullName: String!): Boolean!
  }
`;

const resolvers = {
  Query: {
    repositories: async (_: unknown, __: unknown, context: Context) => {
      const { user } = context;
      const tracked = await prisma.userRepository.findMany({
        where: { userId: user.id },
        include: {
          repository: {
            include: {
              releases: {
                orderBy: { publishedAt: 'desc' },
              },
            },
          },
        },
      });

      return tracked.map((r: UserRepository) => r.repository);
    },
  },

  Repository: {
    releases: async (repo: Repository, _: unknown, context: Context) => {
      const { user } = context;

      const releases = await prisma.release.findMany({
        where: { repositoryId: repo.id },
        orderBy: { publishedAt: 'desc' },
      });

      const seen = await prisma.seenRelease.findMany({
        where: {
          userId: user.id,
          releaseId: { in: releases.map((r: { id: string }) => r.id) },
        },
        select: { releaseId: true },
      });

      const seenSet = new Set(seen.map((s: { releaseId: string }) => s.releaseId));

      return releases.map(
        (r: { id: string; version: string; publishedAt: Date; notes: string | null }) => ({
          ...r,
          seen: seenSet.has(r.id),
        }),
      );
    },
  },

  Mutation: {
    addRepository: async (_: unknown, { fullName }: { fullName: string }, context: Context) => {
      const { user } = context;
      const repoData = await fetchRepoDetails(fullName);
      const latestRelease = await fetchLatestRelease(fullName);

      // Ensure repo exists globally
      const repo = await prisma.repository.upsert({
        where: { fullName },
        create: {
          ...repoData,
          releases: latestRelease
            ? {
                create: {
                  version: latestRelease.version,
                  publishedAt: latestRelease.publishedAt,
                  notes: latestRelease.notes,
                },
              }
            : undefined,
        },
        update: {},
      });

      // Connect repo to user if not already tracked
      await prisma.userRepository.upsert({
        where: {
          userId_repositoryId: {
            userId: user.id,
            repositoryId: repo.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          repositoryId: repo.id,
        },
      });

      return repo;
    },

    markReleaseSeen: async (_: unknown, { releaseId }: { releaseId: string }, context: Context) => {
      const { user } = context;

      await prisma.seenRelease.upsert({
        where: {
          userId_releaseId: {
            userId: user.id,
            releaseId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          releaseId,
        },
      });

      return true;
    },

    refreshAllRepositories: async (_: unknown, __: unknown, context: Context) => {
      const { user } = context;

      const tracked = await prisma.userRepository.findMany({
        where: { userId: user.id },
        include: { repository: true },
      });

      for (const record of tracked) {
        const repo = record.repository;
        const latest = await fetchLatestRelease(repo.fullName);
        if (!latest) continue;

        const exists = await prisma.release.findFirst({
          where: {
            repositoryId: repo.id,
            version: latest.version,
          },
        });

        if (!exists) {
          await prisma.release.create({
            data: {
              version: latest.version,
              publishedAt: latest.publishedAt,
              notes: latest.notes,
              repositoryId: repo.id,
            },
          });
        }
      }

      return tracked.map((r: UserRepository) => r.repository);
    },

    removeRepository: async (_: unknown, { fullName }: { fullName: string }, context: Context) => {
      const { user } = context;

      const repo = await prisma.repository.findUnique({ where: { fullName } });
      if (!repo) return false;

      await prisma.userRepository.deleteMany({
        where: {
          userId: user.id,
          repositoryId: repo.id,
        },
      });

      return true;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req: IncomingMessage }) => {
    const email = req.headers['x-user-email'] as string;
    if (!email) throw new Error('Missing user email in header');

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return { user };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
