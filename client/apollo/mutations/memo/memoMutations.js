import { gql } from '@apollo/client';

export const CREATE_MEMO = gql`
mutation CreateMemo($input: CreateMemoInput!) {
    createMemo(input: $input) {
      id
      title
      content 
      owner{
        id
        fullname
      }
    }
  }
`;

export const EDIT_MEMO = gql`
  mutation EditMemo($memoId: ID!, $input: EditMemoInput!) {
    editMemo(memoId: $memoId, input: $input) {
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

export const DELETE_MEMO = gql`
  mutation DeleteMemo($memoId: ID!) {
    deleteMemo(id: $memoId)
  }
`;
