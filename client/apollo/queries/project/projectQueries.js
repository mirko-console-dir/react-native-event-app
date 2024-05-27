import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    getProjects {
      id
      title
      owner {
        id
        fullname
      }
      expireDate
      status
      todos {
        id
        content
        expireDate
        comments {
          id
          commentText
          author {
            id
            fullname
            avatar
          }
        }
        images {
          imageName
        }
        checkedStatus
        project 
      }
      collaborators {
        id
        fullname
        email
        avatar
      }
    }
  }
`;
