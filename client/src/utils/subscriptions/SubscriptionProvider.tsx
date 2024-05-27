import { useSubscription } from '@apollo/client';
import { TASK_CREATED, TASK_DELETED, TASK_CHECKED_STATUS, COMMENT_CREATED, COMMENT_UPDATED, COMMENT_DELETED } from '../../../apollo/subscriptions/todo/todoSubscriptions';
import { EVENT_UPDATED,EVENT_DELETED,EVENT_ADD_COLLABORATORS,DELETED_COLLABORATOR } from '../../../apollo/subscriptions/project/projectSubscriptions';

import { useDispatch } from 'react-redux';
import { deleteStoredProject, updateProject,addCollaboratorsToProject, deleteCollaboratorFromProject,addTaskToProject, deleteTaskFromProject, editCheckedStatusTask, addCommentToTask, updateCommentFromTask, deleteCommentFromTask } from '../../reduxReducers/projectSlice';
import { addCollaboratorUser } from '../../reduxReducers/userSlice';

const SubscriptionProvider = ({ children }:any) => {
  useActivateSubscriptions();

  return children;
};

const useActivateSubscriptions = () => {
  const dispatch = useDispatch()
  useSubscription(EVENT_UPDATED, {
    onData: ({ data }) => {
      if (data.data.eventUpdated) {
        dispatch(updateProject({projectId: data.data.eventUpdated.projectId, title: data.data.eventUpdated.title, expireDate: data.data.eventUpdated.expireDate}))
      }
    },
  });
  useSubscription(EVENT_DELETED, {
    onData: ({ data }) => {
      if (data.data.eventDeleted) {
        dispatch(deleteStoredProject(data.data.eventDeleted.projectId))
      }
    },
  });
  useSubscription(EVENT_ADD_COLLABORATORS, {
    onData: ({ data }) => {
      if (data.data.eventAddCollab) {
        dispatch(addCollaboratorsToProject({projectId: data.data.eventAddCollab.projectId, collaborators: data.data.eventAddCollab.collaborators}))
        dispatch(addCollaboratorUser({collaborators: data.data.eventAddCollab.collaborators}))
      }
    },
  });
  useSubscription(DELETED_COLLABORATOR, {
    onData: ({ data }) => {
      if (data.data.eventDeletedCollab) {
        dispatch(deleteCollaboratorFromProject({projectId: data.data.eventDeletedCollab.projectId, collaboratorId: data.data.eventDeletedCollab.collaboratorId}))
      }
    },
  });
  useSubscription(TASK_CREATED, {
    onData: ({ data }) => {
      if (data.data.taskCreated) {
        dispatch(addTaskToProject({projectId: data.data.taskCreated.todo.project, task: data.data.taskCreated.todo}))
      }
    },
  });
  useSubscription(TASK_DELETED, {
    onData: ({ data }) => {
      if (data.data.taskDeleted) {
        dispatch(deleteTaskFromProject({projectId: data.data.taskDeleted.projectId, taskId: data.data.taskDeleted.todoId}))
      }
    },
  });
  useSubscription(TASK_CHECKED_STATUS, {
    onData: ({ data }) => {
      if (data.data.taskCheckedStatus) {
        dispatch(editCheckedStatusTask({projectId: data.data.taskCheckedStatus.projectId, taskId: data.data.taskCheckedStatus.todoId}))
      }
    },
  });
  useSubscription(COMMENT_CREATED, {
    onData: ({ data }) => {
      if (data.data.commentCreated) {
        const comment = data.data.commentCreated.comment 
        const projectId = data.data.commentCreated.projectId 
        const todoId = data.data.commentCreated.todoId 
        dispatch(addCommentToTask({projectId: projectId, taskId: todoId, comment: comment}))
      }
    },
  });
  useSubscription(COMMENT_UPDATED, {
    onData: ({ data }) => {
      if (data.data.commentUpdated) {
        const comment = data.data.commentUpdated.comment 
        dispatch(updateCommentFromTask({projectId: data.data.commentUpdated.projectId, taskId: data.data.commentUpdated.todoId, commentId: comment.id,commentText: comment.commentText}))
      }
    },
  });
  useSubscription(COMMENT_DELETED, {
    onData: ({ data }) => {
      if (data.data.commentDeleted) {
        const commentId = data.data.commentDeleted.commentId 
        const projectId = data.data.commentDeleted.projectId 
        const todoId = data.data.commentDeleted.todoId 
        console.log('====================================');
        console.log('arrived');
        console.log('====================================');
        dispatch(deleteCommentFromTask({projectId: projectId, taskId: todoId, commentId: commentId}))
      }
    },
  });
};

export default SubscriptionProvider;
