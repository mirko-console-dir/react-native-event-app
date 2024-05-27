import { gql } from '@apollo/client';

export const TASK_CREATED = gql`
  subscription taskCreated {
    taskCreated {
      todo {
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
  }
`;
export const TASK_DELETED = gql`
  subscription taskDeleted {
    taskDeleted {
      projectId,
      todoId
    }
  }
`;
export const TASK_CHECKED_STATUS = gql`
  subscription taskCheckedStatus {
    taskCheckedStatus {
      projectId,
      todoId
    }
  }
`;

export const COMMENT_CREATED = gql`
  subscription CommentCreated {
    commentCreated {
      comment {
        id
        commentText
        author {
          id
          fullname
        }
      }
      projectId
      todoId
    }
  }
`;

export const COMMENT_UPDATED = gql`
  subscription CommentUpdated {
    commentUpdated {
      comment {
        id
        commentText
        author {
          id
          fullname
        }
      }
      projectId
      todoId
    }
  }
`;

export const COMMENT_DELETED = gql`
  subscription CommentDeleted {
    commentDeleted {
      commentId
      projectId
      todoId
    }
  }
`;

