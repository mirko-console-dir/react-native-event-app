import { gql } from '@apollo/client';

export const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      content
      expireDate
      images {
        imageName
      }
      checkedStatus
      project
    }
  }
`;

export const CHECKED_TODO = gql`
  mutation CheckedTodo($todoId: ID!, $input: CheckedStatusTodoInput!) {
    checkedStatusTodo(todoId: $todoId, input: $input)
  }
`;

export const EDIT_TODO = gql`
  mutation EditTodo($todoId: ID!, $input: EditTodoInput!) {
    editTodo(todoId: $todoId, input: $input)
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($todoId: ID!) {
    deleteTodo(ID: $todoId)
  }
`;

export const ADD_COMMENT_TODO = gql`
  mutation AddCommentTodo($todoId: ID!, $input: AddCommentTodoInput!) {
    addCommentTodo(todoId: $todoId, input: $input){
      id
      commentText
      author {
        id
        fullname
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

export const EDIT_COMMENT_TODO = gql`
  mutation EditTodo($todoId: ID!, $commentId: ID!, $input: EditCommentTodoInput!) {
    editCommentTodo(todoId: $todoId, commentId: $commentId, input: $input)
  }
`;

export const DELETE_COMMENT_TODO = gql`
  mutation DeleteCommentTodo($todoId: ID!, $commentId: ID!) {
    deleteCommentTodo(todoId: $todoId, commentId: $commentId)
  }
`;

export const DELETE_IMAGE_TODO = gql`
  mutation DeleteImageTodo($todoId: ID!, $imageId: ID!, $imageName: String!) {
    deleteTaskImage(todoId: $todoId, imageId: $imageId, imageName: $imageName)
  }
`;