import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {UserLoggedInState, UserLoggedIn, Collaborator } from '../utils/interfaces/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: UserLoggedInState = {
  user: {
    id: '',
    fullname: '',
    email: '',
    avatar: {},
    collaborators: []
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserLoggedIn>) {
      state.user = action.payload;
    },
    updateUser(state, action: PayloadAction<UserLoggedIn>) {
      state.user = action.payload;
    },
    addCollaboratorUser(state, action: PayloadAction<{ collaborators: Collaborator[] }>) {
      const { collaborators } = action.payload;
      const user = state.user
      // Check if the collaborator with the same id already exists
      const newCollaborators = collaborators.filter((collaborator) => {
        return !user.collaborators.some((existingCollaborator) => {
          return existingCollaborator.id === collaborator.id;
        });
      });
      // Concatenate the new collaborators to the existing list
      user.collaborators = user.collaborators.concat(newCollaborators);
      
      AsyncStorage.setItem('user', JSON.stringify(user));

    },
    deleteCollaboratorFromUser(state, action: PayloadAction<{ collaboratorId: string }>) {
      const { collaboratorId } = action.payload;
      const user = state.user
      user.collaborators = user.collaborators.filter((collab) => collab.id !== collaboratorId);
      AsyncStorage.setItem('user', JSON.stringify(user));
    },
  },
});

export const {
  setUser,
  updateUser,
  addCollaboratorUser,
  deleteCollaboratorFromUser
} = userSlice.actions;

export default userSlice.reducer;
