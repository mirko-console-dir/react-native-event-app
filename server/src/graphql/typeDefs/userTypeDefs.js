// type definition of the schema we gonna use in graphql query, mutations all we want to do
import { gql } from 'graphql-tag'

export default gql`
    scalar Buffer
    type Query {
        hello: String!
        getUsers: [User!]
        getUser(ID: ID!): User
    }
    type AuthPayload {
        accessToken: String
        refreshToken: String
        user: User
        errors: [String]
    }
    type Mutation {
        createUser(input: CreateUserInput!): AuthPayload!
        loginUser(input: LoginInput): AuthPayload!
        editUser(input: EditUserInput): User!
        addCollaboratorToUser(collaboratorEmail: String!): User!
        deleteCollaboratorUser(collaboratorId: ID!): Boolean!
    }
    type User {
        id: ID
        fullname: String
        email: String
        password: String
        avatar: Buffer
        collaborators: [User]
        createdAt: String
        updatedAt: String
    }
    input CreateUserInput {
      fullname: String!
      email: String!
      password: String!
      avatar: Buffer
    }
    input EditUserInput {
        fullname: String
        email: String
        password: String
        avatar: Buffer
      }
    input LoginInput {
        fullname: String
        email: String
        password: String
    }
`;
  