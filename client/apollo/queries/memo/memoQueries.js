import { gql } from '@apollo/client';

export const GET_ALL_MEMO = gql`
  query GetMemos {
    getMemos {
      id
      title
      content
      owner {
        id
        fullname
      }
    }
  }
`;
