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
    refreshAllRepositories: [Repository!]!
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
    refreshAllRepositories: async () => {
      const allRepos = await prisma.repository.findMany();

      for (const repo of allRepos) {
        const latest = await fetchLatestRelease(repo.fullName);
        if (!latest) continue;

        const existing = await prisma.release.findFirst({
          where: {
            repositoryId: repo.id,
            version: latest.version,
          },
        });

        if (!existing) {
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

      return await prisma.repository.findMany({ include: { releases: true } });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
