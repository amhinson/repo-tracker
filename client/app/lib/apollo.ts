import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
