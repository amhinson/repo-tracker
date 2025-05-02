import { ApolloServer, gql } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { fetchRepoDetails, fetchLatestRelease } from './services/github';
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
    markReleaseSeen(releaseId: ID!): Release!
    refreshRepository(fullName: String!): Repository!
  }
`;

const resolvers = {
  Query: {
    repositories: async () => {
      return prisma.repository.findMany({
        include: { releases: true },
      });
    },
  },
  Mutation: {
    addRepository: async (_: unknown, { fullName }: { fullName: string }) => {
      const repoData = await fetchRepoDetails(fullName);
      const latestRelease = await fetchLatestRelease(fullName);

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
        include: { releases: true },
      });

      return repo;
    },
    markReleaseSeen: async (_: unknown, { releaseId }: { releaseId: string }) => {
      return prisma.release.update({
        where: { id: releaseId },
        data: { seen: true },
      });
    },
    refreshRepository: async (_: unknown, { fullName }: { fullName: string }) => {
      const latestRelease = await fetchLatestRelease(fullName);
      if (!latestRelease)
        return prisma.repository.findUnique({ where: { fullName }, include: { releases: true } });

      const repo = await prisma.repository.findUnique({ where: { fullName } });
      if (!repo) throw new Error('Repository not found');

      const existingRelease = await prisma.release.findFirst({
        where: {
          repositoryId: repo.id,
          version: latestRelease.version,
        },
      });

      if (!existingRelease) {
        await prisma.release.create({
          data: {
            version: latestRelease.version,
            publishedAt: latestRelease.publishedAt,
            notes: latestRelease.notes,
            repositoryId: repo.id,
          },
        });
      }

      return prisma.repository.findUnique({ where: { fullName }, include: { releases: true } });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
