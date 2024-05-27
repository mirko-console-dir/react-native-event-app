import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectState, Project, Todo, Comment, Collaborator } from '../utils/interfaces/types';

const initialState: ProjectState = {
  projects: [],
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload;
    },
    addProject(state, action: PayloadAction<Project>) {
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    },
    updateProject(state, action: PayloadAction<{ projectId: string; title: string; expireDate: string }>) {
      const { projectId, title, expireDate } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if(project){
        project.title = title;
        project.expireDate = expireDate;
      }
    },
    deleteStoredProject(state, action: PayloadAction<string>) {
      const projectId = action.payload;
      state.projects = state.projects.filter((project) => project.id !== projectId);
    },
    addTaskToProject(state, action: PayloadAction<{ projectId: string; task: Todo }>) {
      const { projectId, task } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.todos.push(task);
      }
    },
    addCommentToTask(state, action: PayloadAction<{ projectId: string; taskId: string, comment: Comment }>){
      const { projectId, taskId, comment } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        const task = project.todos.find((t) => t.id === taskId);
        if(task){
          task.comments.push(comment);
        }
      }
    },
    updateCommentFromTask(state, action: PayloadAction<{ projectId: string; taskId: string, commentId: string, commentText: string }>){
      const { projectId, taskId, commentId, commentText} = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        const task = project.todos.find((t) => t.id === taskId);
        if(task){
          const comment = task.comments.find((c) => c.id === commentId);
          if(comment){
            comment.commentText = commentText
          }
        }
      }
    },
    editTaskInProject(state, action: PayloadAction<{ projectId: string; task: Todo }>) {
      const { projectId, task } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.todos = project.todos.map((t) => (t.id === task.id ? task : t));
      }
    },
    editCheckedStatusTask(state, action: PayloadAction<{ projectId: string; taskId: string;}>) {
      const { projectId, taskId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        const task = project.todos.find((t) => t.id === taskId);
        if (task) {
          task.checkedStatus = !task.checkedStatus;
        }
        const todosLenght = project.todos.length
        let checkedTodos = 0
        project.todos.forEach(todo => {
            if(todo.checkedStatus){
                checkedTodos ++
            }
        }) 
        if(todosLenght == checkedTodos){
            project.status = 'Completed'
        } else if (todosLenght > checkedTodos && checkedTodos !== 0) {
            project.status = 'In Progress'
        } else {
            project.status = 'Pending'
        }
      }
    },
    deleteTaskFromProject(state, action: PayloadAction<{ projectId: string; taskId: string }>) {
      const { projectId, taskId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.todos = project.todos.filter((t) => t.id !== taskId);
      }
    },
    deleteImageFromTask(state, action: PayloadAction<{ projectId: string; taskId: string; imageName: string }>) {
      const { projectId, taskId, imageName } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        const task = project.todos.find((t) => t.id === taskId);
        if (task) {
          task.images = task.images.filter((i) => i.imageName !== imageName);
        }
      }
    },
    deleteCommentFromTask(state, action: PayloadAction<{ projectId: string; taskId: string; commentId: string }>) {
      const { projectId, taskId, commentId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        const task = project.todos.find((t) => t.id === taskId);
        if (task) {
          task.comments = task.comments.filter((c) => c.id !== commentId);
        }
      }
    },
    addCollaboratorsToProject(state, action: PayloadAction<{ projectId: string; collaborators: Collaborator[] }>) {
      const { projectId, collaborators } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        // Check if the collaborator with the same id already exists
        const newCollaborators = collaborators.filter((collaborator) => {
          return !project.collaborators.some((existingCollaborator) => {
            return existingCollaborator.id === collaborator.id;
          });
        });
        // Concatenate the new collaborators to the existing list
        project.collaborators = project.collaborators.concat(newCollaborators);
      }
    },
    deleteCollaboratorFromProject(state, action: PayloadAction<{ projectId: string; collaboratorId: string }>) {
      const { projectId, collaboratorId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.collaborators = project.collaborators.filter((collab) => collab.id !== collaboratorId);
      }
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  deleteStoredProject,
  addTaskToProject,
  addCommentToTask,
  updateCommentFromTask,
  editTaskInProject,
  editCheckedStatusTask,
  deleteTaskFromProject,
  deleteImageFromTask,
  deleteCommentFromTask,
  addCollaboratorsToProject,
  deleteCollaboratorFromProject
} = projectSlice.actions;

export default projectSlice.reducer;
