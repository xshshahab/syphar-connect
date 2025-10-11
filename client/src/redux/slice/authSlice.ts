import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../types/authTypes";

const initialState: AuthState = {
  loading: false,
  user: null,
  error: undefined,
  allUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setAllUsers: (state, action: PayloadAction<User[]>) => {
      state.allUsers = action.payload;
    },
    logout: () => initialState,
  },
});

export const { setLoading, setUser, setAllUsers, logout } = authSlice.actions;
export default authSlice.reducer;
