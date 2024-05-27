import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Memo, MemoState } from '../utils/interfaces/types';

const initialState: MemoState = {
  memos: [],
};

const memoSlice = createSlice({
  name: 'memos',
  initialState,
  reducers: {
    setMemos(state, action: PayloadAction<Memo[]>) {
      state.memos = action.payload;
    },
    addMemo(state, action: PayloadAction<Memo>) {
      return {
        ...state,
        memos: [...state.memos, action.payload]
      };
    },
    updateMemo(state, action: PayloadAction<Memo>) {
      const editedMemo = action.payload;

      state.memos = state.memos.map((memo) =>
        memo.id === editedMemo.id ? editedMemo : memo
      );
    },
    deleteStoredMemo(state, action: PayloadAction<string>) {
      const memoId = action.payload;
      state.memos = state.memos.filter((memo) => memo.id !== memoId);
    },
  },
});

export const {
  setMemos,
  addMemo,
  updateMemo,
  deleteStoredMemo
} = memoSlice.actions;

export default memoSlice.reducer;
