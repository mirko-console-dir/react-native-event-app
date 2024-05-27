import { gql } from 'graphql-tag';

export default gql`
    extend type Query {
        getMemo(id: ID!): Memo!
        getMemos: [Memo!]!
    }
    extend type Mutation {
        createMemo(input: CreateMemoInput!): Memo!
        editMemo(memoId: ID!, input: EditMemoInput!): Memo!
        deleteMemo(id: ID!): Boolean!
    }
    input CreateMemoInput {
        title: String!
        content: String!
    }
    input EditMemoInput {
        title: String
        content: String
    }
    type Memo {
        id: ID!
        title: String!
        content: String!
        owner: User!
        expireDate: String
    } 
`;
