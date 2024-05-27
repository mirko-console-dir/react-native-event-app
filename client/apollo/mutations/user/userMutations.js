import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      accessToken
      refreshToken
      user {
        id
        fullname
        email
        avatar
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user {
        id
        fullname
        email
        avatar
        collaborators {
          id
          fullname
          email
          avatar
        }
      }
    }
  }
`; 

export const EDIT_USER = gql`
  mutation EditUser($input: EditUserInput) {
    editUser(input: $input) {
      id
      fullname
      email
      avatar
      collaborators {
        id
        fullname
        email
        avatar
      }
    }
  }
`;

export const ADD_COLLABORATOR_USER = gql`
  mutation AddCollaboratorToUser($collaboratorEmail: String!) {
    addCollaboratorToUser(collaboratorEmail: $collaboratorEmail) {
        id
        fullname
        email
        avatar
    }
  }
`;

export const DELETE_COLLABORATOR = gql`
  mutation DeleteCollaboratorFromUser( $collaboratorId: ID!) {
    deleteCollaboratorUser(collaboratorId: $collaboratorId)
  }
`;