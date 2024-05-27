import { gql } from '@apollo/client';

export const EVENT_UPDATED = gql`
  subscription EventUpdated {
    eventUpdated {
      projectId
      title 
      expireDate
    }
  }
`;
export const EVENT_DELETED = gql`
  subscription EventDeleted {
    eventDeleted {
      projectId
    }
  }
`;
export const EVENT_ADD_COLLABORATORS = gql`
  subscription EventAddCollab {
    eventAddCollab {
      projectId
      collaborators {
        id
        fullname
        email
        avatar
      }
    }
  }
`;
export const DELETED_COLLABORATOR = gql`
  subscription EventDeletedCollab {
    eventDeletedCollab {
      projectId
      collaboratorId
    }
  }
`;



