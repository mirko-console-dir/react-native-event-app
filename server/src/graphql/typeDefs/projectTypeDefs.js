import { gql } from 'graphql-tag';

export default gql`
    extend type Query {
        getProject(id: ID!): Project!
        getProjects: [Project!]!
    }
    extend type Mutation {
        createProject(input: CreateProjectInput!): Project!
        editProject(projectId: ID!, input: EditProjectInput!): EditedProject!
        deleteProject(id: ID!): Boolean!
        addTodoToProject(projectId: ID!, todoId: ID!): Project!
        addCollaboratorToProject(projectId: ID!, collaboratorEmails: [String!]!): [Collaborator!]!
        deleteCollaboratorProject(projectId: ID!, collaboratorId: ID!): Boolean!
    }
    type Collaborator {
        id: ID!
        fullname: String!
        email: String!
        avatar: Buffer
    }
    input CreateProjectInput {
        title: String!
        expireDate: String!
    }
    input EditProjectInput {
        title: String
        expireDate: String
    }

    type EditedProject {
        id: ID!
        title: String!
        expireDate: String
    }

    type Project {
        id: ID!
        title: String!
        todos: [Todo]
        status: String!
        owner: User!
        collaborators: [User]
        expireDate: String
    } 
    type Subscription {
        eventUpdated: ProjectSubscriptionPayload
        eventDeleted: ProjectDeleteSubscriptionPayload
        eventAddCollab: ProjectCollabSubscriptionPayload
        eventDeletedCollab: ProjectDeletedCollabSubscriptionPayload
    }
    type ProjectSubscriptionPayload {
        projectId: ID
        title: String
        expireDate: String
    }
    type ProjectDeleteSubscriptionPayload {
        projectId: ID
    }
    type ProjectCollabSubscriptionPayload {
        projectId: ID
        collaborators: [Collaborator]
    }
    type ProjectDeletedCollabSubscriptionPayload {
        projectId: ID
        collaboratorId: ID
    }
`;
