'use client';

import { gql, useQuery } from '@apollo/client';

const TEST_QUERY = gql`
  query {
    hello
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(TEST_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>{data.hello}</div>;
}
