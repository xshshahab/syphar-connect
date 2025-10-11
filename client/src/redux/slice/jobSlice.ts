import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Job, JobState } from "../types/jobTypes";

const initialState: JobState = {
  loading: false,
  allJobs: [],
  singleJob: null,
  adminAllJobs: [],
  error: undefined,
  allAppliedJobs: [],
  searchQuery: "",
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAllJobs: (state, action: PayloadAction<Job[]>) => {
      state.allJobs = action.payload;
    },
    setSingleJob: (state, action: PayloadAction<Job>) => {
      state.singleJob = action.payload;
    },
    setAdminAllJobs: (state, action: PayloadAction<Job[]>) => {
      state.adminAllJobs = action.payload;
    },
    setAllAppliedJobs: (state, action) => {
      state.allAppliedJobs = action.payload;
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setLoading,
  setAllJobs,
  setSingleJob,
  setError,
  setAllAppliedJobs,
  setAdminAllJobs,
  setSearchQuery,
} = jobSlice.actions;
export default jobSlice.reducer;
