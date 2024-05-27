import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../src/reduxReducers/userSlice"
import projectReducer from "../src/reduxReducers/projectSlice"
import memoReducer from "../src/reduxReducers/memoSlice"


export const store = configureStore({
    reducer: {
        user: userReducer,
        projects: projectReducer,
        memos: memoReducer
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check, in Prod switch to TRUE
    }),
});
export type RootState = ReturnType<typeof store.getState>;
