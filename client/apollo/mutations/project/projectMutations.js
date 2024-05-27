import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title 
      owner{
        id
        fullname
      }
      todos{
        id
      }
      collaborators {
        id
      }
      expireDate
      status
    }
  }
`;

export const ADD_COLLABORATOR_TO_PROJECT = gql`
  mutation AddCollaboratorToProject($projectId: ID!, $collaboratorEmails: [String!]!) {
    addCollaboratorToProject(projectId: $projectId, collaboratorEmails: $collaboratorEmails) {
        id
        fullname
        email
        avatar
    }
  }
`;

export const DELETE_COLLABORATOR_PROJECT = gql`
  mutation DeleteCollaboratorProject($projectId: ID!, $collaboratorId: ID!) {
    deleteCollaboratorProject(projectId: $projectId, collaboratorId: $collaboratorId)
  }
`;

export const EDIT_PROJECT = gql`
  mutation EditProject($projectId: ID!, $input: EditProjectInput!) {
    editProject(projectId: $projectId, input: $input) {
      id
      title
      expireDate
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(id: $projectId)
  }
`;
