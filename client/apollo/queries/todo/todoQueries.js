import { gql } from '@apollo/client';

export const GET_TODO_IMAGES = gql`
  query GetTodoImages($todoId: ID!) {
    getTodoImages(todoId: $todoId) {
      id
      imageName
      url
    }
  }
`;